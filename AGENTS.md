# rjgu.es

## Objetivo
Web personal/portfolio de Rogert Guevara (Network & Systems Administrator) en https://rjgu.es, en español (`/`) e inglés (`/en/`). Sitio estático sin framework; el build solo copia lo público y genera las páginas de los episodios del podcast.

## Ubicación y estructura
- Ruta: `~/work/rjgu/rjgu.es` (TARS-11). Remoto: `git@github.com:rogertgu/rjgu.es.git` (privado), rama `main`.
- `index.html` (ES) y `en/index.html` (EN): contenido duplicado; cualquier cambio de contenido o estructura va en ambos.
- `css/styles.css`: todos los estilos, estilo "ingeniería/terminal" (rediseño B). Tema oscuro por defecto; claro con `[data-theme="light"]` en `<html>`, fijado antes de pintar por un script en el `<head>` (clave `preferred-theme` en localStorage).
- `js/`: `main.js` (menú, enlace activo, tema, aparición `.reveal`, año), `topology.js` (diagrama SVG animado del hero, red genérica), `cutrepodcast.js` (lista completa de episodios con reproductor en `/cutrepodcast/`, desde `https://cutrepodcast.rjgu.es/episodes.json`).
- `cutrepodcast/index.html` (ES) y `en/cutrepodcast/index.html` (EN): página del podcast con todos los episodios (enlace directo `#ep-N`). La tarjeta de la portada solo enlaza aquí, a iVoox y al RSS.
- `scripts/podcast-pages.mjs`: al construir `_site/` genera `/cutrepodcast/ep-N/` (solo ES; el podcast es en español) desde `episodes.json` y `transcripts/ep-NNN.txt` del bucket: audio, transcripción, fuentes, anterior/siguiente y JSON-LD `PodcastEpisode`. Los episodios con transcripción (24+) van al sitemap; los antiguos sin ella (1-23, de iVoox) salen en `noindex`. Añade `data-pages` a la lista para que `cutrepodcast.js` enlace cada título. Si el JSON o una transcripción fallan, el build falla (no se despliega y sigue la versión anterior). Todo el texto del JSON se escapa; las fuentes solo se enlazan si son http(s).
- `fonts/`: JetBrains Mono variable (subset latin, OFL) alojada en la propia web. Sin Google Fonts ni Font Awesome; iconos en SVG en línea y flechas con máscaras CSS (`.arrow-ext`, `.arrow-right`, `.arrow-down`).
- `service-worker.js` + `manifest.json` (PWA); los iconos están en `img/icons/`.
- `cv/`: CV en HTML (`es.html`, `en.html`, `cv.css`), A4 de una página, mismo estilo que la web en claro. Los PDF se generan con `scripts/build-cv.sh` (Chrome headless) → `Rogert-Guevara-CV.pdf` (ES) y `Rogert-Guevara-CV-EN.pdf` (EN). Usa `fonts/inter-latin-wght.woff2` (Inter, OFL) solo para el CV.
- `scripts/build-site.mjs`: **lista blanca** de lo que se publica → `_site/`. Lo demás (AGENTS.md, README, scripts, `cv/`, tests…) no se despliega. Un fichero público nuevo hay que añadirlo aquí.
- `scripts/validate.mjs`: construye `_site/` y lo valida (JSON, sintaxis JS, `<main>`/un `<h1>`, referencias locales, manifest y precache del SW, y que no se publique nada interno).
- `tests/site.spec.mjs` + `playwright.config.mjs`: pruebas de humo en Chromium (escritorio y móvil) contra `_site/`; el JSON del podcast sale de `tests/fixtures/episodes.json`. `.htmlvalidate.json`: reglas de `html-validate`.
- `404.html`: página de error propia; rutas absolutas porque GitHub Pages la sirve en cualquier URL.
- `lofi/`: **generado, no editar aquí** (ver `lofi/README.md`). Es la versión pública de Rogert's Homelab Live; la genera y sube directamente a `main` el repo `rogertgu/homelab-live` (`~/projects/homelab-live`, `tools/deploy-rjgu.sh`). La portada lo enlaza desde la tarjeta `#homelab-live`; su captura es `img/lofi.png` (PNG: el pixel art pesa ~32 KB sin pérdidas, frente a ~100 KB en JPEG). Se rehace con Playwright a 1152×648, capturando solo el canvas de `https://rjgu.es/lofi/?shot=1&nointro=1&seed=1&still=1&hour=20.8&date=2026-07-15` (atardecer de verano con velero; elegida por Rogert el 2026-10-19) tras esperar ~5 s. Por eso `origin/main` puede tener commits nuevos: hacer `git fetch` e integrar antes de publicar.

