# rjgu.es

## Objetivo
Web personal/portfolio de Rogert Guevara (Network & Systems Administrator) en https://rjgu.es, en español (`/`) e inglés (`/en/`). Sitio estático sin build.

## Ubicación y estructura
- Ruta: `~/work/rjgu/rjgu.es` (TARS-11). Remoto: `git@github.com:rogertgu/rjgu.es.git` (privado), rama `main`.
- `index.html` (ES) y `en/index.html` (EN): contenido duplicado; cualquier cambio de contenido o estructura va en ambos.
- `css/styles.css`: todos los estilos (tema oscuro por defecto, tema claro con `[data-theme="light"]` en `<html>`).
- `js/`: `main.js` (navegación), `network-animation.js` (canvas del hero), `scroll-animations.js`, `skills-animation.js`, `theme-switcher.js`, `config-loader.js` (lee `config.yml`), `cutrepodcast.js` (últimos episodios desde `https://cutrepodcast.rjgu.es/episodes.json`).
- `service-worker.js` + `manifest.json` (PWA); los iconos están en `img/icons/`.
- `scripts/validate.mjs`: validación estática (JSON, `<main>`/`<h1>`, referencias locales, iconos del manifest cacheados en el SW, sintaxis JS).
- `firebase.json`: restos de un despliegue antiguo en Firebase; no se usa.

## Cómo ejecutar / probar / desplegar
```bash
node scripts/validate.mjs          # o: npm run validate
python3 -m http.server 8765 --bind 127.0.0.1   # http://127.0.0.1:8765/
```
- Despliegue: GitHub Actions (`.github/workflows/deploy.yml`) publica en GitHub Pages en cada push a `main` (las PR solo validan). `CNAME` = `rjgu.es`, con Cloudflare como proxy delante.
- **Hacer push a `main` publica la web en producción.**
- En local la tarjeta del Cutrepodcast no carga episodios: el CORS del bucket R2 solo admite el origen `rjgu.es`. Es lo esperado.

## Estado actual
(Actualizado 2026-10-11)
- En producción: la portada, Sobre mí, Contenidos (FROGLM + Cutrepodcast), Experiencia, Habilidades, Tecnologías y Contacto.
- Experiencia rediseñada (una columna, puestos agrupados por empresa); commit local pendiente de aprobación para hacer push.
- En curso: rediseño por pasos (ver *Próximos pasos*).

## Próximos pasos
1. Unir Habilidades y Tecnologías en una sección "Stack" sin barras de porcentaje (niveles de texto + certificaciones).
2. Detalles: hueco junto a la foto en Sobre mí, Contacto repite datos de Sobre mí, `<title>` sin nombre.

## Decisiones y restricciones
- Sitio estático sin framework ni paso de build; mantenerlo así salvo que se pida otra cosa.
- Rutas relativas (`img/...`, `../js/...` en `/en/`) para que funcione tanto en local como en Pages.
- Si cambian los ficheros que se cachean, actualizar la lista y subir `CACHE_NAME` en `service-worker.js`.
- Las capturas de Playwright (`.playwright-mcp/`) no se commitean.

## Registro
- 2026-10-10 — Claude Code — Recuperada la tarjeta del Cutrepodcast (ES/EN) con los últimos 3 episodios.
- 2026-10-11 — Claude Code — Commit de la limpieza pendiente (accesibilidad, SEO, JS sin uso eliminado, `validate.mjs`, iconos PWA) y creación de este AGENTS.md. Revisión de diseño y plan de rediseño.
- 2026-10-11 — Claude Code — Experiencia: línea de tiempo en una columna, agrupada por empresa (la sección pasa de 2.343 a 1.516 px de alto en escritorio).
