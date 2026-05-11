# rjgu.es — Portfolio template

Personal portfolio / tech CV as a static site. Bilingual (ES/EN), dark theme, PWA-ready, zero build step. Served live at **[rjgu.es](https://rjgu.es)**.

This repo is also intended as a **template** — fork it, swap the content, and deploy your own. The guide below covers every place you need to touch.

---

## Features

- Single-page, vanilla HTML + CSS + JS — no framework, no build step
- Two languages out of the box (`/` Spanish, `/en/` English) with `hreflang` + `sitemap.xml` alternates for SEO
- Dark theme by default with a light-mode toggle
- Hero with network/particles animation, glitch + typing text effects, glassmorphism cards, animated skill bars
- PWA: installable, service-worker cache for offline use
- Mobile-first, responsive nav with hamburger
- Deploys via GitHub Pages on every push to `main` (workflow included)

## Quick start (local)

Any static server will do. Two options:

```bash
# Node
npx serve . -l 3000          # http://localhost:3000

# Python
python -m http.server 8000   # http://localhost:8000
```

Open `http://localhost:3000/` (ES) and `http://localhost:3000/en/` (EN).

> If you've visited the live site before, a service worker may be caching old assets in your browser. Use `Ctrl+Shift+R` or *DevTools → Application → Service Workers → Unregister* to see your local edits.

---

## Customize for your own portfolio

The project is intentionally simple: most personal data lives directly in the HTML. The fastest path to your own version is a **find-and-replace** pass + swapping the photo.

### 1. Find & replace these strings

Run these replacements across `index.html` and `en/index.html` (both languages):

| Find | Replace with | Notes |
|---|---|---|
| `Rogert Guevara Uzcátegui` | Your full name | Hero `<h1>`, about section, glitch `data-text` |
| `RJGU` | Your initials / brand | Nav logo, footer logo, `<meta name="author">`, copyright |
| `rogert@rjgu.es` | Your contact email | 5 occurrences per file (hero CTA, about, contact section, footer) |
| `Network & Systems Administrator` | Your role / title | Hero subtitle, about heading, footer tagline |
| `Palma, Islas Baleares, España` | Your location (ES) | About + contact |
| `Palma, Balearic Islands, Spain` | Your location (EN) | About + contact |
| `https://www.linkedin.com/in/rogert-guevara-uzcategui` | Your LinkedIn URL | Hero + footer in both files, also `config.yml` |
| `https://github.com/rogertgu` | Your GitHub URL | Hero + footer in both files |
| `https://rjgu.es/` | Your domain | `<link rel="alternate" hreflang>` in `<head>` of both files + `sitemap.xml` |

A one-shot pass with `sed` (Linux/macOS, adjust strings):

```bash
sed -i 's|rogert@rjgu.es|your@email.com|g' index.html en/index.html
sed -i 's|Rogert Guevara Uzcátegui|Your Name|g' index.html en/index.html
# ...and so on
```

### 2. Profile photo

Replace `img/profile.jpg` with your own (square, ~800×800px works well). The path is referenced from `config.yml` (`profile_picture_url`) — `js/config-loader.js` reads it and sets the `<img src>` at runtime. If you change the filename, update `config.yml` accordingly. **Keep the leading `/`** in the path so it works from both `/` and `/en/`.

### 3. Section content

Edit directly in `index.html` (Spanish) and `en/index.html` (English). The main sections you'll want to update:

- **Hero stats** — search for `hero-stats` and edit the three `hero-stat` blocks (years, vendors, certs)
- **About text** — the two `<p>` paragraphs in `#sobre-mi`
- **Content section** (`#contenidos`) — currently embeds an iVoox podcast; replace or delete the `<div class="content-item">`
- **Experience** (`#experiencia`) — five `timeline-item` blocks. Add/remove as needed
- **Skills** (`#habilidades`) — three `skills-category` groups with `data-value` percentages (0–100), plus `certifications` block
- **Tech stack** (`#tecnologias`) — four `tech-category` blocks with `tech-tag` chips
- **Contact** (`#contacto`) — email, location, availability

### 4. Colors / theme

All colors are CSS variables at the top of `css/styles.css`:

```css
:root {
    --primary-color: #00d4aa;      /* accent green */
    --secondary-color: #7c3aed;    /* violet */
    --accent-color: #f59e0b;       /* amber */
    --bg-color: #060709;           /* near-black background */
    --bg-alt-color: #0b0c0f;       /* alternating section bg */
    --bg-elevated: #16181d;        /* cards / elevated surfaces */
    --card-bg: rgba(22,24,29,0.7); /* glassmorphism */
    --nav-bg: rgba(8,9,11,0.85);
    /* ... */
}
```

A light-mode block follows (`:root[data-theme="light"]`). Tweak both for full theming.

Also update the corresponding meta tags so PWA install / browser chrome match:
- `<meta name="theme-color" content="#060709">` in both `<head>`
- `theme_color` and `background_color` in `manifest.json`

### 5. Single language?

If you only want one language:

1. Delete `/en/` (or `/index.html` if you'd rather keep English as the only one)
2. Remove the `<div class="lang-switcher">` block from the surviving `<nav>` and the `<link rel="alternate" hreflang>` tags from `<head>`
3. Remove the EN entry from `sitemap.xml` and the corresponding hreflang alternates
4. Remove the small inline `<script>` that handles hash preservation across languages

### 6. PWA icons

The repo doesn't ship the PNG icons referenced in `manifest.json` (`img/icons/icon-192x192.png`, etc.) — only `icon.svg` is included. To generate the full set:

```bash
npm install            # installs sharp + svgexport
node generate-icons.js
```

This produces all the sizes the manifest expects from an SVG source.

### 7. Custom domain

The `CNAME` file currently contains `rjgu.es`. **You must change or delete it** before deploying — otherwise GitHub Pages will refuse to claim a domain that's already taken by this repo.

- **Using your own domain**: replace the contents of `CNAME` with your domain (e.g. `example.com`) and configure DNS as described in [`DEPLOY.md`](DEPLOY.md). Add the domain in *Settings → Pages → Custom domain*.
- **No custom domain**: delete `CNAME`. Your site will be available at `<your-username>.github.io/<repo-name>/`.

### 8. Contact / email forms

There's no contact form by default — the site uses `mailto:` links. `js/contact-form.js` is present but unused by the current HTML; you can wire it up to [FormSubmit](https://formsubmit.co), [Formspree](https://formspree.io) or similar if you want a form instead.

---

## Deployment

### GitHub Pages (automatic)

1. Push to `main` — the workflow at `.github/workflows/deploy.yml` builds and deploys
2. In *Settings → Pages*, set Source to **GitHub Actions**
3. (Optional) set your custom domain — see step 7 above

Full deploy details and DNS records are in [`DEPLOY.md`](DEPLOY.md).

### Firebase Hosting

`firebase.json` is also included. After `firebase login`:

```bash
firebase init hosting   # only the first time, to set your project ID
firebase deploy --only hosting
```

---

## Project structure

```
.
├── index.html              # Spanish entrypoint (/)
├── en/
│   └── index.html          # English entrypoint (/en/)
├── css/
│   └── styles.css          # All styles, CSS variables at top
├── js/
│   ├── main.js             # Initializes modules + scroll/menu behavior
│   ├── network-animation.js, particles.js, glitch-text.js, typing-effect.js
│   ├── scroll-animations.js, theme-switcher.js, skills-animation.js
│   ├── projects-filter.js  # (unused unless you add a projects grid)
│   ├── contact-form.js     # (unused unless you wire up a form)
│   └── config-loader.js    # Reads config.yml → updates LinkedIn URL + photo src
├── img/
│   ├── profile.jpg         # Your face here
│   ├── favicon.svg
│   ├── icons/icon.svg      # Source for generate-icons.js
│   └── projects/           # Sample project SVGs
├── config.yml              # Lightweight runtime config (LinkedIn, photo, name, etc.)
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline cache
├── sitemap.xml             # SEO with hreflang alternates
├── robots.txt
├── CNAME                   # GitHub Pages custom domain
├── firebase.json           # Firebase Hosting config
├── generate-icons.js       # Generates PWA icon sizes from icon.svg
├── package.json            # Dev-only deps: serve, sharp, svgexport
├── DEPLOY.md               # Hosting + DNS guide
└── .github/workflows/deploy.yml  # GitHub Pages deploy workflow
```

---

## Privacy notes for forkers

A few things to double-check before pushing your fork to GitHub:

- **`config.yml` is served publicly** at `<your-site>/config.yml`. Don't put anything in it you wouldn't put on the homepage. The current schema only needs `linkedin_url`, `profile_picture_url`, `name`, `title`, `location`.
- **Your commit author email** is exposed in git history. If you don't want your real email on a public repo, set:
  ```bash
  git config user.email "<your-id>+<your-username>@users.noreply.github.com"
  ```
  GitHub's settings page shows the exact noreply address for your account.
- **Don't commit `.env` files, Firebase service account JSONs, or any credentials.** The `.gitignore` covers the common cases but always sanity-check with `git status` before committing.
- The service worker (`service-worker.js`) precaches a fixed list of paths. If you rename files or add new top-level assets, update both `urlsToCache` and bump `CACHE_NAME` so existing visitors get the new version.

---

## License

MIT — use it, fork it, ship your own. Attribution is appreciated but not required.

## Credits

Originally built by [Rogert Guevara Uzcátegui](https://rjgu.es) (network & systems administrator). If you ship a portfolio based on this template, feel free to drop a link — I'd love to see it.
