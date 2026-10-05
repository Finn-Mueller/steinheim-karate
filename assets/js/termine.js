(function () {
    const eventList = document.getElementById('events');
    if (!eventList || typeof EVENTS === 'undefined') return;

    /* ---------- Datum ---------- */

    // "JJJJ-MM-TT" als lokales Datum lesen (new Date("...") würde UTC verwenden)
    function parseLocalDate(str) {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    const fmtFull  = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const fmtRange = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
    const fmtMonth = new Intl.DateTimeFormat('de-DE', { month: 'short' });

    function formatDateText(ev) {
        const start = parseLocalDate(ev.start);
        if (!ev.ende || ev.ende === ev.start) return fmtFull.format(start);

        const end = parseLocalDate(ev.ende);
        const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
        return sameMonth
            ? `${start.getDate()}. – ${fmtRange.format(end)}`
            : `${fmtRange.format(start)} – ${fmtRange.format(end)}`;
    }

    function formatMeta(ev) {
        const parts = [formatDateText(ev)];
        if (ev.von) parts.push(ev.bis ? `${ev.von} – ${ev.bis} Uhr` : `${ev.von} Uhr`);
        return parts.join(' · ');
    }

    function mapsUrl(ev) {
        const query = ev.adresse ? ` ${ev.adresse}` : ev.ort;
        return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
    }

    /* ---------- .ics erzeugen ---------- */

    const pad = (n) => String(n).padStart(2, '0');
    const icsDate = (d) => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    const icsTime = (t) => t.replace(':', '') + '00';
    const icsEscape = (s) => String(s)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');

    function slugify(s) {
        return s.toLowerCase()
            .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function buildIcs(ev) {
        const start = parseLocalDate(ev.start);
        const end = parseLocalDate(ev.ende || ev.start);
        const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Kempoka Ryu Steinheim//Termine//DE',
            'CALSCALE:GREGORIAN',
            'BEGIN:VEVENT',
            `UID:${ev.start}-${slugify(ev.titel)}@kempoka-ryu`,
            `DTSTAMP:${stamp}`
        ];

        if (ev.von) {
            // Mit Uhrzeit (lokale Zeit, ohne Zeitzonenangabe)
            lines.push(`DTSTART:${icsDate(start)}T${icsTime(ev.von)}`);
            if (ev.bis) lines.push(`DTEND:${icsDate(end)}T${icsTime(ev.bis)}`);
            else lines.push('DURATION:PT1H');
        } else {
            // Ganztägig: DTEND ist der Tag NACH dem letzten Tag
            const endExclusive = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
            lines.push(`DTSTART;VALUE=DATE:${icsDate(start)}`);
            lines.push(`DTEND;VALUE=DATE:${icsDate(endExclusive)}`);
        }

        lines.push(`SUMMARY:${icsEscape(ev.titel)}`);
        if (ev.ort)  lines.push(`LOCATION:${icsEscape(ev.adresse ? `${ev.ort}, ${ev.adresse}` : ev.ort)}`);
        if (ev.text) lines.push(`DESCRIPTION:${icsEscape(ev.text)}`);
        lines.push('END:VEVENT', 'END:VCALENDAR');

        return lines.join('\r\n');
    }

    function downloadIcs(ev) {
        const blob = new Blob([buildIcs(ev)], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slugify(ev.titel)}-${ev.start}.ics`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /* ---------- Karten aufbauen ---------- */

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function createCard(ev, isNext) {
        const start = parseLocalDate(ev.start);

        const card = el('li', 'event-card');
        if (ev.ausfall) card.classList.add('event-card-frei');
        if (isNext) card.classList.add('is-next');

        const time = el('time', 'event-date');
        time.dateTime = ev.start;
        time.append(
            el('span', 'event-date-day', String(start.getDate())),
            el('span', 'event-date-month', fmtMonth.format(start).replace('.', ''))
        );

        const body = el('div', 'event-body');
        body.append(el('span', 'event-type', ev.typ));
        if (isNext) body.append(el('span', 'event-next-label', 'Als Nächstes'));
        body.append(el('h2', 'event-title', ev.titel));
        body.append(el('p', 'event-meta', formatMeta(ev)));

        if (ev.ort) {
            const loc = el('p', 'event-location');
            const link = el('a', null, ev.ort);
            link.href = mapsUrl(ev);
            link.target = '_blank';
            link.rel = 'noopener';
            link.setAttribute('aria-label', `${ev.ort} in der Karten-App öffnen`);
            loc.append(link);
            body.append(loc);
        }

        if (ev.text) body.append(el('p', 'event-text', ev.text));

        const button = el('button', 'event-add', 'In Kalender speichern');
        button.type = 'button';
        button.setAttribute('aria-label', `${ev.titel} in den eigenen Kalender speichern`);
        button.addEventListener('click', () => downloadIcs(ev));
        body.append(button);

        card.append(time, body);
        return card;
    }

    /* ---------- Vergangenes ausblenden, nächsten hervorheben ---------- */

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = EVENTS
        .filter((ev) => parseLocalDate(ev.ende || ev.start) >= today)
        .sort((a, b) => a.start.localeCompare(b.start));

    const nextEvent = upcoming.find((ev) => !ev.ausfall);

    upcoming.forEach((ev) => eventList.append(createCard(ev, ev === nextEvent)));

    document.getElementById('events-empty').hidden = upcoming.length > 0;
})();