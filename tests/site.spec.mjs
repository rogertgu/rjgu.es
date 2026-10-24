// Pruebas de humo de rjgu.es en escritorio y móvil, contra _site/ en local.
// El JSON del podcast se sirve desde tests/fixtures (el bucket real solo admite CORS de rjgu.es).
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const FEED = 'https://cutrepodcast.rjgu.es/episodes.json';
const fixture = readFileSync(new URL('./fixtures/episodes.json', import.meta.url), 'utf8');

const PAGES = [
  { path: '/', lang: 'es' },
  { path: '/en/', lang: 'en' },
  { path: '/cutrepodcast/', lang: 'es' },
  { path: '/en/cutrepodcast/', lang: 'en' },
  { path: '/cutrepodcast/ep-3/', lang: 'es' },
  { path: '/cutrepodcast/ep-2/', lang: 'es' },
  { path: '/404.html', lang: 'es' }
];

// Errores de consola, excepciones y peticiones fallidas durante la prueba
test.beforeEach(async ({ page }, testInfo) => {
  const problems = [];
  testInfo.problems = problems;
  page.on('console', message => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  page.on('pageerror', error => problems.push(`pageerror: ${error.message}`));
  page.on('requestfailed', request => {
    if (request.failure()?.errorText !== 'net::ERR_ABORTED') problems.push(`requestfailed: ${request.url()}`);
  });
  page.on('response', response => {
    if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  await page.route(FEED, route => route.fulfill({
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: fixture
  }));
});

const scrollToBottom = async page => {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 300) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(60);
  }
};

for (const { path, lang } of PAGES) {
  test(`${path}: carga sin errores, sin desbordes y con todo visible`, async ({ page }, testInfo) => {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);

    await scrollToBottom(page);
    const hidden = await page.locator('.reveal:not(.is-visible)').count();
    expect(hidden, 'bloques .reveal sin mostrar tras recorrer la página').toBe(0);

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'desbordamiento horizontal (px)').toBeLessThanOrEqual(0);

    const images = await page.evaluate(() => [...document.images].map(image => ({
      src: image.currentSrc || image.src,
      alt: image.hasAttribute('alt'),
      ok: image.complete && image.naturalWidth > 0
    })));
    for (const image of images) {
      expect(image.alt, `${image.src} sin alt`).toBe(true);
      expect(image.ok, `${image.src} no carga`).toBe(true);
    }

    expect(testInfo.problems).toEqual([]);
  });
}

test('enlaces internos de las portadas responden 200', async ({ page, request }) => {
  const targets = new Set();
  for (const path of ['/', '/en/', '/cutrepodcast/', '/en/cutrepodcast/', '/cutrepodcast/ep-2/']) {
    await page.goto(path);
    const hrefs = await page.$$eval('a[href]', anchors => anchors.map(anchor => anchor.href));
    hrefs.filter(href => href.startsWith(new URL(page.url()).origin))
      .forEach(href => targets.add(href.split('#')[0]));
  }
  for (const url of targets) {
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
  }
});

test('sin enlaces a iVoox mientras no se arregle allí el hosting', async ({ page }) => {
  for (const path of ['/', '/en/', '/cutrepodcast/', '/en/cutrepodcast/', '/cutrepodcast/ep-3/']) {
    await page.goto(path);
    await expect(page.locator('a[href*="ivoox.com"]'), path).toHaveCount(0);
  }
});

test('no se publican ficheros internos', async ({ request }) => {
  for (const path of ['/AGENTS.md', '/README.md', '/package.json', '/scripts/validate.mjs', '/cv/es.html', '/lofi/README.md', '/tests/site.spec.mjs']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
});

test('cambio de tema: se aplica y se recuerda', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.locator('.theme-toggle').click();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.theme-toggle')).toHaveAttribute('aria-label', 'Cambiar a tema oscuro');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');
});

