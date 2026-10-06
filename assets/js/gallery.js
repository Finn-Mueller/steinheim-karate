const galleryCategories = {
    turniere: 'Turniere',
    pruefungen: 'Prüfungen',
    lehrgaenge: 'Lehrgänge',
    trainingslager: 'Trainingslager',
    sonstiges: 'Sonstiges'
};

const galleryAlbums = Array.isArray(window.GALLERY_ALBUMS)
    ? window.GALLERY_ALBUMS
    : [];
const galleryGrid = document.getElementById('gallery-grid');
const galleryEmpty = document.getElementById('gallery-empty');
const galleryResultCount = document.getElementById('gallery-result-count');
const galleryCategoryLinks = [...document.querySelectorAll('[data-category-filter]')];
const galleryYearFrom = document.getElementById('gallery-year-from');
const galleryYearTo = document.getElementById('gallery-year-to');
const galleryDialog = document.getElementById('gallery-dialog');
const galleryDialogTitle = document.getElementById('gallery-dialog-title');
const galleryDialogMeta = document.getElementById('gallery-dialog-meta');
const galleryDialogContent = document.getElementById('gallery-dialog-content');
const galleryDialogClose = galleryDialog.querySelector('.gallery-dialog-close');
let galleryImageObserver = null;

if (!window.imageStorage) {
    throw new Error('Der Bildspeicher konnte nicht geladen werden.');
}

const categoryIcons = {
    turniere: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"></path><path d="M7 6H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4"></path>',
    pruefungen: '<path d="m12 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 3Z"></path><path d="m9.5 18-1 3 3.5-1.8 3.5 1.8-1-3"></path>',
    lehrgaenge: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 1 4 16.5v-11Z"></path><path d="M4 5.5v11A2.5 2.5 0 0 1 6.5 14H20M8 7h8"></path>',
    trainingslager: '<path d="m3 20 8-15 8 15M7 13h8M6 16h12"></path><path d="M16 5h.01M19 8h.01M14 2h.01"></path>',
    sonstiges: '<rect x="4" y="4" width="16" height="16" rx="3"></rect><path d="M8 12h8m-4-4v8"></path>'
};

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});

function albumYear(album) {
    return Number(album.date.slice(0, 4));
}

function formatAlbumDate(album) {
    return dateFormatter.format(new Date(`${album.date}T12:00:00`));
}

function syncUrl() {
    const params = new URLSearchParams(window.location.search);
    const activeCategory = galleryCategoryLinks.find(
        (link) => link.getAttribute('aria-current') === 'true'
    )?.dataset.categoryFilter;

    if (activeCategory) params.set('kategorie', activeCategory);
    else params.delete('kategorie');

    if (galleryYearFrom.value) params.set('von', galleryYearFrom.value);
    else params.delete('von');

    if (galleryYearTo.value) params.set('bis', galleryYearTo.value);
    else params.delete('bis');

    const query = params.toString();
    window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    );
}

function makePlaceholder(category) {
    const placeholder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    placeholder.setAttribute('class', 'gallery-card-placeholder');
    placeholder.setAttribute('viewBox', '0 0 24 24');
    placeholder.setAttribute('fill', 'none');
    placeholder.setAttribute('stroke', 'currentColor');
    placeholder.setAttribute('stroke-width', '1.35');
    placeholder.setAttribute('stroke-linecap', 'round');
    placeholder.setAttribute('stroke-linejoin', 'round');
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.innerHTML = categoryIcons[category] || categoryIcons.sonstiges;
    return placeholder;
}

function makeCard(album) {
    const card = document.createElement('button');
    card.className = 'gallery-card';
    card.type = 'button';
    card.setAttribute('aria-label', `${album.title}, ${formatAlbumDate(album)} – Album öffnen`);

    const image = document.createElement('span');
    image.className = 'gallery-card-image';
    image.dataset.category = album.category;
    image.setAttribute('aria-hidden', 'true');
    image.append(makePlaceholder(album.category));

    const coverFile = album.cover || album.photos[0] || '';
    if (coverFile) {
        const cover = document.createElement('img');
        cover.src = window.imageStorage.url(`${album.folder}${coverFile}`, {
            width: 640,
            quality: 75
        });
        cover.alt = '';
        cover.loading = 'lazy';
        cover.addEventListener('error', () => cover.remove());
        image.append(cover);
    }

    if (album.photos.length > 0) {
        const photoCount = document.createElement('span');
        photoCount.className = 'gallery-card-photo-count';
        photoCount.textContent = `${album.photos.length} ${album.photos.length === 1 ? 'Foto' : 'Fotos'}`;
        image.append(photoCount);
    }

    const info = document.createElement('span');
    info.className = 'gallery-card-info';

    const category = document.createElement('span');
    category.className = 'gallery-card-category';
    category.textContent = galleryCategories[album.category] || 'Sonstiges';

    const title = document.createElement('span');
    title.className = 'gallery-card-title';
    title.textContent = album.title;

    const date = document.createElement('span');
    date.className = 'gallery-card-date';
    date.textContent = formatAlbumDate(album);

    info.append(category, title, date);
    card.append(image, info);
    card.addEventListener('click', () => openAlbum(album));
    return card;
}

