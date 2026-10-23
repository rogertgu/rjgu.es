// Una página por episodio del Cutrepodcast (/cutrepodcast/ep-N/), generada al construir _site/.
// Lee episodes.json y las transcripciones del bucket público (o de una copia local con
// PODCAST_FEED=tests/fixtures/episodes.json; entonces las transcripciones salen de
// tests/fixtures/transcripts/). Si el JSON o una transcripción no se pueden leer, falla:
// mejor no desplegar que publicar páginas a medias.
//   - Episodios con transcripción: indexables y en el sitemap.
//   - Sin transcripción (los antiguos de iVoox): página con audio y descripción, en noindex.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';

export const FEED_URL = 'https://cutrepodcast.rjgu.es/episodes.json';
const SITE_URL = 'https://rjgu.es';
const IVOOX = 'https://www.ivoox.com/podcast-cutrepodcast-noticias-tecnologia_sq_f12725526_1.html';

// Todos los atributos de la plantilla van entre comillas dobles, así que basta con estas cuatro
const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Solo URLs http(s) o rutas absolutas del propio sitio (las del fixture de pruebas)
const safeUrl = value => {
  const url = String(value ?? '').trim();
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol) ? url : '';
  } catch {
    return '';
  }
};

const formatDate = iso => new Date(`${iso}T12:00:00Z`).toLocaleDateString(
  'es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const formatDuration = total => {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
};

const isoDuration = total => `PT${Math.floor(total / 60)}M${total % 60}S`;

