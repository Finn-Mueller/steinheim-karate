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

        card.append(time, body);
        return card;
    }

    function createClosureCard(closure, isNext) {
        const start = parseLocalDate(closure.start);
        const card = el('li', 'event-card event-card-frei event-card-closure');
        if (isNext) card.classList.add('is-next');

        const time = el('time', 'event-date');
        time.dateTime = closure.start;
        time.append(
            el('span', 'event-date-day', String(start.getDate())),
            el('span', 'event-date-month', fmtMonth.format(start).replace('.', ''))
        );

        const body = el('div', 'event-body');
        body.append(el('span', 'event-type', closure.typ));
        if (isNext) body.append(el('span', 'event-next-label', 'Als Nächstes'));
        body.append(
            el('h2', 'event-title', closure.titel),
            el('p', 'event-meta', formatDateText(closure))
        );

        card.append(time, body);
        return card;
    }

    function includesTrainingDay(closure) {
        const date = parseLocalDate(closure.start);
        const end = parseLocalDate(closure.ende || closure.start);
        const trainingWeekdays = window.getTrainingWeekdays();

        while (date <= end) {
            if (trainingWeekdays.has(date.getDay())) return true;
            date.setDate(date.getDate() + 1);
        }
        return false;
    }

    /* ---------- Vergangenes ausblenden, nächsten hervorheben ---------- */

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = EVENTS
        .filter((ev) => parseLocalDate(ev.ende || ev.start) >= today)
        .sort((a, b) => a.start.localeCompare(b.start));

    const nextEvent = upcoming.find((ev) => !ev.ausfall);

    let upcomingClosures = [];
    const closureError = document.getElementById('closures-error');
    if (typeof HOLIDAY_CLOSURES === 'undefined') {
        console.error('Die automatisch aktualisierten Ferien- und Feiertagsdaten konnten nicht geladen werden.');
        if (closureError) closureError.hidden = false;
    } else {
        upcomingClosures = HOLIDAY_CLOSURES
            .filter((closure) => parseLocalDate(closure.ende || closure.start) >= today)
            .filter(includesTrainingDay)
            .sort((a, b) => a.start.localeCompare(b.start));
    }

    const timelineEnd = upcoming.reduce((latest, ev) => {
        const eventEnd = parseLocalDate(ev.ende || ev.start);
        return eventEnd > latest ? eventEnd : latest;
    }, today);
    const hasUpcomingEvents = upcoming.length > 0;
    const visibleClosures = hasUpcomingEvents
        ? upcomingClosures.filter((closure) => parseLocalDate(closure.start) <= timelineEnd)
        : upcomingClosures.slice(0, 1);
    const timelineItems = [
        ...upcoming.map((event) => ({ date: event.start, event })),
        ...visibleClosures.map((closure) => ({ date: closure.start, closure }))
    ].sort((a, b) => a.date.localeCompare(b.date));

    timelineItems.forEach(({ event, closure }) => {
        eventList.append(event
            ? createCard(event, event === nextEvent)
            : createClosureCard(closure, !hasUpcomingEvents));
    });

    document.getElementById('events-empty').hidden = timelineItems.length > 0;
})();