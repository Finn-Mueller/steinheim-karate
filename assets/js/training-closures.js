(async function () {
    const NOTICE_DAYS_BEFORE = 14; // Anzahl der Tage, die vor dem Ausfall angezeigt werden sollen
    const notice = document.getElementById('training-closures');
    const list = notice && notice.querySelector('.training-closures-list');
    if (!notice || !list) return;

    if (typeof EVENTS === 'undefined') {
        console.error('Die Termindaten für Trainingsausfälle konnten nicht geladen werden.');
        return;
    }

    function parseLocalDate(value) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const noticeLimit = new Date(today);
    noticeLimit.setDate(noticeLimit.getDate() + NOTICE_DAYS_BEFORE);

    const formatDate = new Intl.DateTimeFormat('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const formatDay = new Intl.DateTimeFormat('de-DE', { day: 'numeric' });
    const trainingWeekdays = window.getTrainingWeekdays();

    let closures = EVENTS.filter((event) => event.ausfall);
    let holidayDataError = false;

    if (typeof HOLIDAY_CLOSURES === 'undefined') {
        console.error('Die automatisch aktualisierten Ferien- und Feiertagsdaten konnten nicht geladen werden.');
        holidayDataError = true;
    } else {
        closures = closures.concat(HOLIDAY_CLOSURES.filter((event) => {
            const start = parseLocalDate(event.start);
            const end = parseLocalDate(event.ende || event.start);
            while (start <= end) {
                if (trainingWeekdays.has(start.getDay())) return true;
                start.setDate(start.getDate() + 1);
            }
            return false;
        }));
    }

    closures = closures
        .filter((event) => {
            const start = parseLocalDate(event.start);
            const end = parseLocalDate(event.ende || event.start);
            return end >= today && start <= noticeLimit;
        })
        .sort((a, b) => a.start.localeCompare(b.start));

    closures.forEach((event) => {
        const start = parseLocalDate(event.start);
        const end = parseLocalDate(event.ende || event.start);
        const item = document.createElement('li');
        const title = document.createElement('strong');
        const period = document.createElement('span');
        period.className = 'training-closure-period';

        title.textContent = `${event.titel}: `;
        const startDate = document.createElement('span');
        const sameMonth = start.getMonth() === end.getMonth()
            && start.getFullYear() === end.getFullYear();
        startDate.textContent = start.getTime() !== end.getTime() && sameMonth
            ? ` ${formatDay.format(start)}.`
            : ` ${formatDate.format(start)}`;
        period.append(startDate);

        if (start.getTime() !== end.getTime()) {
            const separator = document.createElement('span');
            separator.className = 'training-closure-range-separator';
            separator.textContent = '\u00a0–';

            const endDate = document.createElement('span');
            endDate.className = 'training-closure-end-date';
            endDate.textContent = ` ${formatDate.format(end)}`;
            period.append(separator, endDate);
        }

        item.append(title, period);
        list.append(item);
    });

    if (holidayDataError) {
        const item = document.createElement('li');
        item.className = 'training-closures-error';
        item.textContent = 'Ferien- und Feiertage konnten nicht geladen werden. Bitte vor dem Training die Durchführung prüfen.';
        list.append(item);
    }

    notice.hidden = closures.length === 0 && !holidayDataError;
})();
