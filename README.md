# Sitio Web Personal - Experto en Redes y Sistemas

Este repositorio contiene el código fuente de un sitio web personal estático, diseñado para servir como un currículum interactivo y portafolio. El proyecto está optimizado para ser desplegado en Firebase Hosting y utiliza HTML, CSS y JavaScript puros, sin dependencias de frameworks.

Para una comprensión más profunda de la arquitectura y el contexto del proyecto, consulta el archivo [`project_context.md`](./project_context.md).

## Estructura del Proyecto

```
/
├── index.html              # Archivo principal HTML con todo el contenido y estructura.
├── css/
│   └── styles.css          # Hoja de estilos principal. Contiene todos los estilos, incluyendo variables para temas, animaciones y diseño responsivo.
├── js/
│   ├── main.js             # Script principal que inicializa otros módulos.
│   ├── network-animation.js # Controla la animación de red de fondo en la sección de inicio.
│   ├── particles.js        # Genera un efecto de partículas en el fondo.
│   ├── glitch-text.js      # Aplica un efecto de "glitch" a ciertos textos.
│   ├── typing-effect.js    # Simula un efecto de máquina de escribir.
│   ├── scroll-animations.js # Activa animaciones cuando los elementos entran en el viewport.
│   ├── theme-switcher.js   # Lógica para cambiar entre tema oscuro y claro.
│   ├── projects-filter.js  # Funcionalidad para filtrar los proyectos por categoría.
│   ├── skills-animation.js # Anima las barras de progreso de las habilidades.
│   ├── contact-form.js     # Validación básica para el formulario de contacto.
│   └── config-loader.js    # Carga la configuración desde config.yml y actualiza el DOM.
├── img/
│   ├── profile.svg         # Imagen de perfil (formato vectorial).
│   └── projects/           # Imágenes de los proyectos (formato vectorial).
├── firebase.json           # Configuración específica para el despliegue en Firebase.
├── .firebaserc             # Configuración del proyecto de Firebase.
├── package.json            # Define metadatos y dependencias (solo para desarrollo, ej. `serve`).
├── config.yml              # Archivo de configuración para datos de usuario (ej. URLs de LinkedIn, foto de perfil).
└── README.md               # Este archivo.
```

## Cómo Reproducir el Proyecto

### Requisitos

- [Node.js](https://nodejs.org/) (versión LTS recomendada) para ejecutar el servidor de desarrollo local.
- Un navegador web moderno (Chrome, Firefox, Edge).

### Pasos para la Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_DIRECTORIO>
   ```

2. **Instalar dependencias de desarrollo**:
   Este proyecto no tiene dependencias de producción, pero `serve` es útil para el desarrollo local. Se puede instalar vía `npm`.
   ```bash
   npm install
   ```

3. **Iniciar un servidor local**:
   Puedes usar el paquete `serve` (definido en `package.json`) para servir los archivos estáticos.
   ```bash
   npm start
   ```
   Esto iniciará un servidor local, típicamente en `http://localhost:3000`.

4. **Abrir en el navegador**:
   Abre tu navegador y navega a la dirección proporcionada por el servidor local.

## Personalización y Desarrollo

- **Contenido**: Modifica directamente el archivo `index.html` para cambiar textos, títulos, enlaces y la estructura de las secciones.
- **Estilos**: Altera `css/styles.css`. Las variables CSS al inicio del archivo facilitan cambios globales de color y tipografía.
- **Lógica y Animaciones**: Cada archivo en la carpeta `js/` tiene una responsabilidad única. Edita el archivo correspondiente para ajustar o extender funcionalidades.

## Despliegue

Aunque el proyecto está configurado para Firebase, puede ser desplegado en cualquier plataforma de hosting estático (Netlify, Vercel, GitHub Pages, etc.) simplemente subiendo los archivos del repositorio.

### Usando Firebase

1. **Instalar Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Autenticarse**:
   ```bash
   firebase login
   ```

3. **Desplegar**:
   El archivo `firebase.json` ya está configurado. Simplemente ejecuta:
   ```bash
   firebase deploy --only hosting
   ```

## Licencia

Este proyecto es de código abierto y está disponible para uso personal y profesional. Eres libre de modificarlo y adaptarlo a tus necesidades.