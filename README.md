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
- Only an allow-list of public files is deployed (`scripts/build-site.mjs` → `_site/`); repo docs and tooling never go live
- Tested in CI: static checks, HTML validation and Playwright smoke tests (desktop + mobile)
- Deploys via GitHub Pages on every push to `main` (workflow included)

## Quick start (local)

```bash
npm ci                 # dev tools only: Playwright + html-validate
npm run build          # copies the public files into _site/
npm run serve          # http://127.0.0.1:8765/  (serves _site/)
```

Open `/` (ES) and `/en/` (EN). Any static server pointed at `_site/` works too.

> If you've visited the live site before, a service worker may be caching old assets in your browser. Use `Ctrl+Shift+R` or *DevTools → Application → Service Workers → Unregister* to see your local edits.

## Tests

```bash
npm run validate       # builds _site/ and checks it: JSON, JS syntax, one <h1>, local links,
                       # manifest/service-worker assets, and that nothing internal is published
npm run lint:html      # html-validate (recommended rules)
npx playwright install chromium   # first time only
npm test               # Playwright, desktop + mobile, against _site/
npm run check          # all of the above
```

The Playwright suite (`tests/site.spec.mjs`) loads every page and fails on console errors, failed requests, horizontal overflow, images without `alt` or blocks that never appear. It also covers the theme toggle, the language switch, the mobile menu, the podcast list (with `tests/fixtures/episodes.json` instead of the real feed), the 404 page, printing, reduced motion and the no-JavaScript fallback.

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

The page shows `img/profile.webp` (480×480, greyscale via CSS); `img/profile.jpg` (800×800) is only used for link previews (`og:image`) and the JSON-LD block. Replace both, e.g. `convert photo.jpg -resize 480x480 -strip p.png && cwebp -q 85 p.png -o img/profile.webp`. If you change the filenames, update the `<img>` in both HTML files, `og:image`, the JSON-LD block and `service-worker.js`.

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

The PNG icons referenced by `manifest.json` live in `img/icons/`. If you replace `img/icons/icon.svg`, regenerate every size listed in `manifest.json`, for example:

```bash
for s in 72 96 128 144 152 192 384 512; do convert -background none -density 384 img/icons/icon.svg -resize ${s}x${s} img/icons/icon-${s}x${s}.png; done
```

### 7. Custom domain

The `CNAME` file currently contains `rjgu.es`. **You must change or delete it** before deploying — otherwise GitHub Pages will refuse to claim a domain that's already taken by this repo.

- **Using your own domain**: replace the contents of `CNAME` with your domain (e.g. `example.com`), add it in *Settings → Pages → Custom domain* and point DNS at GitHub Pages: `A` records `185.199.108.153`–`185.199.111.153`, `AAAA` records `2606:50c0:8000::153`–`2606:50c0:8003::153`, and `www` as a `CNAME` to `<your-username>.github.io`. If you use Cloudflare, keep these records **DNS only** (grey cloud) so GitHub can issue and renew its HTTPS certificate.
- **No custom domain**: delete `CNAME`. Your site will be available at `<your-username>.github.io/<repo-name>/`.

### 8. Contact / email forms

There's no contact form by default — the site uses `mailto:` links. If you later need a form, connect it to a provider such as [FormSubmit](https://formsubmit.co) or [Formspree](https://formspree.io) and add the required client-side validation.

---

## Deployment

GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`):

1. In *Settings → Pages*, set Source to **GitHub Actions**
2. Every push and pull request runs validation, HTML lint and the Playwright tests
3. Pushes to `main` then upload `_site/` and deploy it. Only the files listed in `scripts/build-site.mjs` are published
4. (Optional) set your custom domain — see step 7 above

---

## Project structure

```
.
├── index.html              # Spanish entrypoint (/)
├── 404.html                # Custom 404 (absolute paths: GitHub Pages serves it on any URL)
├── en/
│   ├── index.html          # English entrypoint (/en/)
│   └── cutrepodcast/       # English podcast page (/en/cutrepodcast/)
├── cutrepodcast/           # Podcast page with every episode (/cutrepodcast/)
├── lofi/                   # Generated by another repo (homelab-live); don't edit here
├── cv/                     # CV source (HTML) → PDFs via scripts/build-cv.sh (not published)
├── css/
│   └── styles.css          # All styles, CSS variables at top, print rules at the end
├── js/
│   ├── main.js             # Nav, theme toggle, scroll reveal, footer year
│   ├── topology.js         # Animated SVG network diagram in the hero
│   └── cutrepodcast.js     # Episode list + players for /cutrepodcast/ (fetched from the podcast bucket)
├── fonts/                  # Self-hosted JetBrains Mono (+ Inter for the CV), OFL licences included
├── img/
│   ├── profile.webp        # Photo shown on the page
│   ├── profile.jpg         # Larger copy for link previews (og:image)
│   ├── favicon.svg
│   └── icons/              # PWA icons (icon.svg is the source)
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline cache
├── sitemap.xml             # SEO with hreflang alternates
├── robots.txt
├── CNAME                   # GitHub Pages custom domain
├── scripts/
│   ├── build-site.mjs      # Allow-list of public files → _site/
│   ├── validate.mjs        # Static checks on _site/
│   └── build-cv.sh         # CV PDFs from cv/ (headless Chrome)
├── tests/                  # Playwright smoke tests + podcast fixture
├── playwright.config.mjs
├── .htmlvalidate.json
├── package.json            # Dev-only deps: @playwright/test, html-validate
└── .github/workflows/deploy.yml  # Validate, test and deploy
```

---

## Privacy notes for forkers

A few things to double-check before pushing your fork to GitHub:

- **Your commit author email** is exposed in git history. If you don't want your real email on a public repo, set:
  ```bash
  git config user.email "<your-id>+<your-username>@users.noreply.github.com"
  ```
  GitHub's settings page shows the exact noreply address for your account.
- **Don't commit `.env` files or any credentials.** The `.gitignore` covers the common cases but always sanity-check with `git status` before committing.
- The service worker (`service-worker.js`) precaches a fixed list of paths. If you rename files or add new top-level assets, update both `urlsToCache` and bump `CACHE_NAME` so existing visitors get the new version.
- New public files must be added to the allow-list in `scripts/build-site.mjs`, or they won't be deployed (`npm run validate` fails if a page links to something missing).
- GitHub Actions runs the checks and tests on pushes and pull requests. Only pushes to `main` deploy to GitHub Pages.

---

## License

MIT — use it, fork it, ship your own. Attribution is appreciated but not required.

## Credits

Originally built by [Rogert Guevara Uzcátegui](https://rjgu.es) (network & systems administrator). If you ship a portfolio based on this template, feel free to drop a link — I'd love to see it.
