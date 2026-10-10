/**
 * cutrepodcast.js
 * Carga los últimos episodios del Cutrepodcast desde su bucket público (R2)
 * y los pinta con reproductor en la card #cutrepodcast. Si falla, la card
 * se queda con la descripción y los enlaces estáticos.
 */
(function () {
    const card = document.getElementById('cutrepodcast');
    if (!card) return;

    const FEED_BASE = 'https://cutrepodcast.rjgu.es';
    const MAX_EPISODES = 3;
    const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
    const list = card.querySelector('.podcast-episodes');

    const formatDate = iso => new Date(`${iso}T12:00:00`).toLocaleDateString(
        lang === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatDuration = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

    const renderEpisode = episode => {
        const item = document.createElement('li');
        item.className = 'podcast-episode';

        const cover = document.createElement('img');
        cover.src = episode.image_url || '/img/cutrepodcast.jpg';
        cover.alt = '';
        cover.width = 64;
        cover.height = 64;
        cover.loading = 'lazy';
        cover.decoding = 'async';

        const body = document.createElement('div');
        body.className = 'podcast-episode-body';

        const title = document.createElement('p');
        title.className = 'podcast-episode-title';
        title.textContent = episode.full_title || episode.title;

        const meta = document.createElement('p');
        meta.className = 'podcast-episode-meta';
        meta.textContent = `${formatDate(episode.date)} · ${formatDuration(episode.duration)}`;

        const audio = document.createElement('audio');
        audio.controls = true;
        audio.preload = 'none';
        audio.src = episode.audio_url;

        body.append(title, meta, audio);
        item.append(cover, body);
        return item;
    };

    fetch(`${FEED_BASE}/episodes.json`, { cache: 'no-cache' })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(episodes => {
            const latest = episodes
                .filter(episode => episode.audio_url)
                .sort((a, b) => b.number - a.number)
                .slice(0, MAX_EPISODES);
            if (!latest.length) return;
            list.replaceChildren(...latest.map(renderEpisode));
            list.hidden = false;
        })
        .catch(error => console.warn('Cutrepodcast: no se pudieron cargar los episodios', error));

    // Un solo reproductor sonando a la vez.
    card.addEventListener('play', event => {
        card.querySelectorAll('audio').forEach(audio => {
            if (audio !== event.target) audio.pause();
        });
    }, true);
})();
