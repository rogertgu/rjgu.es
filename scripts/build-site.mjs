// Copia en _site/ solo lo que se publica en rjgu.es (lista blanca).
// Lo demás del repo (AGENTS.md, README, scripts, fuentes del CV, tests…) no se despliega.
// Además genera las páginas de los episodios del podcast (scripts/podcast-pages.mjs).
//   node scripts/build-site.mjs [carpeta]   (por defecto _site)
//   PODCAST_FEED=tests/fixtures/episodes.json node scripts/build-site.mjs   (sin red)
import { cpSync, existsSync, rmSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPodcastPages } from './podcast-pages.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = resolve(root, process.argv[2] || '_site');

export const PUBLIC = [
  'index.html',
  '404.html',
  'en',
  'cutrepodcast',
  'lofi',
  'css',
  'js',
  'img',
  'fonts/jetbrains-mono-latin-wght.woff2',
  'fonts/JetBrainsMono-OFL.txt',
  'manifest.json',
  'service-worker.js',
  'sitemap.xml',
  'robots.txt',
  'CNAME',
  'Rogert-Guevara-CV.pdf',
  'Rogert-Guevara-CV-EN.pdf'
];

// Nunca se publican, aunque estén dentro de una carpeta pública (p. ej. lofi/README.md)
const skip = source => {
  const name = basename(source);
  return name.endsWith('.md') || name.startsWith('.');
};

if (out === root) throw new Error('La carpeta de salida no puede ser la raíz del repo');
rmSync(out, { recursive: true, force: true });

for (const entry of PUBLIC) {
  const source = join(root, entry);
  if (!existsSync(source)) throw new Error(`Falta ${entry}`);
  cpSync(source, join(out, entry), {
    recursive: statSync(source).isDirectory(),
    filter: path => path === source || !skip(path)
  });
}

const podcast = await buildPodcastPages(out);
console.log(`✓ Podcast: ${podcast.pages} páginas de episodio (${podcast.indexable} indexables) desde ${podcast.feed}`);
console.log(`✓ Sitio en ${out}`);
