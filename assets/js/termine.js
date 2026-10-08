(function () {
    const eventList = document.getElementById('events');
    if (typeof EVENTS === 'undefined') return;
    const featuredSection = document.getElementById('home-featured-event');
    const featuredEventList = document.getElementById('home-featured-events');

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

    function createCard(ev, isNext, showNextLabel = isNext) {
        const start = parseLocalDate(ev.start);

        const card = el('li', 'event-card');
        if (isNext) card.classList.add('is-next');

        const time = el('time', 'event-date');
        time.dateTime = ev.start;
        time.append(
            el('span', 'event-date-day', String(start.getDate())),
            el('span', 'event-date-month', fmtMonth.format(start).replace('.', ''))
        );

        const body = el('div', 'event-body');
        body.append(el('span', 'event-type', ev.typ));
        if (showNextLabel) body.append(el('span', 'event-next-label', 'Als Nächstes'));
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

    /* ---------- Vergangenes ausblenden, nächsten hervorheben ---------- */

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = EVENTS
        .filter((ev) => !ev.ausfall)
        .filter((ev) => parseLocalDate(ev.ende || ev.start) >= today)
        .sort((a, b) => a.start.localeCompare(b.start));

    if (eventList) {
        upcoming.forEach((event, index) => {
            eventList.append(createCard(event, index === 0));
        });

        const emptyState = document.getElementById('events-empty');
        if (emptyState) emptyState.hidden = upcoming.length > 0;
    }

    if (featuredSection && featuredEventList) {
        const featuredEvent = upcoming.find((event) => event.startseite);
        if (featuredEvent) {
            featuredEventList.append(createCard(featuredEvent, true, false));
            featuredSection.hidden = false;
        }
    }
})();
