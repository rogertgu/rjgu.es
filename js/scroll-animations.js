/**
 * scroll-animations.js
 * Script para crear animaciones al hacer scroll y navegación suave
 * entre secciones de la página
 */

class ScrollAnimations {
  constructor() {
    // Opciones para las animaciones
    this.options = {
      threshold: 0.2,      // Porcentaje del elemento visible para activar la animación
      once: true,          // Animar solo una vez
      smoothScroll: true,  // Habilitar desplazamiento suave
      offset: 100          // Offset para el desplazamiento suave
    };
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Clases de animación disponibles
    this.animationClasses = [
      'fade-in',
      'fade-in-up',
      'fade-in-down',
      'fade-in-left',
      'fade-in-right',
      'zoom-in',
      'slide-up',
      'slide-down',
      'slide-left',
      'slide-right'
    ];
    
    // Inicializar
    this.init();
  }
  
  init() {
    // Agregar estilos CSS para las animaciones si no existen
    this.addAnimationStyles();
    
    // Configurar observador de intersección para las animaciones
    this.setupIntersectionObserver();
    
    // Configurar navegación suave
    if (this.options.smoothScroll) {
      this.setupSmoothScrolling();
    }
    
    // Manejar hash en la URL al cargar la página
    this.handleInitialHash();
  }
  
  addAnimationStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('scroll-animations-styles')) {
      return;
    }
    
    // Crear elemento de estilo
    const style = document.createElement('style');
    style.id = 'scroll-animations-styles';
    
    // Definir estilos para las animaciones
    style.innerHTML = `
      /* Estilos base para elementos animados */
      [data-animate] {
        opacity: 0;
        transition: opacity 0.6s ease, transform 0.6s ease;
        will-change: opacity, transform;
      }
      
      /* Cuando el elemento está visible */
      [data-animate].animated {
        opacity: 1;
        transform: translate(0, 0) scale(1);
      }
      
      /* Estilos específicos para cada tipo de animación */
      [data-animate="fade-in"] {
        opacity: 0;
      }
      
      [data-animate="fade-in-up"] {
        opacity: 0;
        transform: translateY(30px);
      }
      
      [data-animate="fade-in-down"] {
        opacity: 0;
        transform: translateY(-30px);
      }
      
      [data-animate="fade-in-left"] {
        opacity: 0;
        transform: translateX(30px);
      }
      
      [data-animate="fade-in-right"] {
        opacity: 0;
        transform: translateX(-30px);
      }
      
      [data-animate="zoom-in"] {
        opacity: 0;
        transform: scale(0.9);
      }
      
      [data-animate="slide-up"] {
        transform: translateY(100px);
      }
      
      [data-animate="slide-down"] {
        transform: translateY(-100px);
      }
      
      [data-animate="slide-left"] {
        transform: translateX(100px);
      }
      
      [data-animate="slide-right"] {
        transform: translateX(-100px);
      }
      
      /* Retrasos para secuencias de animación */
      [data-delay="100"] { transition-delay: 0.1s; }
      [data-delay="200"] { transition-delay: 0.2s; }
      [data-delay="300"] { transition-delay: 0.3s; }
      [data-delay="400"] { transition-delay: 0.4s; }
      [data-delay="500"] { transition-delay: 0.5s; }
      [data-delay="600"] { transition-delay: 0.6s; }
      [data-delay="700"] { transition-delay: 0.7s; }
      [data-delay="800"] { transition-delay: 0.8s; }
      [data-delay="900"] { transition-delay: 0.9s; }
      [data-delay="1000"] { transition-delay: 1s; }

      @media (prefers-reduced-motion: reduce) {
        [data-animate] {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
          will-change: auto;
        }
      }
    `;
    
    // Añadir estilos al documento
    document.head.appendChild(style);
  }
  
  setupIntersectionObserver() {
    // Configurar el observador de intersección
    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: this.options.threshold
    };
    
    // Crear el observador
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        // Si el elemento es visible
        if (entry.isIntersecting) {
          // Añadir clase para animar
          entry.target.classList.add('animated');
          
          // Dejar de observar si la opción 'once' está habilitada
          if (this.options.once) {
            observer.unobserve(entry.target);
          }
        } else if (!this.options.once) {
          // Quitar clase si no es 'once'
          entry.target.classList.remove('animated');
        }
      });
    }, observerOptions);
    
    // Observar todos los elementos con atributo data-animate
    document.querySelectorAll('[data-animate]').forEach(element => {
      this.observer.observe(element);
    });
  }
  
  setupSmoothScrolling() {
    // Obtener todos los enlaces internos
    const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    // Añadir evento de clic a cada enlace
    internalLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Obtener el ID del destino
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        // Si el elemento existe
        if (targetElement) {
          e.preventDefault();
          
          // Calcular la posición de desplazamiento
          const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - this.options.offset;
          
          // Desplazamiento suave
          window.scrollTo({
            top: offsetTop,
            behavior: this.prefersReducedMotion ? 'auto' : 'smooth'
          });
          
          // Actualizar la URL sin recargar la página
          history.pushState(null, null, targetId);
        }
      });
    });
  }
  
  handleInitialHash() {
    // Comprobar si hay un hash en la URL al cargar
    if (window.location.hash) {
      // Esperar a que se cargue la página
      setTimeout(() => {
        const targetElement = document.querySelector(window.location.hash);
        
        if (targetElement) {
          // Calcular la posición de desplazamiento
          const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - this.options.offset;
          
          // Desplazamiento suave
          window.scrollTo({
            top: offsetTop,
            behavior: this.prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      }, 100);
    }
  }
  
  // Método para añadir animaciones a elementos dinámicos
  refresh() {
    document.querySelectorAll('[data-animate]:not(.observed)').forEach(element => {
      element.classList.add('observed');
      this.observer.observe(element);
    });
  }
  
  // Método para aplicar animaciones a un elemento específico
  animate(element, animationType, delay = 0) {
    if (element && this.animationClasses.includes(animationType)) {
      // Configurar el elemento para la animación
      element.setAttribute('data-animate', animationType);
      
      if (delay > 0) {
        element.setAttribute('data-delay', delay);
      }
      
      // Observar el elemento
      this.observer.observe(element);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Crear instancia global
  window.scrollAnimations = new ScrollAnimations();
  
  // Aplicar animaciones a secciones principales si no tienen ya un atributo data-animate
  const sections = document.querySelectorAll('section:not([data-animate])');
  
  sections.forEach((section, index) => {
    // Alternar entre diferentes animaciones para las secciones
    const animations = ['fade-in-up', 'fade-in', 'fade-in-left', 'fade-in-right'];
    const animation = animations[index % animations.length];
    
    section.setAttribute('data-animate', animation);
  });
  
  // Aplicar animaciones a elementos dentro de las secciones
  document.querySelectorAll('section').forEach(section => {
    // Títulos
    const headings = section.querySelectorAll('h2, h3');
    headings.forEach((heading, index) => {
      if (!heading.hasAttribute('data-animate')) {
        heading.setAttribute('data-animate', 'fade-in-up');
        heading.setAttribute('data-delay', (index * 100).toString());
      }
    });
    
    // Párrafos
    const paragraphs = section.querySelectorAll('p');
    paragraphs.forEach((paragraph, index) => {
      if (!paragraph.hasAttribute('data-animate')) {
        paragraph.setAttribute('data-animate', 'fade-in');
        paragraph.setAttribute('data-delay', (200 + index * 100).toString());
      }
    });
    
    // Imágenes
    const images = section.querySelectorAll('img');
    images.forEach((image, index) => {
      if (!image.hasAttribute('data-animate')) {
        image.setAttribute('data-animate', 'zoom-in');
        image.setAttribute('data-delay', (300 + index * 100).toString());
      }
    });
    
    // Botones
    const buttons = section.querySelectorAll('button, .btn');
    buttons.forEach((button, index) => {
      if (!button.hasAttribute('data-animate')) {
        button.setAttribute('data-animate', 'fade-in-up');
        button.setAttribute('data-delay', (400 + index * 100).toString());
      }
    });
  });
  
  // Refrescar para observar los elementos recién configurados
  window.scrollAnimations.refresh();
});
