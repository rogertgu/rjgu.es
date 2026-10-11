# rjgu.es — Portfolio template

Personal portfolio / tech CV as a static site. Bilingual (ES/EN), dark theme, PWA-ready, zero build step. Served live at **[rjgu.es](https://rjgu.es)**.

This repo is also intended as a **template** — fork it, swap the content, and deploy your own. The guide below covers every place you need to touch.

---

## Features

- Single-page, vanilla HTML + CSS + JS — no framework, no build step
- Two languages out of the box (`/` Spanish, `/en/` English) with `hreflang` + `sitemap.xml` alternates for SEO
- Dark theme by default with a light-mode toggle
- "Engineering / terminal" look: one accent colour, self-hosted JetBrains Mono for headings, system font for body text
- Hero with an animated SVG network topology (generic, not a real network); static with `prefers-reduced-motion`
- No external requests for fonts or icons (inline SVG + CSS masks)
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
| `Rogert Guevara Uzcátegui` | Your full name | Hero `<h1>`, `<meta name="author">`, JSON-LD |
| `RJGU` | Your initials / brand | Nav logo, footer copyright |
| `rogert@rjgu.es` | Your contact email | Hero CTA and contact section |
| `Network & Systems Administrator` | Your role / title | `<title>`, hero kicker, footer, JSON-LD |
| `Palma, Islas Baleares` | Your location (ES) | Hero status line |
| `Palma, Balearic Islands` | Your location (EN) | Hero status line |
| `https://www.linkedin.com/in/rogert-guevara-uzcategui` | Your LinkedIn URL | Hero buttons + contact section, JSON-LD |
| `https://github.com/rogertgu` | Your GitHub URL | Hero buttons + contact section, JSON-LD |
| `https://rjgu.es/` | Your domain | `<link rel="alternate" hreflang>` in `<head>` of both files + `sitemap.xml` |

A one-shot pass with `sed` (Linux/macOS, adjust strings):

```bash
sed -i 's|rogert@rjgu.es|your@email.com|g' index.html en/index.html
sed -i 's|Rogert Guevara Uzcátegui|Your Name|g' index.html en/index.html
# ...and so on
```

### 2. Profile photo

Replace `img/profile.jpg` with your own (square, ~800×800px works well). It is shown in greyscale by CSS. If you change the filename, update the `<img>` in both HTML files, `og:image`, the JSON-LD block and `service-worker.js`.

### 3. Section content

Edit directly in `index.html` (Spanish) and `en/index.html` (English). The main sections you'll want to update:

- **Hero** (`#inicio`) — kicker, tagline, buttons and the `statusline` key/value list (experience, current role, location, availability)
- **Topology diagram** — nodes and links are defined at the top of `js/topology.js`
- **About** (`#sobre-mi`) — photo and the two `<p>` paragraphs
- **Projects** (`#proyectos`) — one `<article class="project">` per project; `project-wide` spans the full row
- **Experience** (`#experiencia`) — one `timeline-item` per company with its `timeline-role` entries
- **Stack** (`#stack`) — one `stack-row` per group; add `is-core` to a `chip` to highlight it as a core specialty. Certifications follow
- **Contact** (`#contacto`) — email and links

### 4. Colors / theme

All colors are CSS variables at the top of `css/styles.css`:

```css
:root {
    --bg: #0b0d10;          /* background */
    --bg-alt: #0e1114;      /* alternating section bg */
    --surface: #12161b;     /* cards */
    --border: #222830;
    --text: #e6e9ed;
    --muted: #949ea9;       /* secondary text */
    --accent: #00d4aa;      /* the only accent colour */
    --accent-rgb: 0, 212, 170;
    /* ... */
}
```

A light-mode block follows (`[data-theme="light"]`). Tweak both for full theming.

Also update the corresponding meta tags so PWA install / browser chrome match:
- `<meta name="theme-color" content="#0b0d10">` in both `<head>` (updated at runtime when the theme changes)
- `theme_color` and `background_color` in `manifest.json`

### 5. Single language?

If you only want one language:

1. Delete `/en/` (or `/index.html` if you'd rather keep English as the only one)
2. Remove the `<nav class="lang-switcher">` block from the surviving `<nav>` and the `<link rel="alternate" hreflang>` tags from `<head>`
3. Remove the EN entry from `sitemap.xml` and the corresponding hreflang alternates
4. Optionally remove the language-switch hash handling at the end of `js/main.js`

### 6. PWA icons

The generated PNG icons referenced by `manifest.json` are included in `img/icons/`. If you replace `img/icons/icon.svg`, regenerate the full set with:

```bash
npm install            # installs the local development tools
npm run generate-icons
```

This produces all the sizes the manifest and Service Worker expect from the SVG source.

### 7. Custom domain

The `CNAME` file currently contains `rjgu.es`. **You must change or delete it** before deploying — otherwise GitHub Pages will refuse to claim a domain that's already taken by this repo.

- **Using your own domain**: replace the contents of `CNAME` with your domain (e.g. `example.com`) and configure DNS as described in [`DEPLOY.md`](DEPLOY.md). Add the domain in *Settings → Pages → Custom domain*.
- **No custom domain**: delete `CNAME`. Your site will be available at `<your-username>.github.io/<repo-name>/`.

### 8. Contact / email forms

There's no contact form by default — the site uses `mailto:` links. If you later need a form, connect it to a provider such as [FormSubmit](https://formsubmit.co) or [Formspree](https://formspree.io) and add the required client-side validation.

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
│   ├── index.html          # English entrypoint (/en/)
│   └── cutrepodcast/       # English podcast page (/en/cutrepodcast/)
├── cutrepodcast/           # Podcast page with every episode (/cutrepodcast/)
├── cv/                     # CV source (HTML) → PDFs via scripts/build-cv.sh
├── css/
│   └── styles.css          # All styles, CSS variables at top
├── js/
│   ├── main.js             # Nav, theme toggle, scroll reveal, footer year
│   ├── topology.js         # Animated SVG network diagram in the hero
│   └── cutrepodcast.js     # Episode list + players for /cutrepodcast/ (fetched from the podcast bucket)
├── fonts/                  # Self-hosted JetBrains Mono (OFL licence included)
├── img/
│   ├── profile.jpg         # Your face here
│   ├── favicon.svg
│   ├── icons/icon.svg      # Source for generate-icons.js
│   └── projects/           # Sample project SVGs
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline cache
├── sitemap.xml             # SEO with hreflang alternates
├── robots.txt
├── CNAME                   # GitHub Pages custom domain
├── firebase.json           # Firebase Hosting config
├── generate-icons.js       # Generates PWA icon sizes from icon.svg
├── package.json            # Dev-only deps: serve, sharp, firebase-tools
├── scripts/validate.mjs    # Validación estática sin dependencias externas
├── DEPLOY.md               # Hosting + DNS guide
└── .github/workflows/deploy.yml  # GitHub Pages deploy workflow
```

---

## Privacy notes for forkers

A few things to double-check before pushing your fork to GitHub:

- **Your commit author email** is exposed in git history. If you don't want your real email on a public repo, set:
  ```bash
  git config user.email "<your-id>+<your-username>@users.noreply.github.com"
  ```
  GitHub's settings page shows the exact noreply address for your account.
- **Don't commit `.env` files, Firebase service account JSONs, or any credentials.** The `.gitignore` covers the common cases but always sanity-check with `git status` before committing.
- The service worker (`service-worker.js`) precaches a fixed list of paths. If you rename files or add new top-level assets, update both `urlsToCache` and bump `CACHE_NAME` so existing visitors get the new version.
- GitHub Actions runs `npm run validate` on pushes and pull requests. Only pushes to `main` deploy to GitHub Pages.

---

## License

MIT — use it, fork it, ship your own. Attribution is appreciated but not required.

## Credits

Originally built by [Rogert Guevara Uzcátegui](https://rjgu.es) (network & systems administrator). If you ship a portfolio based on this template, feel free to drop a link — I'd love to see it.
