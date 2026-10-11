document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Variables
    const body = document.body;
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const sections = document.querySelectorAll('section[id]');
    const currentYearSpan = document.getElementById('current-year');
    const isEnglish = document.documentElement.lang === 'en';
    const menuLabels = isEnglish
        ? { open: 'Open menu', close: 'Close menu' }
        : { open: 'Abrir menú', close: 'Cerrar menú' };

    // Inicializar el año actual en el footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // (Tema inicial y cambio gestionados por theme-switcher.js)

    // Menú móvil accesible
    if (menuToggle && navLinksContainer) {
        const setMenuState = (isOpen) => {
            menuToggle.classList.toggle('active', isOpen);
            navLinksContainer.classList.toggle('active', isOpen);
            body.classList.toggle('no-scroll', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? menuLabels.close : menuLabels.open);
        };

        menuToggle.addEventListener('click', () => {
            setMenuState(!menuToggle.classList.contains('active'));
        });

        navLinks.forEach(link => link.addEventListener('click', () => setMenuState(false)));

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                setMenuState(false);
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                setMenuState(false);
            }
        });
    }

    // (Navegación de desplazamiento suave gestionada por scroll-animations.js)

    // Cambiar clase activa en la navegación según la sección visible
    function setActiveNavLink() {
        let scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'location');
                    }
                });
            }
        });
    }

    // Cambiar estilo de la navegación al hacer scroll
    function toggleNavbarStyle() {
        const navbar = document.querySelector('.main-nav');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // (Animación de barras de habilidades gestionada por skills-animation.js)

    // Event listeners para scroll
    window.addEventListener('scroll', function() {
        setActiveNavLink();
        toggleNavbarStyle();
    });

    // Disparar funciones al cargar la página
    setActiveNavLink();
    toggleNavbarStyle();
});
