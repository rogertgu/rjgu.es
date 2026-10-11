# rjgu.es

## Objetivo
Web personal/portfolio de Rogert Guevara (Network & Systems Administrator) en https://rjgu.es, en español (`/`) e inglés (`/en/`). Sitio estático sin build.

## Ubicación y estructura
- Ruta: `~/work/rjgu/rjgu.es` (TARS-11). Remoto: `git@github.com:rogertgu/rjgu.es.git` (privado), rama `main`.
- `index.html` (ES) y `en/index.html` (EN): contenido duplicado; cualquier cambio de contenido o estructura va en ambos.
- `css/styles.css`: todos los estilos, estilo "ingeniería/terminal" (rediseño B). Tema oscuro por defecto; claro con `[data-theme="light"]` en `<html>`, fijado antes de pintar por un script en el `<head>` (clave `preferred-theme` en localStorage).
- `js/`: `main.js` (menú, enlace activo, tema, aparición `.reveal`, año), `topology.js` (diagrama SVG animado del hero, red genérica), `cutrepodcast.js` (últimos episodios desde `https://cutrepodcast.rjgu.es/episodes.json`).
- `fonts/`: JetBrains Mono variable (subset latin, OFL) alojada en la propia web. Sin Google Fonts ni Font Awesome; iconos en SVG en línea y flechas con máscaras CSS (`.arrow-ext`, `.arrow-right`, `.arrow-down`).
- `service-worker.js` + `manifest.json` (PWA); los iconos están en `img/icons/`.
- `cv/`: CV en HTML (`es.html`, `en.html`, `cv.css`), A4 de una página, mismo estilo que la web en claro. Los PDF se generan con `scripts/build-cv.sh` (Chrome headless) → `Rogert-Guevara-CV.pdf` (ES) y `Rogert-Guevara-CV-EN.pdf` (EN). Usa `fonts/inter-latin-wght.woff2` (Inter, OFL) solo para el CV.
- `scripts/validate.mjs`: validación estática (JSON, `<main>`/`<h1>`, referencias locales, iconos del manifest cacheados en el SW, sintaxis JS).
- `firebase.json`: restos de un despliegue antiguo en Firebase; no se usa.
- `lofi/`: **no editar aquí.** Lo genera y sube directamente a `main` el repo `rogertgu/homelab-live` (`tools/deploy-rjgu.sh`). Por eso `origin/main` puede tener commits nuevos: hacer `git fetch` e integrar antes de publicar.

## Cómo ejecutar / probar / desplegar
```bash
node scripts/validate.mjs          # o: npm run validate
scripts/build-cv.sh                # regenera los PDF del CV en la raíz
scripts/build-cv.sh /tmp/preview   # o en otra carpeta para previsualizar
python3 -m http.server 8765 --bind 127.0.0.1   # http://127.0.0.1:8765/
```
- Despliegue: GitHub Actions (`.github/workflows/deploy.yml`) publica en GitHub Pages en cada push a `main` (las PR solo validan). `CNAME` = `rjgu.es`, con Cloudflare como proxy delante.
- **Hacer push a `main` publica la web en producción.**
- En local la tarjeta del Cutrepodcast no carga episodios: el CORS del bucket R2 solo admite el origen `rjgu.es`. Es lo esperado.

## Estado actual
(Actualizado 2026-10-11)
- En producción (rjgu.es): todavía el diseño antiguo (último deploy: commit `9fd6a28`).
- `main` local va 2 commits por delante de origin sin push (limpieza técnica + Experiencia en una columna).
- Rama `redesign-b`: rediseño completo en estilo "ingeniería/terminal". Secciones: portada con topología + línea de estado, Sobre mí, Proyectos (FROGLM, Cutrepodcast, Homelab), Experiencia, Stack (sin porcentajes; `is-core` = especialidad principal, sacado de las habilidades ≥90 % del diseño antiguo) + certificaciones, Contacto. Pendiente de revisión por Rogert.

## Próximos pasos
1. Rogert revisa `redesign-b` en local; ajustes que pida.
2. Si se aprueba: merge de `redesign-b` en `main` y push (publica en rjgu.es). Comprobar después en producción que el Cutrepodcast carga episodios (CORS solo para `rjgu.es`).
3. CV nuevo (`cv/`): pendiente de aprobación. Al aprobarlo: `scripts/build-cv.sh`, enlazar el PDF EN desde `en/index.html` (hero y contacto) y añadirlo al precache de `service-worker.js`. Faltan formación e idiomas (Rogert no los ha dado; no inventarlos). Email del CV: rogert@rjgu.es, sin teléfono (decisión de Rogert).
4. Homelab: los agentes (Hermes/OpenClaw) están en la VLAN 24 según la doc del homelab; no afirmar "aislados de la red" salvo que Rogert lo confirme.
5. Opcional: `img/projects/` parece sin uso; revisar y borrar.

## Decisiones y restricciones
- Sitio estático sin framework ni paso de build; mantenerlo así salvo que se pida otra cosa.
- Rutas relativas (`img/...`, `../js/...` en `/en/`) para que funcione tanto en local como en Pages.
- Si cambian los ficheros que se cachean, actualizar la lista y subir `CACHE_NAME` en `service-worker.js`.
- Las capturas de Playwright (`.playwright-mcp/`) no se commitean.
- La topología del hero es ilustrativa: no poner nombres, IPs ni estructura real del homelab.
- Sin dependencias externas en tiempo de carga salvo el JSON del podcast.

## Registro
- 2026-10-10 — Claude Code — Recuperada la tarjeta del Cutrepodcast (ES/EN) con los últimos 3 episodios.
- 2026-10-11 — Claude Code — Commit de la limpieza pendiente (accesibilidad, SEO, JS sin uso eliminado, `validate.mjs`, iconos PWA) y creación de este AGENTS.md. Revisión de diseño y plan de rediseño.
- 2026-10-11 — Claude Code — Experiencia: línea de tiempo en una columna, agrupada por empresa (la sección pasa de 2.343 a 1.516 px de alto en escritorio).
- 2026-10-11 — Claude Code — Rediseño B ("ingeniería/terminal") en la rama `redesign-b`: CSS y JS reescritos, nueva estructura, fuente alojada en la web, eliminados config.yml/config-loader y 4 JS antiguos. Página en escritorio de ~8.300 a 4.724 px; en móvil de 10.162 a 6.904 px.
- 2026-10-11 — Claude Code — Homelab con agentes de IA; párrafo de Sobre mí recortado; CV rehecho en HTML→PDF (`cv/`, `scripts/build-cv.sh`), una página ES/EN, pendiente de aprobación.
