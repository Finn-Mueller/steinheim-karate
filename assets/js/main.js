const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('main-menu');

function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
}

toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});

// Menü schließen bei Klick auf einen Link
menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
});

// Menü schließen mit Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
});

// Beim Vergrößern des Fensters zurücksetzen
window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
});