const summary = (text, max = 160) => {
  const flat = String(text ?? '').replace(/\s+/g, ' ').trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

const paragraphs = text => String(text ?? '')
  .split(/\n\s*\n/)
  .map(paragraph => paragraph.replace(/\s+/g, ' ').trim())
  .filter(Boolean);

const sourceLabel = url => {
  const { hostname, pathname } = new URL(url);
  const path = pathname.replace(/\/+$/, '');
  return { host: hostname.replace(/^www\./, ''), path: path.length > 60 ? `${path.slice(0, 59)}…` : path };
};

const isLocal = feed => !/^https?:\/\//i.test(feed);

async function readText(location, timeout = 20000) {
  if (isLocal(location)) return readFileSync(location, 'utf8');
  const response = await fetch(location, { signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`${location}: HTTP ${response.status}`);
  return response.text();
}

// Transcripciones en tandas pequeñas para no abrir cientos de conexiones a la vez
async function loadTranscripts(episodes, feed) {
  const transcripts = new Map();
  const pending = episodes.filter(episode => episode.transcript_url);
  for (let index = 0; index < pending.length; index += 8) {
    await Promise.all(pending.slice(index, index + 8).map(async episode => {
      const location = isLocal(feed)
        ? join(dirname(feed), 'transcripts', basename(new URL(episode.transcript_url, FEED_URL).pathname))
        : safeUrl(episode.transcript_url);
      if (!location) throw new Error(`Episodio ${episode.number}: transcript_url no válida`);
      transcripts.set(episode.number, await readText(location));
    }));
  }
  return transcripts;
}

function renderPage(episode, { transcript, newer, older }) {
  const number = episode.number;
  const title = episode.title || episode.full_title || `Episodio ${number}`;
  const url = `${SITE_URL}/cutrepodcast/ep-${number}/`;
  // <title> de 70 caracteres como mucho (regla long-title de html-validate y lo que muestra Google)
  const pageTitle = [`${title} · Cutrepodcast #${number}`, `${title} · Cutrepodcast`]
    .find(candidate => candidate.length <= 70) || summary(title, 70);
  const description = String(episode.description ?? '').trim();
  const metaDescription = summary(description || `Episodio ${number} del Cutrepodcast: noticias de tecnología escritas y locutadas por IA.`);
  const cover = safeUrl(episode.image_url) || '../../img/cutrepodcast.jpg';
  const ogImage = /^https?:/.test(cover) ? cover : `${SITE_URL}/img/cutrepodcast.jpg`;
  const audio = safeUrl(episode.audio_url);
  const text = paragraphs(transcript);
  const sources = (episode.sources || []).map(safeUrl).filter(source => /^https?:/.test(source));
  const tags = (episode.tags || []).map(String).filter(Boolean);
  const meta = [`episodio ${number}`, formatDate(episode.date)];
  if (episode.duration) meta.push(formatDuration(episode.duration));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    url,
    name: title,
    episodeNumber: number,
    datePublished: episode.date,
    description: summary(description, 300) || undefined,
    image: ogImage,
    timeRequired: episode.duration ? isoDuration(episode.duration) : undefined,
    associatedMedia: { '@type': 'MediaObject', contentUrl: audio },
    partOfSeries: { '@type': 'PodcastSeries', name: 'Cutrepodcast', url: `${SITE_URL}/cutrepodcast/` }
  };

  const pagerLink = (target, rel, label) => target
    ? `<a href="../ep-${target.number}/" class="pager-link pager-${rel}" rel="${rel}"><span class="pager-label">${label}</span><span class="pager-title">#${target.number} · ${escapeHtml(target.title || target.full_title)}</span></a>`
    : '<span></span>';

  return `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}">
    <meta name="author" content="Rogert Guevara Uzcátegui">
    <meta name="theme-color" content="#0b0d10">
${text.length ? '' : '    <meta name="robots" content="noindex, follow">\n'}    <link rel="canonical" href="${url}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="es_ES">
    <meta property="og:title" content="${escapeHtml(title)} · Cutrepodcast #${number}">
    <meta property="og:description" content="${escapeHtml(metaDescription)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${escapeHtml(ogImage)}">
    <meta name="twitter:card" content="summary">
    <link rel="alternate" type="application/rss+xml" title="Cutrepodcast" href="https://cutrepodcast.rjgu.es/feed.xml">

    <link rel="icon" href="../../img/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="../../img/icons/icon-192x192.png">
    <link rel="manifest" href="../../manifest.json">

    <!-- Tema guardado antes de pintar, para evitar el parpadeo -->
    <script>
        (function () {
            var theme = 'dark';
            try { theme = localStorage.getItem('preferred-theme') === 'light' ? 'light' : 'dark'; } catch (e) {}
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.classList.add('js');
        })();
    </script>

    <link rel="preload" href="../../fonts/jetbrains-mono-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="../../css/styles.css">

    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
</head>
<body>
    <a href="#main-content" class="skip-link">Saltar al contenido</a>

    <nav class="main-nav" aria-label="Navegación principal">
        <div class="container nav-inner">
            <a href="../../" class="logo" aria-label="RJGU"><span class="prompt">~/</span>rjgu<span class="cursor" aria-hidden="true"></span></a>
            <a href="../" class="nav-back">Episodios</a>
            <div class="nav-tools">
                <button type="button" class="icon-btn theme-toggle" aria-label="Cambiar a tema claro" title="Cambiar a tema claro">
                    <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
                    <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
                </button>
            </div>
        </div>
    </nav>

    <main id="main-content">
    <section class="hero podcast-hero episode-hero">
        <div class="container podcast-intro">
            <img src="${escapeHtml(cover)}" alt="Portada del episodio ${number}" class="podcast-cover" width="288" height="288">
            <div>
                <p class="hero-kicker">${meta.map(escapeHtml).join(' · ')}</p>
                <h1>${escapeHtml(title)}</h1>
${description ? `                <p class="podcast-lead">${escapeHtml(description)}</p>\n` : ''}${audio ? `                <audio class="episode-player" controls preload="none" src="${escapeHtml(audio)}" aria-label="${escapeHtml(episode.full_title || title)}"></audio>\n` : ''}${tags.length ? `                <div class="tags">${tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}</div>\n` : ''}            </div>
        </div>
    </section>
${text.length ? `
    <section id="transcripcion" class="section">
        <div class="container episode-text">
            <header class="section-head">
                <span class="section-index">txt</span>
                <h2>Transcripción</h2>
            </header>
            <div class="transcript">
${text.map(paragraph => `                <p>${escapeHtml(paragraph)}</p>`).join('\n')}
            </div>
            <p class="episode-note">Guion y voz generados por IA a partir de las noticias enlazadas abajo. Puede contener errores: ante la duda, manda la fuente.</p>
        </div>
    </section>
` : ''}${sources.length ? `
    <section id="fuentes" class="section section-alt">
        <div class="container episode-text">
            <header class="section-head">
                <span class="section-index">src</span>
                <h2>Fuentes</h2>
            </header>
            <ul class="sources">
${sources.map(source => {
    const { host, path } = sourceLabel(source);
    return `                <li><a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer"><span class="source-host">${escapeHtml(host)}</span><span class="source-path">${escapeHtml(path)}</span></a></li>`;
  }).join('\n')}
            </ul>
        </div>
    </section>
` : ''}
    <nav class="section episode-pager-wrap" aria-label="Otros episodios">
        <div class="container episode-text">
            <div class="episode-pager">
                ${pagerLink(older, 'prev', '← anterior')}
                ${pagerLink(newer, 'next', 'siguiente →')}
            </div>
            <div class="btn-row">
                <a href="../" class="btn">Todos los episodios</a>
                <a href="${IVOOX}" class="btn arrow arrow-ext" target="_blank" rel="noopener noreferrer">iVoox</a>
                <a href="https://cutrepodcast.rjgu.es/feed.xml" class="btn arrow arrow-ext" target="_blank" rel="noopener noreferrer">RSS</a>
            </div>
        </div>
    </nav>
    </main>

    <footer class="footer">
        <div class="container">
            <span>&copy; <span id="current-year">2026</span> RJGU · Network &amp; Systems Administrator</span>
            <span>Vibe-coded con IA</span>
        </div>
    </footer>

    <script src="../../js/main.js"></script>
</body>
</html>
`;
}

function sitemapEntries(episodes) {
  return episodes.map(episode => `  <url>
    <loc>${SITE_URL}/cutrepodcast/ep-${episode.number}/</loc>
    <lastmod>${episode.date}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
`).join('');
}

// Genera las páginas en <site>/cutrepodcast/ep-N/, las añade al sitemap y deja en la
// lista de episodios (ES/EN) qué números tienen página, para que cutrepodcast.js los enlace.
export async function buildPodcastPages(site, feed = process.env.PODCAST_FEED || FEED_URL) {
  const source = isLocal(feed) && !isAbsolute(feed) ? resolve(feed) : feed;
  const episodes = JSON.parse(await readText(source))
    .filter(episode => Number.isInteger(episode.number) && safeUrl(episode.audio_url) && /^\d{4}-\d{2}-\d{2}$/.test(episode.date || ''))
    .sort((a, b) => a.number - b.number);
  if (!episodes.length) throw new Error('episodes.json no tiene episodios publicables');

  const transcripts = await loadTranscripts(episodes, source);

  episodes.forEach((episode, index) => {
    const directory = join(site, 'cutrepodcast', `ep-${episode.number}`);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, 'index.html'), renderPage(episode, {
      transcript: transcripts.get(episode.number),
      older: episodes[index - 1],
      newer: episodes[index + 1]
    }));
  });

  const indexable = episodes.filter(episode => paragraphs(transcripts.get(episode.number)).length);
  const sitemapFile = join(site, 'sitemap.xml');
  const sitemap = readFileSync(sitemapFile, 'utf8');
  if (!sitemap.includes('</urlset>')) throw new Error('sitemap.xml sin </urlset>');
  writeFileSync(sitemapFile, sitemap.replace('</urlset>', `${sitemapEntries(indexable)}</urlset>`));

  const numbers = episodes.map(episode => episode.number).join(',');
  for (const list of ['cutrepodcast/index.html', 'en/cutrepodcast/index.html']) {
    const file = join(site, list);
    const html = readFileSync(file, 'utf8');
    if (!html.includes('<ol class="episodes"')) throw new Error(`${list}: falta <ol class="episodes">`);
    writeFileSync(file, html.replace('<ol class="episodes"', `<ol class="episodes" data-pages="${numbers}"`));
  }

  return { pages: episodes.length, indexable: indexable.length, feed: source };
}
