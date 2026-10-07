(function () {
    const weekdays = new Map([
        ['sonntag', 0],
        ['montag', 1],
        ['dienstag', 2],
        ['mittwoch', 3],
        ['donnerstag', 4],
        ['freitag', 5],
        ['samstag', 6]
    ]);

    window.getTrainingWeekdays = function () {
        return new Set(TRAINING_SCHEDULE.flatMap((session) => (
            session.days.map((day) => {
                const weekday = weekdays.get(day.toLocaleLowerCase('de-DE'));
                if (weekday === undefined) {
                    throw new Error(`Unbekannter Trainingstag im Trainingsplan: ${day}`);
                }
                return weekday;
            })
        )));
    };

    const schedule = document.getElementById('training-schedule');
    if (!schedule) return;

    TRAINING_SCHEDULE.forEach((session, index) => {
        const section = document.createElement('section');
        section.className = 'schedule-card';
        section.setAttribute('aria-labelledby', `schedule-day-${index}`);

        const heading = document.createElement('h2');
        heading.id = `schedule-day-${index}`;
        heading.className = 'schedule-day';
        heading.textContent = session.days.join(' & ');

        const list = document.createElement('ul');
        list.className = 'schedule-list';
        session.classes.forEach((trainingClass) => {
            const item = document.createElement('li');
            const time = document.createElement('span');
            time.className = 'schedule-time';
            time.textContent = trainingClass.time;

            const name = document.createElement('span');
            name.className = 'schedule-name';
            name.textContent = trainingClass.name;

            item.append(time, name);
            list.append(item);
        });

        section.append(heading, list);
        schedule.append(section);
    });
})();
