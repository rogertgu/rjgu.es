// config-loader.js

document.addEventListener('DOMContentLoaded', () => {
    const basePath = window.location.pathname.includes('/en/') ? '../' : './';
    const configBaseUrl = new URL(basePath, document.baseURI);
    fetch(basePath + 'config.yml')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(yamlText => {
            // Simple YAML parser (for key-value pairs)
            const config = {};
            yamlText.split('\n').forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith('#')) {
                    const parts = trimmedLine.split(':');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const value = parts.slice(1).join(':').trim().replace(/^"|"$/g, ''); // Remove quotes
                        config[key] = value;
                    }
                }
            });

            // Update elements in index.html
            if (config.linkedin_url) {
                const linkedinLink = document.querySelector('.social-links a[aria-label="LinkedIn"]');
                if (linkedinLink) {
                    linkedinLink.href = config.linkedin_url;
                }
            }

            if (config.profile_picture_url) {
                const profileImage = document.querySelector('.about-image img');
                if (profileImage) {
                    profileImage.src = new URL(config.profile_picture_url, configBaseUrl).href;
                }
            }
        })
        .catch(error => {
            console.error('Error loading or parsing config.yml:', error);
        });
});
