# rjgu.es

## Objetivo
Web personal/portfolio de Rogert Guevara (Network & Systems Administrator) en https://rjgu.es, en español (`/`) e inglés (`/en/`). Sitio estático sin build.

## Ubicación y estructura
- Ruta: `~/work/rjgu/rjgu.es` (TARS-11). Remoto: `git@github.com:rogertgu/rjgu.es.git` (privado), rama `main`.
- `index.html` (ES) y `en/index.html` (EN): contenido duplicado; cualquier cambio de contenido o estructura va en ambos.
- `css/styles.css`: todos los estilos, estilo "ingeniería/terminal" (rediseño B). Tema oscuro por defecto; claro con `[data-theme="light"]` en `<html>`, fijado antes de pintar por un script en el `<head>` (clave `preferred-theme` en localStorage).
- `js/`: `main.js` (menú, enlace activo, tema, aparición `.reveal`, año), `topology.js` (diagrama SVG animado del hero, red genérica), `cutrepodcast.js` (lista completa de episodios con reproductor en `/cutrepodcast/`, desde `https://cutrepodcast.rjgu.es/episodes.json`).
- `cutrepodcast/index.html` (ES) y `en/cutrepodcast/index.html` (EN): página del podcast con todos los episodios (enlace directo `#ep-N`). La tarjeta de la portada solo enlaza aquí, a iVoox y al RSS.
- `fonts/`: JetBrains Mono variable (subset latin, OFL) alojada en la propia web. Sin Google Fonts ni Font Awesome; iconos en SVG en línea y flechas con máscaras CSS (`.arrow-ext`, `.arrow-right`, `.arrow-down`).
- `service-worker.js` + `manifest.json` (PWA); los iconos están en `img/icons/`.
- `cv/`: CV en HTML (`es.html`, `en.html`, `cv.css`), A4 de una página, mismo estilo que la web en claro. Los PDF se generan con `scripts/build-cv.sh` (Chrome headless) → `Rogert-Guevara-CV.pdf` (ES) y `Rogert-Guevara-CV-EN.pdf` (EN). Usa `fonts/inter-latin-wght.woff2` (Inter, OFL) solo para el CV.
- `scripts/validate.mjs`: validación estática (JSON, `<main>`/`<h1>`, referencias locales, iconos del manifest cacheados en el SW, sintaxis JS).
- `firebase.json`: restos de un despliegue antiguo en Firebase; no se usa.
- `lofi/`: **generado, no editar aquí** (ver `lofi/README.md`). Es la versión pública de Rogert's Homelab Live; la genera y sube directamente a `main` el repo `rogertgu/homelab-live` (`~/projects/homelab-live`, `tools/deploy-rjgu.sh`). La portada lo enlaza desde la tarjeta `#homelab-live`; su captura es `img/lofi.jpg` (sacada de `https://rjgu.es/lofi/?nointro=1&seed=1&hour=20.5&still=1` y recortada al canvas; para rehacerla sin ayuda ni controles usar además `shot=1`: `https://rjgu.es/lofi/?shot=1&nointro=1&seed=1&hour=20.5&still=1`). Por eso `origin/main` puede tener commits nuevos: hacer `git fetch` e integrar antes de publicar.