function renderGallery() {
    const activeCategory = galleryCategoryLinks.find(
        (link) => link.getAttribute('aria-current') === 'true'
    )?.dataset.categoryFilter || '';
    const yearFrom = Number(galleryYearFrom.value) || 0;
    const yearTo = Number(galleryYearTo.value) || Number.MAX_SAFE_INTEGER;
    const matchingAlbums = galleryAlbums
        .filter((album) => !activeCategory || album.category === activeCategory)
        .filter((album) => albumYear(album) >= yearFrom && albumYear(album) <= yearTo)
        .sort((a, b) => b.date.localeCompare(a.date));

    galleryGrid.replaceChildren(...matchingAlbums.map(makeCard));
    galleryResultCount.textContent = `${matchingAlbums.length} ${matchingAlbums.length === 1 ? 'Veranstaltung' : 'Veranstaltungen'}`;
    galleryEmpty.hidden = matchingAlbums.length > 0;
    syncUrl();
}

function openAlbum(album) {
    if (galleryImageObserver) galleryImageObserver.disconnect();
    galleryImageObserver = null;
    galleryDialogTitle.textContent = album.title;
    galleryDialogMeta.textContent = `${galleryCategories[album.category] || 'Sonstiges'} · ${formatAlbumDate(album)}`;
    galleryDialogContent.replaceChildren();

    if (album.photos.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'gallery-dialog-empty';
        emptyMessage.textContent = 'Die Fotos zu diesem Album werden ergänzt.';
        galleryDialogContent.append(emptyMessage);
    } else {
        const photoGrid = document.createElement('div');
        photoGrid.className = 'gallery-photo-grid';
        galleryImageObserver = 'IntersectionObserver' in window
            ? new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.src = entry.target.dataset.src;
                    observer.unobserve(entry.target);
                });
            }, {
                root: galleryDialogContent,
                rootMargin: '300px 0px'
            })
            : null;

        album.photos.forEach((photoPath, index) => {
            const originalUrl = window.imageStorage.url(`${album.folder}${photoPath}`);
            const link = document.createElement('a');
            link.href = originalUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', `Foto ${index + 1} in Originalgröße öffnen`);

            const photo = document.createElement('img');
            photo.dataset.src = window.imageStorage.url(`${album.folder}${photoPath}`, {
                width: 960,
                quality: 80
            });
            photo.alt = `${album.title} – Foto ${index + 1}`;
            photo.loading = 'lazy';
            photo.decoding = 'async';
            photo.addEventListener('error', () => link.remove());
            link.append(photo);
            photoGrid.append(link);
            if (galleryImageObserver) galleryImageObserver.observe(photo);
            else photo.src = photo.dataset.src;
        });

        galleryDialogContent.append(photoGrid);
    }

    galleryDialog.showModal();
}

function setCategory(category) {
    galleryCategoryLinks.forEach((link) => {
        const isActive = link.dataset.categoryFilter === category;
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
    });
}

function setYearOptions(changedSelect) {
    const years = [...new Set(galleryAlbums.map(albumYear))].sort((a, b) => b - a);
    if (years.length === 0) {
        galleryYearFrom.replaceChildren();
        galleryYearTo.replaceChildren();
        return;
    }

    let yearFrom = Number(galleryYearFrom.value) || Math.min(...years);
    let yearTo = Number(galleryYearTo.value) || Math.max(...years);

    if (yearFrom > yearTo) {
        if (changedSelect === galleryYearFrom) yearTo = yearFrom;
        else if (changedSelect === galleryYearTo) yearFrom = yearTo;
        else {
            yearFrom = 0;
            yearTo = Number.MAX_SAFE_INTEGER;
        }
    }

    [
        [galleryYearFrom, years.filter((year) => year <= yearTo), yearFrom],
        [galleryYearTo, years.filter((year) => year >= yearFrom), yearTo]
    ].forEach(([select, availableYears, selectedYear]) => {
        const options = availableYears.map((year) => {
            const option = document.createElement('option');
            option.value = String(year);
            option.textContent = String(year);
            return option;
        });
        select.replaceChildren(...options);
        select.value = String(selectedYear);
    });
}

function applyUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get('kategorie') || '';
    setCategory(galleryCategories[requestedCategory] ? requestedCategory : '');

    const availableYears = new Set(galleryAlbums.map((album) => String(albumYear(album))));
    galleryYearFrom.value = availableYears.has(params.get('von')) ? params.get('von') : '';
    galleryYearTo.value = availableYears.has(params.get('bis')) ? params.get('bis') : '';
    setYearOptions();
    renderGallery();
}

galleryCategoryLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        setCategory(link.dataset.categoryFilter);
        renderGallery();
    });
});

galleryYearFrom.addEventListener('change', () => {
    setYearOptions(galleryYearFrom);
    renderGallery();
});
galleryYearTo.addEventListener('change', () => {
    setYearOptions(galleryYearTo);
    renderGallery();
});
galleryDialogClose.addEventListener('click', () => galleryDialog.close());
galleryDialog.addEventListener('close', () => {
    if (galleryImageObserver) galleryImageObserver.disconnect();
    galleryImageObserver = null;
});
galleryDialog.addEventListener('click', (event) => {
    if (event.target === galleryDialog) galleryDialog.close();
});

setYearOptions();
applyUrlFilters();
