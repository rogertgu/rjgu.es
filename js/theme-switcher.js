/**
 * theme-switcher.js
 * Script para implementar un cambio de tema oscuro/claro con transición suave
 * y persistencia de la preferencia del usuario
 */

class ThemeSwitcher {
  constructor(options = {}) {
    // Opciones con valores predeterminados
    this.options = {
      darkClass: options.darkClass || 'dark-theme',
      lightClass: options.lightClass || 'light-theme',
      toggleSelector: options.toggleSelector || '#theme-toggle',
      storageKey: options.storageKey || 'preferred-theme',
      defaultTheme: options.defaultTheme || 'dark', // Tema predeterminado: 'dark' o 'light'
      transitionDuration: options.transitionDuration || 300, // Duración de la transición en ms
      respectSystemPreference: options.respectSystemPreference !== undefined ? options.respectSystemPreference : true
    };
    
    // Estado
    this.currentTheme = null;
    
    // Inicializar
    this.init();
  }
  
  init() {
    // Agregar estilos de transición si no existen
    this.addTransitionStyles();
    
    // Determinar el tema inicial
    this.setInitialTheme();
    
    // Configurar el botón de cambio de tema
    this.setupToggleButton();
    
    // Escuchar cambios en la preferencia del sistema
    if (this.options.respectSystemPreference) {
      this.listenForSystemPreferenceChanges();
    }
  }
  
  addTransitionStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('theme-transition-styles')) {
      return;
    }
    
    // Crear elemento de estilo
    const style = document.createElement('style');
    style.id = 'theme-transition-styles';
    
    // Definir estilos para la transición
    style.innerHTML = `
      body.theme-transition,
      body.theme-transition *,
      body.theme-transition *:before,
      body.theme-transition *:after {
        transition: background-color ${this.options.transitionDuration}ms ease, 
                    color ${this.options.transitionDuration}ms ease, 
                    border-color ${this.options.transitionDuration}ms ease, 
                    box-shadow ${this.options.transitionDuration}ms ease !important;
      }
    `;
    
    // Añadir estilos al documento
    document.head.appendChild(style);
  }
  
  setInitialTheme() {
    // Comprobar si hay una preferencia guardada
    const savedTheme = localStorage.getItem(this.options.storageKey);
    
    if (savedTheme) {
      // Usar la preferencia guardada
      this.setTheme(savedTheme);
    } else if (this.options.respectSystemPreference) {
      // Comprobar la preferencia del sistema
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDarkScheme ? 'dark' : 'light');
    } else {
      // Usar el tema predeterminado
      this.setTheme(this.options.defaultTheme);
    }
  }
  
  setupToggleButton() {
    // Obtener el botón de cambio de tema
    const toggleButton = document.querySelector(this.options.toggleSelector);
    
    if (toggleButton) {
      // Añadir evento de clic
      toggleButton.addEventListener('click', () => {
        this.toggleTheme();
      });
      
      // Actualizar el estado visual del botón
      this.updateToggleButton(toggleButton);
    }
  }
  
  updateToggleButton(button = null) {
    // Si no se proporciona un botón, buscarlo
    if (!button) {
      button = document.querySelector(this.options.toggleSelector);
    }
    
    if (button) {
      const isEnglish = document.documentElement.lang === 'en';
      const label = this.currentTheme === 'dark'
        ? (isEnglish ? 'Switch to light theme' : 'Cambiar a tema claro')
        : (isEnglish ? 'Switch to dark theme' : 'Cambiar a tema oscuro');

      // Actualizar atributos y clases según el tema actual
      button.setAttribute('aria-pressed', this.currentTheme === 'dark');
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      
      // Si el botón tiene un icono, actualizarlo
      const iconElement = button.querySelector('i, svg, img');
      if (iconElement) {
        // Actualizar clases o atributos del icono según el framework de iconos utilizado
        if (iconElement.classList.contains('fa') || iconElement.classList.contains('fas') || iconElement.classList.contains('far')) {
          // Font Awesome
          iconElement.className = this.currentTheme === 'dark' 
            ? 'fas fa-sun' 
            : 'fas fa-moon';
        } else if (iconElement.classList.contains('material-icons')) {
          // Material Icons
          iconElement.textContent = this.currentTheme === 'dark' 
            ? 'light_mode' 
            : 'dark_mode';
        }
        // Añadir más condiciones para otros frameworks de iconos si es necesario
      } else {
        // Si no hay icono, actualizar el texto
        button.textContent = this.currentTheme === 'dark' 
          ? 'Cambiar a tema claro' 
          : 'Cambiar a tema oscuro';
      }
    }
  }
  
  listenForSystemPreferenceChanges() {
    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Usar el método moderno si está disponible
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        // Solo cambiar si no hay una preferencia guardada
        if (!localStorage.getItem(this.options.storageKey)) {
          this.setTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    } else if (mediaQuery.addListener) {
      // Método antiguo para compatibilidad
      mediaQuery.addListener((e) => {
        // Solo cambiar si no hay una preferencia guardada
        if (!localStorage.getItem(this.options.storageKey)) {
          this.setTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    }
  }
  
  setTheme(theme, savePreference = true) {
    // Validar el tema
    if (theme !== 'dark' && theme !== 'light') {
      console.error('Tema no válido. Debe ser "dark" o "light".');
      return;
    }
    
    // Añadir clase de transición
    document.body.classList.add('theme-transition');
    
    // Eliminar clases de tema anteriores
    document.body.classList.remove(this.options.darkClass, this.options.lightClass);
    
    // Añadir la clase del nuevo tema
    document.body.classList.add(theme === 'dark' ? this.options.darkClass : this.options.lightClass);
    
    // Actualizar el atributo data-theme para CSS
    document.documentElement.setAttribute('data-theme', theme);
    
    // Guardar la preferencia si es necesario
    if (savePreference) {
      localStorage.setItem(this.options.storageKey, theme);
    }
    
    // Actualizar el estado
    this.currentTheme = theme;
    
    // Actualizar el botón de cambio de tema
    this.updateToggleButton();
    
    // Eliminar la clase de transición después de la duración especificada
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, this.options.transitionDuration);
    
    // Disparar evento personalizado
    const event = new CustomEvent('themeChanged', {
      detail: {
        theme: theme,
        isDark: theme === 'dark'
      }
    });
    document.dispatchEvent(event);
  }
  
  toggleTheme() {
    // Cambiar al tema opuesto
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
  
  // Métodos públicos
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  isDarkTheme() {
    return this.currentTheme === 'dark';
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Crear instancia global
  window.themeSwitcher = new ThemeSwitcher({
    toggleSelector: '.theme-toggle',
    defaultTheme: 'dark',
    respectSystemPreference: false
  });
});