## Cómo ejecutar / probar / desplegar
```bash
node scripts/validate.mjs          # o: npm run validate
scripts/build-cv.sh                # regenera los PDF del CV en la raíz
scripts/build-cv.sh /tmp/preview   # o en otra carpeta para previsualizar
python3 -m http.server 8765 --bind 127.0.0.1   # http://127.0.0.1:8765/
```
- Despliegue: GitHub Actions (`.github/workflows/deploy.yml`) publica en GitHub Pages en cada push a `main` (las PR solo validan). `CNAME` = `rjgu.es`. DNS en Cloudflare **sin proxy** (nube gris) desde 2026-10-11: `rjgu.es` A/AAAA → IPs de GitHub Pages y `www` CNAME → `rogertgu.github.io`; HTTPS con el certificado de GitHub (Let's Encrypt).
- **Hacer push a `main` publica la web en producción.**
- En local `/cutrepodcast/` muestra el mensaje de error (con enlaces a iVoox/RSS): el CORS del bucket R2 solo admite el origen `rjgu.es`. Para probar con datos, descargar el JSON y servirlo con `page.route` de Playwright.

## Estado actual
(Actualizado 2026-10-11)
- Publicado en rjgu.es el rediseño B ("ingeniería/terminal"): portada con topología + línea de estado, Sobre mí, Proyectos (FROGLM, Cutrepodcast, Homelab con agentes Hermes/OpenClaw), Experiencia agrupada por empresa, Stack (sin porcentajes; `is-core` = especialidad principal) + certificaciones, Contacto.
- CV nuevo publicado: `Rogert-Guevara-CV.pdf` (ES, enlazado desde `/`) y `Rogert-Guevara-CV-EN.pdf` (EN, enlazado desde `/en/`), generados desde `cv/`.
- Publicadas la página `/cutrepodcast/` (ES/EN, todos los episodios) y la tarjeta "Rogert's Homelab Live" (→ `/lofi/`). SW en `portfolio-cache-v8`.
- Proxy de Cloudflare quitado (2026-10-11) porque los bloqueos de LaLiga cortan las IPs compartidas de Cloudflare en las operadoras españolas durante los partidos. `cutrepodcast.rjgu.es` (R2) sigue con proxy y sigue afectado. Marcha atrás: volver a poner los 9 registros (4 A, 4 AAAA de `rjgu.es` y el CNAME `www`) en «Proxied».
- Certificado de GitHub Pages renovado el 2026-10-11 (Let's Encrypt, `rjgu.es` + `www`, caduca 2027-01-09; GitHub lo renueva solo) y `https_enforced` activo. Si vuelve a quedarse en `bad_authz`: quitar el dominio (`gh api -X PUT repos/rogertgu/rjgu.es/pages -F cname=null`), esperar a que `https_certificate` sea `null` y volver a ponerlo (`-f cname=rjgu.es`); la web da 404 mientras tanto (unos 3 min).

## Próximos pasos
1. CV: añadir formación e idiomas cuando Rogert los dé (no inventarlos) y, si los aporta, logros concretos por puesto en OmniAccess. Tras editar `cv/*.html`: `scripts/build-cv.sh`.
2. La doc del homelab (`~/homelab/infra/network/vlans.md`, 2026-09-27) sitúa MAMA y CRIS en la VLAN 24; Rogert dice (2026-10-11) que los agentes de terceros están aislados. Si se toca esa doc, actualizarla allí (otro repo).
3. Opcional: renombrar `vm-01`/`vm-02` de la topología a `hermes`/`openclaw`.
4. Opcional: `img/projects/` parece sin uso; revisar y borrar.

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
- 2026-10-11 — Claude Code — Publicado el rediseño B y el CV nuevo (ES/EN) en rjgu.es.
- 2026-10-11 — Claude Code — Página `/cutrepodcast/` (ES/EN) con todos los episodios; tarjeta de la portada reducida a enlaces. Homelab: agentes de terceros aislados de la LAN (confirmado por Rogert).
- 2026-10-11 — Claude Code — Tarjeta "Rogert's Homelab Live" (enlace a `/lofi/`, ES/EN) a petición de la sesión de homelab-live.
- 2026-10-11 — Claude Code — Publicadas la página del Cutrepodcast y la tarjeta de Homelab Live; producción verificada (200 en todas las rutas, SW v8, CORS del JSON OK, 23 episodios).
- 2026-10-11 — Claude Code — Quitado el proxy de Cloudflare de `rjgu.es` y `www` (bloqueos de LaLiga); certificado de GitHub Pages reemitido (estaba en `bad_authz`; ~3 min de 404 al quitar y volver a poner el dominio). Verificado: 200 en todas las rutas, redirecciones `www`/http, certificado hasta 2027-01-09.
