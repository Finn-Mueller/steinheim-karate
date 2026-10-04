const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('main-menu');
const dropdownItems = document.querySelectorAll('.has-dropdown');

/* ---------- Header-Höhe für die max-height des Menüs ---------- */

function updateHeaderHeight() {
    document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
}

updateHeaderHeight();
window.addEventListener('resize', updateHeaderHeight);

/* ---------- Dropdowns ---------- */

function setDropdown(item, open) {
    const button = item.querySelector('.dropdown-toggle');
    const list = item.querySelector('.dropdown');
    list.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
}

// true, solange das Hamburger-Menü aktiv ist (Smartphone-Ansicht)
function isHamburgerActive() {
    return getComputedStyle(toggle).display !== 'none';
}

function closeAllDropdowns(except = null) {
    dropdownItems.forEach((item) => {
        if (item !== except) setDropdown(item, false);
    });
}

dropdownItems.forEach((item) => {
    const button = item.querySelector('.dropdown-toggle');

    button.addEventListener('click', () => {
        const willOpen = button.getAttribute('aria-expanded') !== 'true';
        // Desktop: nur ein Dropdown gleichzeitig. Smartphone: andere bleiben offen.
        if (!isHamburgerActive()) closeAllDropdowns(item);
        setDropdown(item, willOpen);
    });
});

// Dropdowns schließen bei Klick außerhalb
document.addEventListener('click', (e) => {
    // Im Hamburger-Menü soll ein Tipp auf freie Fläche im Menü nichts schließen
    if (isHamburgerActive() && e.target.closest('#main-menu')) return;

    if (!e.target.closest('.has-dropdown')) closeAllDropdowns();
});

/* ---------- Hamburger-Menü ---------- */

function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    if (!open) closeAllDropdowns();
}

toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});

// Menü schließen bei Klick auf einen Link
menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
});

// Menü und Dropdowns schließen mit Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        setMenu(false);
        closeAllDropdowns();
    }
});

// Beim Vergrößern des Fensters zurücksetzen
window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
});