document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        if (!response.ok) throw new Error('Error al conectar con la API');

        const games = await response.json();
        if (!games || games.length === 0) return;

        const juego = games[0]; // Primer juego de ejemplo

        // Función auxiliar segura que solo cambia el texto si el elemento existe en la página actual
        const safeSetText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        safeSetText('game-title', juego.name);
        safeSetText('game-description', juego.description);
        safeSetText('pub-date', juego.released);
        safeSetText('platform-text', juego.platforms.map(p => p.name).join(', '));
        safeSetText('genres-text', juego.genres.map(g => g.name).join(', '));

        const imgEl = document.getElementById('game-image');
        if (imgEl) {
            imgEl.src = juego.background_image;
            imgEl.alt = juego.name;
        }

    } catch (error) {
        console.error('Error:', error);
    }
});