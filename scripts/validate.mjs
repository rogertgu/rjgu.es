import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const errors = [];

const read = file => readFileSync(join(root, file), 'utf8');
const report = (condition, message) => {
  if (!condition) errors.push(message);
};

for (const file of ['package.json', 'manifest.json', 'firebase.json']) {
  try {
    JSON.parse(read(file));
  } catch (error) {
    errors.push(`${file}: JSON inválido (${error.message})`);
  }
}

for (const file of ['index.html', 'en/index.html', 'cutrepodcast/index.html', 'en/cutrepodcast/index.html']) {
  const html = read(file);
  report(html.includes('<main'), `${file}: falta el elemento <main>`);
  report((html.match(/<h1\b/g) || []).length === 1, `${file}: debe contener exactamente un <h1>`);

  const pageDirectory = file.includes('/') ? file.slice(0, file.lastIndexOf('/')) : '';
  const references = [...html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/g)]
    .map(match => match[1])
    .filter(reference => !/^(?:[a-z]+:|\/\/|mailto:|tel:|data:)/i.test(reference));

  for (const reference of new Set(references)) {
    const relativePath = reference.startsWith('/')
      ? reference.slice(1)
      : join(pageDirectory, reference);
    report(
      existsSync(join(root, relativePath)),
      `${file}: referencia local inexistente: ${reference}`
    );
  }
}

const manifest = JSON.parse(read('manifest.json'));
for (const icon of manifest.icons || []) {
  report(existsSync(join(root, icon.src)), `manifest.json: falta ${icon.src}`);
}

const serviceWorker = read('service-worker.js');
for (const icon of manifest.icons || []) {
  report(serviceWorker.includes(`assetUrl('${icon.src}')`), `service-worker.js: no cachea ${icon.src}`);
}

const jsFiles = [
  'js/cutrepodcast.js',
  'js/main.js',
  'js/topology.js',
  'service-worker.js'
];

for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', join(root, file)], { stdio: 'pipe' });
  } catch (error) {
    errors.push(`${file}: JavaScript inválido`);
  }
}

if (errors.length > 0) {
  console.error(errors.map(error => `✗ ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('✓ Validación estática completada');
}
