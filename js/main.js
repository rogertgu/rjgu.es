document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Variables
    const body = document.body;
    const navLinks = document.querySelectorAll('.nav-link');
    const themeToggle = document.querySelector('.theme-toggle');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const sections = document.querySelectorAll('section[id]');
    const skillBars = document.querySelectorAll('.skill-progress');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');
    const contactForm = document.getElementById('contact-form');
    const currentYearSpan = document.getElementById('current-year');

    // Inicializar el año actual en el footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Comprobar si el usuario prefiere el tema oscuro
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDarkScheme.matches) {
        body.setAttribute('data-theme', 'dark');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    // Cambiar tema (oscuro/claro)
    themeToggle.addEventListener('click', function() {
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Comprobar tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    } else if (savedTheme === 'light') {
        body.removeAttribute('data-theme');
        themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
    }

    // Menú móvil toggle
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
        body.classList.toggle('no-scroll');
    });

    // Cerrar menú móvil al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navLinksContainer.classList.remove('active');
            body.classList.remove('no-scroll');
        });
    });

    // Navegación de desplazamiento suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

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
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
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

    // Animar barras de habilidades cuando son visibles
    function animateSkillBars() {
        skillBars.forEach(bar => {
            const barTop = bar.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            const progress = bar.getAttribute('data-progress');
            
            if (barTop < windowHeight * 0.9) {
                bar.style.width = `${progress}%`;
            }
        });
    }

    // Añadir clase de animación a elementos cuando son visibles
    function animateOnScroll() {
        const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
        
        elementsToAnimate.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight * 0.9) {
                element.classList.add('fade-in');
            }
        });
    }

    // Filtrar proyectos
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase activa de todos los botones
            filterBtns.forEach(btn => btn.classList.remove('active'));
            // Añadir clase activa al botón clickeado
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            projectItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                } else {
                    const categories = item.getAttribute('data-category').split(' ');
                    if (categories.includes(filterValue)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        });
    });

    // Manejar envío del formulario de contacto
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Permitimos el envío nativo (no llamamos preventDefault)
            const submitBtn = this.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
                submitBtn.disabled = true;
            }
        });
    }

    // Añadir clase de animación a todos los elementos que deben animarse
    function setupAnimations() {
        const elementsToAnimate = [
            ...document.querySelectorAll('.about-content > *'),
            ...document.querySelectorAll('.timeline-item'),
            ...document.querySelectorAll('.skills-category'),
            ...document.querySelectorAll('.cert-item'),
            ...document.querySelectorAll('.project-item'),
            ...document.querySelectorAll('.contact-item'),
            document.querySelector('.contact-form')
        ].filter(el => el !== null);
        
        elementsToAnimate.forEach(element => {
            element.classList.add('animate-on-scroll');
        });
    }

    // Inicializar animaciones
    setupAnimations();

    // Event listeners para scroll
    window.addEventListener('scroll', function() {
        setActiveNavLink();
        toggleNavbarStyle();
        animateSkillBars();
        animateOnScroll();
    });

    // Disparar funciones al cargar la página
    setActiveNavLink();
    toggleNavbarStyle();
    animateSkillBars();
    animateOnScroll();
});