test('idioma: ES y EN se enlazan entre sí', async ({ page }) => {
  await page.goto('/');
  await page.locator('.lang-link[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto('/en/cutrepodcast/');
  await page.locator('.lang-link[hreflang="es"]').click();
  await expect(page).toHaveURL(/\/cutrepodcast\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('menú móvil: abre, navega y se cierra', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'solo en móvil');
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.locator('.nav-link[href="#proyectos"]').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#proyectos$/);
});

test('podcast: pinta los episodios con audio, del más nuevo al más antiguo', async ({ page }) => {
  await page.goto('/cutrepodcast/');
  const episodes = page.locator('.episode');
  await expect(episodes).toHaveCount(3);
  await expect(page.locator('.episode-num')).toHaveText(['#3', '#2', '#1']);
  await expect(page.locator('.episodes-status')).toContainText('3 episodios');
  await expect(page.locator('.episodes-error')).toBeHidden();
  await expect(page.locator('#ep-3 audio')).toHaveAttribute('preload', 'none');
  // Sin portada propia usa la del programa
  await expect(page.locator('#ep-2 .episode-cover')).toHaveAttribute('src', /cutrepodcast\.jpg$/);
  // Duración con horas
  await expect(page.locator('#ep-3 .episode-meta')).toContainText('1:02:05');
});

test('podcast: "Ver más" despliega la descripción larga', async ({ page }) => {
  await page.goto('/cutrepodcast/');
  const more = page.locator('#ep-3 .episode-more');
  await expect(more).toBeVisible();
  await expect(page.locator('#ep-1 .episode-more')).toBeHidden();
  await more.click();
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await expect(more).toHaveText('Ver menos');
  await expect(page.locator('#ep-3 .episode-desc')).toHaveClass(/is-open/);
});

test('podcast: enlace directo a un episodio', async ({ page }) => {
  await page.goto('/cutrepodcast/#ep-1');
  await expect(page.locator('#ep-1')).toBeInViewport();
});

test('podcast: si el JSON falla, muestra el RSS', async ({ page }, testInfo) => {
  await page.unroute(FEED);
  await page.route(FEED, route => route.abort());
  await page.goto('/en/cutrepodcast/');
  const error = page.locator('.episodes-error');
  await expect(error).toBeVisible();
  await expect(error.locator('a')).toHaveCount(1);
  await expect(error.locator('a')).toHaveAttribute('href', 'https://cutrepodcast.rjgu.es/feed.xml');
  await expect(page.locator('.episodes')).toBeHidden();
  await expect(page.locator('.episodes-status')).toBeHidden();
  testInfo.problems.length = 0; // el fallo es intencionado
});

test('episodio: página con audio, transcripción, fuentes y navegación', async ({ page }) => {
  await page.goto('/cutrepodcast/ep-3/');
  await expect(page.locator('h1')).toHaveText('Episodio de prueba tres');
  await expect(page).toHaveTitle('Episodio de prueba tres · Cutrepodcast #3');
  await expect(page.locator('.hero-kicker')).toHaveText('episodio 3 · 7 ene 2026 · 1:02:05');
  await expect(page.locator('audio.episode-player')).toHaveAttribute('src', '/tests-audio/ep-003.mp3');
  await expect(page.locator('audio.episode-player')).toHaveAttribute('preload', 'none');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rjgu.es/cutrepodcast/ep-3/');

  // Párrafos separados por línea en blanco; los saltos sueltos se unen
  const transcript = page.locator('.transcript p');
  await expect(transcript).toHaveCount(3);
  await expect(transcript.last()).toHaveText('Y con esto nos despedimos.');

  // Solo fuentes http(s)
  const sources = page.locator('.sources a');
  await expect(sources).toHaveCount(2);
  await expect(sources.first()).toHaveAttribute('href', 'https://www.example.com/noticias/2026/01/07/una-noticia-de-prueba/');
  await expect(sources.first().locator('.source-host')).toHaveText('example.com');

  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(jsonLd).toMatchObject({ '@type': 'PodcastEpisode', episodeNumber: 3, datePublished: '2026-01-07', timeRequired: 'PT62M5S' });

  // Sin episodio 4 (no tiene audio): solo "anterior"
  await expect(page.locator('.pager-link')).toHaveCount(1);
  await page.locator('.pager-prev').click();
  await expect(page).toHaveURL(/\/cutrepodcast\/ep-2\/$/);
});

test('episodio: el contenido del JSON se pinta como texto, nunca como HTML', async ({ page }) => {
  const dialogs = [];
  page.on('dialog', dialog => {
    dialogs.push(dialog.message());
    dialog.dismiss();
  });
  await page.goto('/cutrepodcast/ep-3/');
  await expect(page.locator('.transcript p').nth(1)).toContainText('<script>alert("xss")</script>');
  await expect(page.locator('.tag').last()).toHaveText('#<b>html</b>');
  await expect(page.locator('main script, main b')).toHaveCount(0);
  expect(dialogs).toEqual([]);
});

test('episodio sin transcripción: noindex y fuera del sitemap', async ({ page, request }) => {
  await page.goto('/cutrepodcast/ep-2/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.locator('#transcripcion')).toHaveCount(0);
  // Sin portada propia usa la del programa
  await expect(page.locator('.podcast-cover')).toHaveAttribute('src', '../../img/cutrepodcast.jpg');

  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://rjgu.es/cutrepodcast/ep-3/</loc>');
  expect(sitemap).not.toContain('/cutrepodcast/ep-2/');
  expect((await request.get('/cutrepodcast/ep-4/')).status()).toBe(404);
});

test('podcast: la lista enlaza cada episodio con su página (ES y EN)', async ({ page }) => {
  await page.goto('/en/cutrepodcast/');
  await page.locator('#ep-3 .episode-title a').click();
  await expect(page).toHaveURL(/\/cutrepodcast\/ep-3\/$/);
  await expect(page.locator('h1')).toHaveText('Episodio de prueba tres');
  await page.locator('.nav-back').click();
  await expect(page).toHaveURL(/\/cutrepodcast\/$/);
  await expect(page.locator('#ep-1 .episode-title a')).toHaveAttribute('href', './ep-1/');
});

test('404: página propia con la ruta pedida', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('h1')).toHaveText('Página no encontrada');
  await expect(page.locator('.not-found-path')).toHaveText('/404.html');
  await expect(page.locator('a.btn[href="/"]')).toBeVisible();
});

test('sin main.js el contenido aparece igualmente', async ({ page }) => {
  await page.route('**/js/main.js', route => route.abort());
  await page.goto('/');
  const block = page.locator('#experiencia .reveal').first();
  await expect(block).toHaveCSS('opacity', '1', { timeout: 6000 });
});

test('impresión: todo visible, sin barra de navegación y en claro', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#contacto .reveal').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.main-nav')).toBeHidden();
  const background = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
  expect(background).toBe('#ffffff');
});

test('movimiento reducido: sin animación de aparición', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#contacto .reveal').first()).toHaveCSS('opacity', '1');
  await context.close();
});
