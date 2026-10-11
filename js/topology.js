/**
 * topology.js
 * Dibuja en SVG una topología de red genérica (no es la red real) y hace
 * circular paquetes entre nodos. Se detiene fuera de pantalla y queda
 * estática con prefers-reduced-motion.
 */
(function () {
    'use strict';

    const container = document.querySelector('.topology-canvas');
    if (!container) return;

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const W = 480;
    const H = 340;

    // x, y: centro del nodo. edge: nodos de borde (resaltados).
    const nodes = {
        internet: { x: 240, y: 26, label: 'internet' },
        remote:   { x: 405, y: 96, label: 'remote-site' },
        fw:       { x: 240, y: 96, label: 'edge-fw', edge: true },
        core:     { x: 240, y: 166, label: 'core-sw' },
        hv1:      { x: 85,  y: 240, label: 'hv-01' },
        hv2:      { x: 250, y: 240, label: 'hv-02' },
        ap:       { x: 392, y: 240, label: 'ap-01' },
        ct1:      { x: 42,  y: 312, label: 'ct-dns' },
        ct2:      { x: 128, y: 312, label: 'ct-web' },
        vm1:      { x: 210, y: 312, label: 'vm-01' },
        vm2:      { x: 290, y: 312, label: 'vm-02' },
        wifi:     { x: 392, y: 312, label: 'clients' }
    };

    // [a, b, etiqueta opcional, túnel]
    const links = [
        ['internet', 'fw', 'wan'],
        ['fw', 'remote', 'wg0', true],
        ['fw', 'core', 'trunk'],
        ['core', 'hv1'],
        ['core', 'hv2'],
        ['core', 'ap'],
        ['hv1', 'ct1'],
        ['hv1', 'ct2'],
        ['hv2', 'vm1'],
        ['hv2', 'vm2'],
        ['ap', 'wifi']
    ];

    const endpoints = ['internet', 'remote', 'ct1', 'ct2', 'vm1', 'vm2', 'wifi'];

    const el = (name, attrs = {}, parent) => {
        const node = document.createElementNS(SVG_NS, name);
        Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
        if (parent) parent.appendChild(node);
        return node;
    };

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
    svg.setAttribute('aria-label', document.documentElement.lang === 'en'
        ? 'Animated diagram of a network topology'
        : 'Diagrama animado de una topología de red');

    // Enlaces
    const linkLayer = el('g', {}, svg);
    links.forEach(([a, b, label, tunnel]) => {
        const p = nodes[a];
        const q = nodes[b];
        el('line', {
            class: tunnel ? 'topo-link is-tunnel' : 'topo-link',
            x1: p.x, y1: p.y, x2: q.x, y2: q.y
        }, linkLayer);
        if (label) {
            const vertical = p.x === q.x;
            const text = el('text', {
                class: 'topo-label',
                x: vertical ? p.x + 8 : (p.x + q.x) / 2,
                y: vertical ? (p.y + q.y) / 2 + 3 : (p.y + q.y) / 2 - 7,
                'text-anchor': vertical ? 'start' : 'middle'
            }, linkLayer);
            text.textContent = label;
        }
    });

    // Paquetes (debajo de los nodos para que "entren" en ellos)
    const packetLayer = el('g', {}, svg);

    // Nodos
    const nodeLayer = el('g', {}, svg);
    Object.values(nodes).forEach(node => {
        const width = node.label.length * 6.8 + 30;
        const g = el('g', { class: node.edge ? 'topo-node is-edge' : 'topo-node' }, nodeLayer);
        el('rect', { x: node.x - width / 2, y: node.y - 12, width, height: 24, rx: 4 }, g);
        el('circle', { class: 'led', cx: node.x - width / 2 + 11, cy: node.y, r: 2.5 }, g);
        const text = el('text', { x: node.x - width / 2 + 20, y: node.y + 0.5 }, g);
        text.textContent = node.label;
    });

    container.appendChild(svg);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // ----- Rutas: BFS sobre el grafo -----
    const adjacency = {};
    links.forEach(([a, b]) => {
        (adjacency[a] ||= []).push(b);
        (adjacency[b] ||= []).push(a);
    });

    const route = (from, to) => {
        const previous = { [from]: null };
        const queue = [from];
        while (queue.length) {
            const current = queue.shift();
            if (current === to) break;
            (adjacency[current] || []).forEach(next => {
                if (!(next in previous)) {
                    previous[next] = current;
                    queue.push(next);
                }
            });
        }
        const path = [];
        for (let step = to; step !== null; step = previous[step]) path.unshift(nodes[step]);
        return path;
    };

    const SPEED = 110;         // px por segundo
    const SPAWN_EVERY = 520;   // ms
    const MAX_PACKETS = 9;
    const packets = [];
    let running = false;
    let lastSpawn = 0;
    let lastTime = 0;

    const spawn = () => {
        const from = endpoints[Math.floor(Math.random() * endpoints.length)];
        let to = from;
        while (to === from) to = endpoints[Math.floor(Math.random() * endpoints.length)];
        const path = route(from, to);
        const segments = [];
        let total = 0;
        for (let i = 1; i < path.length; i++) {
            const length = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
            segments.push({ a: path[i - 1], b: path[i], start: total, length });
            total += length;
        }
        packets.push({ segments, total, travelled: 0, dot: el('circle', { class: 'topo-packet', r: 3 }, packetLayer) });
    };

    const frame = time => {
        if (!running) return;
        const delta = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        if (time - lastSpawn > SPAWN_EVERY && packets.length < MAX_PACKETS) {
            spawn();
            lastSpawn = time;
        }

        for (let i = packets.length - 1; i >= 0; i--) {
            const packet = packets[i];
            packet.travelled += SPEED * delta;
            if (packet.travelled >= packet.total) {
                packet.dot.remove();
                packets.splice(i, 1);
                continue;
            }
            const segment = packet.segments.find(s => packet.travelled <= s.start + s.length);
            const t = (packet.travelled - segment.start) / segment.length;
            packet.dot.setAttribute('cx', segment.a.x + (segment.b.x - segment.a.x) * t);
            packet.dot.setAttribute('cy', segment.a.y + (segment.b.y - segment.a.y) * t);
        }

        requestAnimationFrame(frame);
    };

    const start = () => {
        if (running) return;
        running = true;
        lastTime = performance.now();
        requestAnimationFrame(frame);
    };

    new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) start();
        else running = false;
    }).observe(container);
})();
