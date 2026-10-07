import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const currentYear = new Date().getUTCFullYear();
const validFrom = `${currentYear}-01-01`;
const eventsSource = await readFile(new URL('../assets/data/events.js', import.meta.url), 'utf8');
const eventYears = [...eventsSource.matchAll(/["'](\d{4})-\d{2}-\d{2}["']/g)]
    .map((match) => Number(match[1]));
const validToYear = Math.max(currentYear + 2, ...eventYears);
const validTo = `${validToYear}-12-31`;
const apiBase = 'https://openholidaysapi.org';
const parameters = new URLSearchParams({
    countryIsoCode: 'DE',
    languageIsoCode: 'DE',
    validFrom,
    validTo,
    subdivisionCode: 'DE-NW'
});

async function fetchHolidays(endpoint) {
    const response = await fetch(`${apiBase}/${endpoint}?${parameters}`);
    if (!response.ok) {
        throw new Error(`OpenHolidays API ${endpoint}: HTTP ${response.status}`);
    }

    const holidays = await response.json();
    if (!Array.isArray(holidays)) {
        throw new Error(`OpenHolidays API ${endpoint} returned an invalid response`);
    }
    return holidays;
}

function holidayName(holiday) {
    const names = Array.isArray(holiday.name) ? holiday.name : [];
    const germanName = names.find((name) => name.language === 'DE');
    const name = germanName ? germanName.text : names[0] && names[0].text;
    if (!name) throw new Error('OpenHolidays API returned a holiday without a name');
    return name;
}

function toClosure(holiday, type) {
    const { startDate: start, endDate: end } = holiday;
    if (!isValidDate(start) || !isValidDate(end) || end < start) {
        throw new Error('OpenHolidays API returned an invalid holiday period');
    }

    return {
        start,
        ende: end,
        typ: type,
        titel: holidayName(holiday),
        ausfall: true
    };
}

function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getClosures(schoolHolidays, publicHolidays) {
    const schoolClosures = schoolHolidays.map((holiday) => toClosure(holiday, 'Schulferien'));
    const publicClosures = publicHolidays
        .map((holiday) => toClosure(holiday, 'Feiertag'))
        .filter((holiday) => !schoolClosures.some((schoolHoliday) => (
            holiday.start <= schoolHoliday.ende && holiday.ende >= schoolHoliday.start
        )));

    return [...schoolClosures, ...publicClosures]
        .sort((a, b) => a.start.localeCompare(b.start));
}

const [schoolHolidays, publicHolidays] = await Promise.all([
    fetchHolidays('SchoolHolidays'),
    fetchHolidays('PublicHolidays')
]);
if (schoolHolidays.length === 0 || publicHolidays.length === 0) {
    throw new Error('OpenHolidays API returned no school holidays or public holidays for NRW');
}
const closures = getClosures(schoolHolidays, publicHolidays);
const output = `window.HOLIDAY_CLOSURES = ${JSON.stringify(closures, null, 4)};\n`;
const outputPath = new URL('../assets/data/holiday-closures.js', import.meta.url);
await writeFile(fileURLToPath(outputPath), output, 'utf8');
console.log(`Updated ${closures.length} NRW training-free periods (${validFrom}–${validTo}).`);
