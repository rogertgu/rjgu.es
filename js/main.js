/**
 * main.js
 * Navegación (menú móvil, enlace activo), cambio de tema, aparición de
 * elementos al hacer scroll y año del pie. El tema inicial lo fija un script
 * en el <head> para evitar el parpadeo.
 */
(function () {
    'use strict';

    const root = document.documentElement;
    const isEnglish = root.lang === 'en';
    const THEME_KEY = 'preferred-theme';

    // ----- Tema -----
    const themeToggle = document.querySelector('.theme-toggle');
    const themeColor = document.querySelector('meta[name="theme-color"]');

    const applyTheme = theme => {
        root.setAttribute('data-theme', theme);
        const toLight = theme === 'dark';
        const label = toLight
            ? (isEnglish ? 'Switch to light theme' : 'Cambiar a tema claro')
            : (isEnglish ? 'Switch to dark theme' : 'Cambiar a tema oscuro');
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', label);
            themeToggle.setAttribute('title', label);
        }
        if (themeColor) {
            themeColor.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());
        }
    };

    applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

    themeToggle?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (error) { /* modo privado */ }
    });

    // ----- Menú móvil -----
    const nav = document.querySelector('.main-nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.getElementById('site-navigation');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuLabels = isEnglish
        ? { open: 'Open menu', close: 'Close menu' }
        : { open: 'Abrir menú', close: 'Cerrar menú' };

    const setMenuState = isOpen => {
        if (!menuToggle || !navLinksContainer) return;
        menuToggle.classList.toggle('active', isOpen);
        navLinksContainer.classList.toggle('active', isOpen);
        nav.classList.toggle('menu-open', isOpen);
        document.body.classList.toggle('no-scroll', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? menuLabels.close : menuLabels.open);
    };

    menuToggle?.addEventListener('click', () => setMenuState(!menuToggle.classList.contains('active')));
    navLinks.forEach(link => link.addEventListener('click', () => setMenuState(false)));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setMenuState(false);
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', event => {
        if (event.matches) setMenuState(false);
    });

    // ----- Fondo de la barra al hacer scroll -----
    const updateNavBackground = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', updateNavBackground, { passive: true });
    updateNavBackground();

    // ----- Enlace activo según la sección visible -----
    const linkById = new Map([...navLinks].map(link => [link.hash.slice(1), link]));
    const setActive = id => {
        navLinks.forEach(link => {
            const isActive = link === linkById.get(id);
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    };

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

    // ----- Aparición al hacer scroll -----
    // reveal-ready desactiva el respaldo CSS que muestra el contenido si este script no carga
    root.classList.add('reveal-ready');
    const revealItems = document.querySelectorAll('.reveal');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealItems.forEach(item => item.classList.add('is-visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        revealItems.forEach(item => revealObserver.observe(item));
    }

    // ----- Cambio de idioma conservando la sección -----
    document.querySelectorAll('.lang-link:not(.active)').forEach(link => {
        link.addEventListener('click', () => {
            if (location.hash) link.href = link.getAttribute('href') + location.hash;
        });
    });

    // ----- Año del pie -----
    const year = document.getElementById('current-year');
    if (year) year.textContent = new Date().getFullYear();
})();
