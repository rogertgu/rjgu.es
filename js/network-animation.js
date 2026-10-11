document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Obtener el canvas y su contexto
    const canvas = document.getElementById('network-canvas');
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const ctx = canvas.getContext('2d');
    let width, height;

    // Ajustar el tamaño del canvas al tamaño de la ventana
    function resizeCanvas() {
        const container = canvas.parentElement;
        width = container.offsetWidth;
        height = container.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }

    // Llamar a resizeCanvas cuando cambie el tamaño de la ventana
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Clase para los nodos de la red
    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 1;
            this.speed = Math.random() * 0.5 + 0.1;
            this.directionX = Math.random() * 2 - 1;
            this.directionY = Math.random() * 2 - 1;
            this.color = this.getRandomColor();
        }

        // Obtener un color aleatorio de la paleta
        getRandomColor() {
            const colors = [
                'rgba(0, 212, 170, 0.6)',   // Cyan/teal primary
                'rgba(124, 58, 237, 0.5)',   // Violeta eléctrico
                'rgba(59, 130, 246, 0.5)'    // Azul tech
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        // Actualizar la posición del nodo
        update() {
            this.x += this.directionX * this.speed;
            this.y += this.directionY * this.speed;

            // Rebotar en los bordes
            if (this.x < 0 || this.x > width) this.directionX *= -1;
            if (this.y < 0 || this.y > height) this.directionY *= -1;
        }

        // Dibujar el nodo
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Crear nodos
    const nodeCount = Math.min(Math.floor(width * height / 10000), 150); // Limitar a 150 nodos máximo
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node());
    }

    // Función para dibujar las conexiones entre nodos
    function drawConnections() {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Solo dibujar conexiones si los nodos están lo suficientemente cerca
                if (distance < 150) {
                    // Opacidad basada en la distancia
                    const opacity = 1 - distance / 150;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(0, 212, 170, ${opacity * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    // Variables para la interacción con el ratón
    let mouseX = 0;
    let mouseY = 0;
    let isMouseMoving = false;
    let mouseTimeout;

    // Efecto de interacción con el ratón

    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isMouseMoving = true;

        // Resetear el timeout
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    });

    // Modificar la función animate para incluir la interacción con el ratón
    let animationFrameId = null;

    function animate() {
        if (document.hidden) {
            animationFrameId = null;
            return;
        }

        // Limpiar el canvas
        ctx.clearRect(0, 0, width, height);

        // Actualizar y dibujar nodos
        for (const node of nodes) {
            // Añadir interacción con el ratón si está en movimiento
            if (isMouseMoving) {
                const dx = mouseX - node.x;
                const dy = mouseY - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    // Repeler los nodos
                    const angle = Math.atan2(dy, dx);
                    const force = (100 - distance) / 100;
                    node.x -= Math.cos(angle) * force * 2;
                    node.y -= Math.sin(angle) * force * 2;
                }
            }

            node.update();
            node.draw();
        }

        // Dibujar conexiones
        drawConnections();

        // Solicitar el siguiente frame
        animationFrameId = requestAnimationFrame(animate);
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && animationFrameId === null) {
            animate();
        }
    });

    // Iniciar la animación
    animate();
});
