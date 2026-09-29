import { loadGames } from "./api.js";
import { setupBannerCarousel } from "./banner-carousel.js";
import { setupGameCarousels } from "./game-carousels.js";
import { loadFooter } from "./footer.js";

function showMessage(message) {
    document.querySelectorAll(".track").forEach(track => {
        const notice = document.createElement("p");
        notice.className = "api-message";
        notice.textContent = message;
        track.replaceChildren(notice);
    });
}

const pegSolitaire = {
    id: "minion-peg-solitaire",
    name: "Minion Peg Solitaire",
    category: "Solitario",
    background_image: "img/peg_solitaire.png",
    is_free: true,
    rating: 5
};

showMessage("Cargando juegos...");
loadFooter();
loadGames().then(({ byRating, byDate }) => {
    setupBannerCarousel([pegSolitaire, ...byRating]);
    setupGameCarousels({
        popular: byRating.slice(0, 30),
        recent: byDate.slice(0, 30),
        recommended: byRating.slice(30, 60).length ? byRating.slice(30, 60) : byRating.slice(0, 30)
    });
}).catch(error => {
    console.error("Error al cargar la API v2:", error);
    showMessage("No se pudieron cargar los videojuegos. Revisá tu conexión e intentá de nuevo.");
});
