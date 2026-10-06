(function () {
    const trainerList = document.getElementById('trainers');
    if (!trainerList) return;
    if (typeof TRAINERS === 'undefined') {
        throw new Error('Die Trainerdaten konnten nicht geladen werden.');
    }
    if (!window.imageStorage) {
        throw new Error('Der Bildspeicher konnte nicht geladen werden.');
    }

    function createCard(trainer) {
        const card = document.createElement('article');
        card.className = 'trainer-card';

        const photoLink = document.createElement('a');
        photoLink.className = 'trainer-photo-link';
        photoLink.href = window.imageStorage.url(trainer.photo);
        photoLink.target = '_blank';
        photoLink.rel = 'noopener noreferrer';
        photoLink.setAttribute('aria-label', `${trainer.name} – Foto in Originalgröße öffnen`);

        const photo = document.createElement('img');
        photo.className = 'trainer-photo';
        photo.src = photoLink.href;
        photo.alt = trainer.name;
        photo.loading = 'lazy';
        photoLink.append(photo);

        const info = document.createElement('div');
        info.className = 'trainer-info';

        const name = document.createElement('h2');
        name.className = 'trainer-name';
        name.textContent = trainer.name;
        info.append(name);

        trainer.grades.forEach((grade) => {
            const belt = document.createElement('p');
            belt.className = 'trainer-belt';

            const color = document.createElement('span');
            color.className = `belt-color belt-${grade.belt}`;
            color.setAttribute('aria-hidden', 'true');

            belt.append(color, document.createTextNode(grade.label));
            info.append(belt);
        });

        card.append(photoLink, info);
        return card;
    }

    TRAINERS.forEach((trainer) => trainerList.append(createCard(trainer)));
})();
