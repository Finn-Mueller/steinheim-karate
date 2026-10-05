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

// Beim Vergrößern des Fensters zurücksetzen (passend zum CSS-Breakpoint von 830px)
window.matchMedia('(min-width: 831px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
});


/* ---------- Nach-oben-Button ---------- */

const backToTop = document.querySelector('.back-to-top');

if (backToTop) {
    backToTop.hidden = false;

    function updateBackToTop() {
        backToTop.classList.toggle('is-visible', window.scrollY > 400);
    }

    updateBackToTop();
    window.addEventListener('scroll', updateBackToTop, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0 });
    });
}


/* ---------- Druck-Effekt: Skalierung abhängig von der Button-Größe ---------- */

const pressables = document.querySelectorAll(
    'button, .button, .main-navigation-links a'
);

const PRESS_SHRINK_PX = 6;   // so viele Pixel schrumpft der Button (ungefähr)
const PRESS_MIN = 0.85;      // nie stärker als das
const PRESS_MAX = 0.98;      // nie schwächer als das

function updatePressScale(el) {
    const { width, height } = el.getBoundingClientRect();
    if (!width || !height) return;  // unsichtbar: CSS-Fallback (0.95) greift

    // Mittlere Größe aus Breite und Höhe, damit breite Buttons nicht zu stark schrumpfen
    const size = Math.sqrt(width * height);
    const scale = Math.min(PRESS_MAX, Math.max(PRESS_MIN, 1 - PRESS_SHRINK_PX / size));
    el.style.setProperty('--press-scale', scale.toFixed(3));
}

const pressObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => updatePressScale(entry.target));
});

pressables.forEach((el) => pressObserver.observe(el));