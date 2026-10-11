/**
 * skills-animation.js
 * Script para animar las barras de habilidades cuando se hacen visibles
 * durante el scroll, mostrando el nivel de competencia de forma visual
 */

class SkillsAnimation {
  constructor(options = {}) {
    // Opciones con valores predeterminados
    this.options = {
      containerSelector: options.containerSelector || '.skills-container',
      skillBarSelector: options.skillBarSelector || '.skill-bar',
      progressSelector: options.progressSelector || '.skill-progress',
      threshold: options.threshold || 0.2,
      animationDuration: options.animationDuration || 1000,
      animationEasing: options.animationEasing || 'ease-out',
      animateOnce: options.animateOnce !== undefined ? options.animateOnce : true
    };
    
    // Estado
    this.animated = false;
    
    // Elementos DOM
    this.container = document.querySelector(this.options.containerSelector);
    this.skillBars = document.querySelectorAll(this.options.skillBarSelector);
    
    // Inicializar si los elementos existen
    if (this.container && this.skillBars.length > 0) {
      this.init();
    }
  }
  
  init() {
    // Añadir estilos CSS para las animaciones si no existen
    this.addAnimationStyles();
    
    // Configurar las barras de habilidades
    this.setupSkillBars();
    
    // Configurar el observador de intersección
    this.setupIntersectionObserver();
  }
  
  addAnimationStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('skills-animation-styles')) {
      return;
    }
    
    // Crear elemento de estilo
    const style = document.createElement('style');
    style.id = 'skills-animation-styles';
    
    // Definir estilos para las animaciones
    style.innerHTML = `
      /* Estilos para las barras de habilidades */
      ${this.options.skillBarSelector} {
        position: relative;
        margin-bottom: 20px;
      }
      
      ${this.options.progressSelector} {
        height: 100%;
        width: 0; /* Inicialmente en 0 */
        transition: width ${this.options.animationDuration}ms ${this.options.animationEasing};
      }

      @media (prefers-reduced-motion: reduce) {
        ${this.options.progressSelector} {
          transition: none !important;
        }
      }
    `;
    
    // Añadir estilos al documento
    document.head.appendChild(style);
  }
  
  setupSkillBars() {
    // Configurar cada barra de habilidades
    this.skillBars.forEach(skillBar => {
      // Obtener el valor de la habilidad
      const skillValue = this.getSkillValue(skillBar);
      
      // Obtener o crear el elemento de progreso
      let progressElement = skillBar.querySelector(this.options.progressSelector);
      if (!progressElement) {
        progressElement = document.createElement('div');
        progressElement.className = this.options.progressSelector.substring(1); // Quitar el punto inicial
        skillBar.appendChild(progressElement);
      }

      skillBar.setAttribute('role', 'progressbar');
      skillBar.setAttribute('aria-valuemin', '0');
      skillBar.setAttribute('aria-valuemax', '100');
      skillBar.setAttribute('aria-valuenow', String(skillValue));

      const skillName = skillBar.closest('.skill-item')?.querySelector('.skill-name');
      if (skillName) {
        skillBar.setAttribute('aria-label', skillName.textContent.trim());
      }
    });
  }

  getSkillValue(skillBar) {
    const value = Number.parseInt(skillBar.getAttribute('data-value') || '0', 10);
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
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
        // Si el contenedor es visible
        if (entry.isIntersecting && !this.animated) {
          // Animar las barras de habilidades
          this.animateSkillBars();
          
          // Marcar como animado
          this.animated = true;
          
          // Dejar de observar si la opción 'animateOnce' está habilitada
          if (this.options.animateOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!entry.isIntersecting && !this.options.animateOnce) {
          // Resetear la animación si no es 'animateOnce'
          this.resetAnimation();
          this.animated = false;
        }
      });
    }, observerOptions);
    
    // Observar el contenedor
    this.observer.observe(this.container);
  }
  
  animateSkillBars() {
    // Animar cada barra de habilidades
    this.skillBars.forEach((skillBar, index) => {
      // Obtener el valor de la habilidad
      const skillValue = this.getSkillValue(skillBar);
      
      // Obtener el elemento de progreso
      const progressElement = skillBar.querySelector(this.options.progressSelector);
      
      if (progressElement) {
        // Añadir un retraso escalonado para una animación secuencial
        const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : index * 100;
        setTimeout(() => {
          // Animar la barra de progreso
          progressElement.style.width = `${skillValue}%`;

          // Añadir clase para animar el valor
          skillBar.classList.add('animated');
        }, delay);
      }
    });
    
    // Disparar evento personalizado
    const event = new CustomEvent('skillsAnimated', {
      detail: {
        container: this.container,
        skillBars: this.skillBars
      }
    });
    document.dispatchEvent(event);
  }
  
  resetAnimation() {
    // Resetear la animación de cada barra de habilidades
    this.skillBars.forEach(skillBar => {
      // Obtener el elemento de progreso
      const progressElement = skillBar.querySelector(this.options.progressSelector);
      
      if (progressElement) {
        // Resetear la barra de progreso
        progressElement.style.width = '0';
        
        // Quitar clase de animación
        skillBar.classList.remove('animated');
      }
    });
  }
  
  // Métodos públicos
  refresh() {
    // Actualizar la lista de barras de habilidades
    this.skillBars = document.querySelectorAll(this.options.skillBarSelector);
    
    // Configurar las nuevas barras
    this.setupSkillBars();
    
    // Animar si ya estaba animado
    if (this.animated) {
      this.animateSkillBars();
    }
  }
  
  forceAnimation() {
    // Forzar la animación independientemente de la visibilidad
    this.animateSkillBars();
    this.animated = true;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.skillsAnimation = new SkillsAnimation();
});
