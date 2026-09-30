import { loadGames } from "./api.js";
import { setupBannerCarousel } from "./banner-carousel.js";
import { setupGameCarousels } from "./game-carousels.js";
import { loadFooter } from "./footer.js";

const loadingOverlay = document.querySelector("#home-loading");
const loadingPercentage = document.querySelector("#home-loading-percentage");
const loadingProgress = document.querySelector(".home-loading__spinner");
const loadingStartedAt = performance.now();

function showMessage(message) {
    document.querySelectorAll(".track").forEach(track => {
        const notice = document.createElement("p");
        notice.className = "api-message";
        notice.textContent = message;
        track.replaceChildren(notice);
    });
}

function updateLoading(now) {
    const progress = Math.min((now - loadingStartedAt) / 5000, 1);
    const percentage = Math.floor(progress * 100);
    loadingPercentage.textContent = `${percentage}%`;
    loadingProgress.setAttribute("aria-valuenow", percentage);

    if (progress < 1) {
        requestAnimationFrame(updateLoading);
    } else {
        loadingOverlay.classList.add("is-hidden");
        setTimeout(() => loadingOverlay.remove(), 300);
    }
}

const pegSolitaire = {
    id: "minion-peg-solitaire",
    name: "Minion Peg Solitaire",
    category: "Solitario",
    background_image: "img/peg_solitaire.png",
    is_free: true,
    rating: 5
};

requestAnimationFrame(updateLoading);
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
