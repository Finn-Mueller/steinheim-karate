const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('main-menu');
const dropdownItems = document.querySelectorAll('.has-dropdown');
const navigationPanels = document.querySelectorAll('.dropdown');

/* ---------- Social-Media-Links: URLs zentral hier pflegen ---------- */

const socialLinks = {
    instagram: 'https://www.instagram.com/kempokaryu/',
    facebook: 'https://www.facebook.com/share/1C7FrLhcf1/',
    youtube: 'https://www.youtube.com/@kempoka-ryusteinheim1689'
};

document.querySelectorAll('[data-social-link]').forEach((link) => {
    const platform = link.dataset.socialLink;
    link.href = socialLinks[platform];
});

/* ---------- Footer-Ausrichtung bei Zeilenumbruch ---------- */

const footerInner = document.querySelector('.footer-inner');
const footerNavigation = footerInner?.querySelector('.footer-navigation');
const footerSocial = footerInner?.querySelector('.footer-social');

if (footerInner && footerNavigation && footerSocial) {
    function updateFooterAlignment() {
        const navigationRect = footerNavigation.getBoundingClientRect();
        const socialRect = footerSocial.getBoundingClientRect();
        const navigationCenter = navigationRect.top + navigationRect.height / 2;
        const socialCenter = socialRect.top + socialRect.height / 2;

        footerInner.classList.toggle(
            'is-wrapped',
            Math.abs(navigationCenter - socialCenter) > 1
        );
    }

    const footerObserver = new ResizeObserver(updateFooterAlignment);
    footerObserver.observe(footerInner);
    footerObserver.observe(footerNavigation);
    footerObserver.observe(footerSocial);
    updateFooterAlignment();
}

/* ---------- Header-Höhe für die max-height des Menüs ---------- */

function updateHeaderHeight() {
    document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
}

updateHeaderHeight();
window.addEventListener('resize', updateHeaderHeight);

/* ---------- Dropdowns ---------- */

function updateNavigationFocus() {
    document.body.classList.toggle(
        'navigation-focused',
        toggle.getAttribute('aria-expanded') === 'true'
    );
}

menu.inert = getComputedStyle(toggle).display !== 'none';
navigationPanels.forEach((panel) => {
    panel.inert = true;
});

function setDropdown(item, open) {
    const button = item.querySelector('.dropdown-toggle');
    const list = item.querySelector('.dropdown');
    list.classList.toggle('is-open', open);
    list.inert = !open;
    button.setAttribute('aria-expanded', String(open));
    updateNavigationFocus();
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
    menu.inert = !open && isHamburgerActive();
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    if (!open) closeAllDropdowns();
    updateNavigationFocus();
}

toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});

// Navigation beim Scrollen schließen
window.addEventListener('scroll', () => {
    setMenu(false);
}, { passive: true });

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

// Beim Vergrößern des Fensters zurücksetzen (passend zum CSS-Breakpoint von 1024px)
window.matchMedia('(min-width: 1025px)').addEventListener('change', () => {
    setMenu(false);
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