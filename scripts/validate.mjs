// Validación estática de lo que se publica. Construye _site/ (scripts/build-site.mjs)
// y comprueba sobre esa carpeta:
//   - JSON y sintaxis JS válidos;
//   - cada página tiene <main> y un solo <h1>, y sus referencias locales existen;
//   - el manifest y la lista de precache del service worker apuntan a ficheros publicados;
//   - no se publica nada interno (Markdown, package.json, scripts, fuentes del CV…).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const site = join(root, '_site');
const errors = [];
const report = (condition, message) => {
  if (!condition) errors.push(message);
};

execFileSync(process.execPath, [join(root, 'scripts/build-site.mjs'), site], { stdio: 'pipe' });

const read = file => readFileSync(join(site, file), 'utf8');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
const files = walk(site).map(file => relative(site, file));

// ----- JSON y JavaScript -----
for (const file of ['manifest.json']) {
  try {
    JSON.parse(read(file));
  } catch (error) {
    errors.push(`${file}: JSON inválido (${error.message})`);
  }
}
try {
  JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
} catch (error) {
  errors.push(`package.json: JSON inválido (${error.message})`);
}

for (const file of files.filter(file => file.endsWith('.js') && !file.startsWith('lofi/'))) {
  try {
    execFileSync(process.execPath, ['--check', join(site, file)], { stdio: 'pipe' });
  } catch {
    errors.push(`${file}: JavaScript inválido`);
  }
}

// ----- Páginas -----
const pages = ['index.html', 'en/index.html', 'cutrepodcast/index.html', 'en/cutrepodcast/index.html', '404.html'];
for (const file of pages) {
  report(existsSync(join(site, file)), `${file}: no existe`);
  if (!existsSync(join(site, file))) continue;
  const html = read(file);
  report(html.includes('<main'), `${file}: falta el elemento <main>`);
  report((html.match(/<h1\b/g) || []).length === 1, `${file}: debe contener exactamente un <h1>`);

  const pageDirectory = file.includes('/') ? file.slice(0, file.lastIndexOf('/')) : '';
  const references = [...html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/g)]
    .map(match => match[1])
    .filter(reference => !/^(?:[a-z]+:|\/\/|mailto:|tel:|data:)/i.test(reference));

  for (const reference of new Set(references)) {
    const target = reference.startsWith('/') ? reference.slice(1) : join(pageDirectory, reference);
    report(existsSync(join(site, target)), `${file}: referencia local inexistente: ${reference}`);
  }
}
report(existsSync(join(site, 'lofi/index.html')), 'lofi/index.html: no existe');

// ----- Manifest y service worker -----
const manifest = JSON.parse(read('manifest.json'));
const serviceWorker = read('service-worker.js');
for (const icon of manifest.icons || []) {
  report(existsSync(join(site, icon.src)), `manifest.json: falta ${icon.src}`);
  report(serviceWorker.includes(`assetUrl('${icon.src}')`), `service-worker.js: no cachea ${icon.src}`);
}
for (const [, path] of serviceWorker.matchAll(/assetUrl\('([^']*)'\)/g)) {
  const target = path === '' || path.endsWith('/') ? join(path, 'index.html') : path;
  report(existsSync(join(site, target)), `service-worker.js: precachea ${path || '/'}, que no se publica`);
}

// ----- Nada interno -----
for (const file of files) {
  report(!/\.md$/i.test(file), `${file}: Markdown publicado`);
  report(!/(^|\/)(package(-lock)?\.json|firebase\.json|node_modules|scripts|tests|cv)(\/|$)/.test(file),
    `${file}: fichero interno publicado`);
}

if (errors.length > 0) {
  console.error(errors.map(error => `✗ ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`✓ Validación estática completada (${files.length} ficheros en _site/)`);
}
