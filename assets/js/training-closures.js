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
    const formatMonth = new Intl.DateTimeFormat('de-DE', { month: 'short' });
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
        item.className = 'event-card event-card-frei event-card-closure';

        const date = document.createElement('time');
        date.className = 'event-date';
        date.dateTime = event.start;
        const dateDay = document.createElement('span');
        dateDay.className = 'event-date-day';
        dateDay.textContent = String(start.getDate());
        const dateMonth = document.createElement('span');
        dateMonth.className = 'event-date-month';
        dateMonth.textContent = formatMonth.format(start).replace('.', '');
        date.append(dateDay, dateMonth);

        const body = document.createElement('div');
        body.className = 'event-body';
        const type = document.createElement('span');
        type.className = 'event-type';
        type.textContent = 'Kein Training';
        const title = document.createElement('h3');
        title.className = 'event-title';
        title.textContent = event.titel;
        const period = document.createElement('p');
        period.className = 'event-meta';
        const sameMonth = start.getMonth() === end.getMonth()
            && start.getFullYear() === end.getFullYear();
        if (start.getTime() === end.getTime()) {
            period.textContent = formatDate.format(start);
        } else if (sameMonth) {
            period.textContent = `${start.getDate()}. – ${formatDate.format(end)}`;
        } else {
            period.textContent = `${formatDate.format(start)} – ${formatDate.format(end)}`;
        }

        body.append(type, title, period);
        item.append(date, body);
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