## Cómo ejecutar / probar / desplegar
```bash
npm ci                             # Playwright + html-validate (solo desarrollo)
npx playwright install chromium    # la primera vez
npm run check                      # test (Playwright, ~20 s) + validate + lint:html
npm run validate                   # solo la validación estática (construye _site/ con el podcast real: necesita red)
PODCAST_FEED=tests/fixtures/episodes.json npm run build   # _site/ sin red, con el podcast de prueba
npm run serve                      # sirve _site/ en http://127.0.0.1:8765/
scripts/build-cv.sh                # regenera los PDF del CV en la raíz
scripts/build-cv.sh /tmp/preview   # o en otra carpeta para previsualizar
```
- Despliegue: GitHub Actions (`.github/workflows/deploy.yml`): en cada push y PR, Playwright (con `_site/` del fixture del podcast) y después validación + `html-validate` del `_site/` real; en push a `main` sube ese `_site/` a GitHub Pages. También se rehace y despliega L-V a las 06:30 y 12:30 UTC (cron, para publicar las páginas de los episodios nuevos; el cron de GitHub puede llegar con horas de retraso) y con `repository_dispatch` tipo `podcast-published`. Si fallan las pruebas no se despliega (y los builds de `lofi/` que sube homelab-live también pasan por aquí). `CNAME` = `rjgu.es`. DNS en Cloudflare **sin proxy** (nube gris) desde 2026-10-11: `rjgu.es` A/AAAA → IPs de GitHub Pages y `www` CNAME → `rogertgu.github.io`; HTTPS con el certificado de GitHub (Let's Encrypt).
- **Hacer push a `main` publica la web en producción.**
- En local `/cutrepodcast/` muestra el mensaje de error (con enlaces a iVoox/RSS): el CORS del bucket R2 solo admite el origen `rjgu.es`. Para probar con datos, descargar el JSON y servirlo con `page.route` de Playwright.

## Estado actual
(Actualizado 2026-10-24)
- Páginas por episodio del podcast (`/cutrepodcast/ep-N/`) hechas en la rama `episode-pages`, probadas en local (47 pruebas + validación + html-validate con los 34 episodios reales). Pendiente de que Rogert apruebe publicarlas (merge a `main`).
- Publicado en rjgu.es el rediseño B ("ingeniería/terminal"): portada con topología + línea de estado, Sobre mí, Proyectos (FROGLM, Cutrepodcast, Homelab con agentes Hermes/OpenClaw), Experiencia agrupada por empresa, Stack (sin porcentajes; `is-core` = especialidad principal) + certificaciones, Contacto.
- CV nuevo publicado: `Rogert-Guevara-CV.pdf` (ES, enlazado desde `/`) y `Rogert-Guevara-CV-EN.pdf` (EN, enlazado desde `/en/`), generados desde `cv/`.
- Publicadas la página `/cutrepodcast/` (ES/EN, todos los episodios) y la tarjeta "Rogert's Homelab Live" (→ `/lofi/`).
- Desde 2026-10-23 solo se publica `_site/` (lista blanca) y el CI valida y prueba antes de desplegar (primera ejecución OK: run 39907862227, 35 pruebas). Verificado en producción: los ficheros internos dan 404, 404 propia, SW v9, podcast con 33 episodios.
- Proxy de Cloudflare quitado (2026-10-11) porque los bloqueos de LaLiga cortan las IPs compartidas de Cloudflare en las operadoras españolas durante los partidos. `cutrepodcast.rjgu.es` (R2) sigue con proxy y sigue afectado. Marcha atrás: volver a poner los 9 registros (4 A, 4 AAAA de `rjgu.es` y el CNAME `www`) en «Proxied».
- `cutrepodcast.rjgu.es/` (raíz del bucket R2, que no tiene index) redirige con 302 a `https://rjgu.es/cutrepodcast/` mediante una Redirect Rule de la zona `rjgu.es` en Cloudflare (ruleset `http_request_dynamic_redirect`, regla `b03a9af2…`). Solo afecta a la ruta `/`.
- Certificado de GitHub Pages renovado el 2026-10-11 (Let's Encrypt, `rjgu.es` + `www`, caduca 2027-01-09; GitHub lo renueva solo) y `https_enforced` activo. Si vuelve a quedarse en `bad_authz`: quitar el dominio (`gh api -X PUT repos/rogertgu/rjgu.es/pages -F cname=null`), esperar a que `https_certificate` sea `null` y volver a ponerlo (`-f cname=rjgu.es`); la web da 404 mientras tanto (unos 3 min).

## Próximos pasos
0. Podcast: que el pipeline de `~/work/rjgu/cutrepodcast` dispare `repository_dispatch` (`podcast-published`) en este repo al publicar, para no depender del cron de GitHub. Necesita un token con acceso a `rogertgu/rjgu.es` (el PAT actual del Worker solo cubre el repo del podcast). Opcional: transcribir con Whisper los ep. 1-23 (cómputo pesado: pedir aprobación) y subir `transcript_url` al bucket para que dejen de ser `noindex`.
1. CV: añadir formación e idiomas cuando Rogert los dé (no inventarlos) y, si los aporta, logros concretos por puesto en OmniAccess. Tras editar `cv/*.html`: `scripts/build-cv.sh`.
2. La doc del homelab (`~/homelab/infra/network/vlans.md`, 2026-09-27) sitúa MAMA y CRIS en la VLAN 24; Rogert dice (2026-10-11) que los agentes de terceros están aislados. Si se toca esa doc, actualizarla allí (otro repo).
3. Opcional: renombrar `vm-01`/`vm-02` de la topología a `hermes`/`openclaw`.

## Decisiones y restricciones
- Sitio estático sin framework ni compilación: `_site/` es una copia de los ficheros públicos (lista blanca) más las páginas de episodio que genera `scripts/podcast-pages.mjs`. Mantenerlo así salvo que se pida otra cosa.
- Rutas relativas (`img/...`, `../js/...` en `/en/`) para que funcione tanto en local como en Pages.
- Si cambian los ficheros que se cachean, actualizar la lista y subir `CACHE_NAME` en `service-worker.js` (ahora `portfolio-cache-v10`).
- Las páginas de episodio se generan en el build, no se commitean (dependen del bucket, que cambia a diario o al retirar episodios desde el panel).
- La foto de la web es `img/profile.webp` (480 px); `img/profile.jpg` (800 px) solo para `og:image` y JSON-LD.
- Las capturas de Playwright (`.playwright-mcp/`) no se commitean.
- La topología del hero es ilustrativa: no poner nombres, IPs ni estructura real del homelab.
- Sin dependencias externas en tiempo de carga salvo el JSON del podcast.

## Registro
- 2026-10-10 — Claude Code — Recuperada la tarjeta del Cutrepodcast (ES/EN) con los últimos 3 episodios.
- 2026-10-11 — Claude Code — Commit de la limpieza pendiente (accesibilidad, SEO, JS sin uso eliminado, `validate.mjs`, iconos PWA) y creación de este AGENTS.md. Revisión de diseño y plan de rediseño.
- 2026-10-11 — Claude Code — Experiencia: línea de tiempo en una columna, agrupada por empresa (la sección pasa de 2.343 a 1.516 px de alto en escritorio).
- 2026-10-11 — Claude Code — Rediseño B ("ingeniería/terminal") en la rama `redesign-b`: CSS y JS reescritos, nueva estructura, fuente alojada en la web, eliminados config.yml/config-loader y 4 JS antiguos. Página en escritorio de ~8.300 a 4.724 px; en móvil de 10.162 a 6.904 px.
- 2026-10-11 — Claude Code — Homelab con agentes de IA; párrafo de Sobre mí recortado; CV rehecho en HTML→PDF (`cv/`, `scripts/build-cv.sh`), una página ES/EN, pendiente de aprobación.
- 2026-10-11 — Claude Code — Publicado el rediseño B y el CV nuevo (ES/EN) en rjgu.es.
- 2026-10-11 — Claude Code — Página `/cutrepodcast/` (ES/EN) con todos los episodios; tarjeta de la portada reducida a enlaces. Homelab: agentes de terceros aislados de la LAN (confirmado por Rogert).
- 2026-10-11 — Claude Code — Tarjeta "Rogert's Homelab Live" (enlace a `/lofi/`, ES/EN) a petición de la sesión de homelab-live.
- 2026-10-11 — Claude Code — Publicadas la página del Cutrepodcast y la tarjeta de Homelab Live; producción verificada (200 en todas las rutas, SW v8, CORS del JSON OK, 23 episodios).
- 2026-10-11 — Claude Code — Quitado el proxy de Cloudflare de `rjgu.es` y `www` (bloqueos de LaLiga); certificado de GitHub Pages reemitido (estaba en `bad_authz`; ~3 min de 404 al quitar y volver a poner el dominio). Verificado: 200 en todas las rutas, redirecciones `www`/http, certificado hasta 2027-01-09.
- 2026-10-11 — Claude Code — Redirect Rule en Cloudflare: la raíz de `cutrepodcast.rjgu.es` (404 de R2) lleva a `https://rjgu.es/cutrepodcast/`.
- 2026-10-19 — Claude Code — Revisión: el despliegue publicaba todo el repo (AGENTS.md, README, scripts…). Ahora solo `_site/` (lista blanca). Tests nuevos: validación sobre `_site/`, `html-validate` y Playwright (35 pruebas, escritorio + móvil) en CI. 404 propia, reglas de impresión y respaldo si `main.js` no carga. Foto en WebP (77→16 KB), `froglm.svg` optimizado (56→21 KB), SW v9. Borrados firebase.json, generate-icons.js, DEPLOY.md e `img/projects/`. Quitado "vuelve tras un año en pausa" del podcast. Miniatura del lofi rehecha (atardecer de verano) y pasada a PNG (104→32 KB).
- 2026-10-23 — Claude Code — Publicada la revisión y la miniatura nueva (rebasadas sobre el build de lofi 64ab5cb). CI verde a la primera; producción verificada.
- 2026-10-24 — Claude Code — Páginas por episodio del Cutrepodcast generadas al construir (transcripción, fuentes, JSON-LD, sitemap, `noindex` sin transcripción), enlazadas desde la lista ES/EN; CI reordenado (pruebas con fixture, despliegue con datos reales) y reconstrucción programada L-V. SW v10. En la rama `episode-pages`.
