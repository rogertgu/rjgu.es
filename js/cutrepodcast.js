/**
 * cutrepodcast.js
 * Página /cutrepodcast/ (ES) y /en/cutrepodcast/ (EN): carga todos los
 * episodios desde el bucket público (R2) y los pinta con su reproductor,
 * del más reciente al más antiguo. El CORS del bucket solo admite rjgu.es,
 * así que en local se queda en el mensaje de error con los enlaces a iVoox/RSS.
 * Cada episodio enlaza a su página (/cutrepodcast/ep-N/) si se generó al construir
 * la web: build-site.mjs deja los números en data-pages de la lista.
 */
(function () {
    'use strict';

    const list = document.querySelector('.episodes');
    if (!list) return;

    const FEED = 'https://cutrepodcast.rjgu.es/episodes.json';
    const isEnglish = document.documentElement.lang === 'en';
    const status = document.querySelector('.episodes-status');
    const errorBox = document.querySelector('.episodes-error');
    const fallbackCover = document.querySelector('.podcast-cover')?.src || '';
    const pages = new Set((list.dataset.pages || '').split(',').filter(Boolean).map(Number));
    const pagesBase = isEnglish ? '../../cutrepodcast/' : './';

    const t = isEnglish
        ? {
            locale: 'en-GB',
            more: 'Show more',
            less: 'Show less',
            summary: (count, last) => `${count} episodes · latest ${last}`
        }
        : {
            locale: 'es-ES',
            more: 'Ver más',
            less: 'Ver menos',
            summary: (count, last) => `${count} episodios · último el ${last}`
        };

    const formatDate = iso => new Date(`${iso}T12:00:00`).toLocaleDateString(
        t.locale, { day: 'numeric', month: 'short', year: 'numeric' });

    const formatDuration = total => {
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = String(total % 60).padStart(2, '0');
        return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
    };

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    const renderEpisode = episode => {
        const item = el('li', 'episode');
        item.id = `ep-${episode.number}`;

        const cover = el('img', 'episode-cover');
        cover.src = episode.image_url || fallbackCover;
        cover.alt = '';
        cover.width = 96;
        cover.height = 96;
        cover.loading = 'lazy';
        cover.decoding = 'async';

        const body = el('div', 'episode-body');

        const meta = el('p', 'episode-meta');
        const number = el('a', 'episode-num', `#${episode.number}`);
        number.href = `#ep-${episode.number}`;
        meta.append(number, el('span', '', formatDate(episode.date)));
        if (episode.duration) meta.append(el('span', '', formatDuration(episode.duration)));

        const title = el('h3', 'episode-title');
        const titleText = episode.title || episode.full_title;
        if (pages.has(episode.number)) {
            const link = el('a', '', titleText);
            link.href = `${pagesBase}ep-${episode.number}/`;
            title.append(link);
        } else {
            title.textContent = titleText;
        }
        body.append(meta, title);

        if (episode.description) {
            const description = el('p', 'episode-desc', episode.description.trim());
            const toggle = el('button', 'episode-more', t.more);
            toggle.type = 'button';
            toggle.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            body.append(description, toggle);
        }

        const audio = el('audio');
        audio.controls = true;
        audio.preload = 'none';
        audio.src = episode.audio_url;
        audio.setAttribute('aria-label', episode.full_title || episode.title);
        body.append(audio);

        item.append(cover, body);
        return item;
    };

    fetch(FEED, { cache: 'no-cache' })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(episodes => {
            const playable = episodes
                .filter(episode => episode.audio_url)
                .sort((a, b) => b.number - a.number);
            if (!playable.length) throw new Error('sin episodios');

            list.replaceChildren(...playable.map(renderEpisode));
            list.hidden = false;
            status.textContent = t.summary(playable.length, formatDate(playable[0].date));

            // "Ver más" solo donde la descripción está recortada
            requestAnimationFrame(() => {
                list.querySelectorAll('.episode-desc').forEach(description => {
                    if (description.scrollHeight > description.clientHeight + 2) {
                        description.nextElementSibling.hidden = false;
                    }
                });
                if (location.hash.startsWith('#ep-')) {
                    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
                }
            });
        })
        .catch(error => {
            console.warn('Cutrepodcast: no se pudieron cargar los episodios', error);
            status.hidden = true;
            errorBox.hidden = false;
        });

    list.addEventListener('click', event => {
        const toggle = event.target.closest('.episode-more');
        if (!toggle) return;
        const open = toggle.previousElementSibling.classList.toggle('is-open');
        toggle.textContent = open ? t.less : t.more;
        toggle.setAttribute('aria-expanded', String(open));
    });

    // Un solo reproductor sonando a la vez
    list.addEventListener('play', event => {
        list.querySelectorAll('audio').forEach(audio => {
            if (audio !== event.target) audio.pause();
        });
    }, true);
})();
