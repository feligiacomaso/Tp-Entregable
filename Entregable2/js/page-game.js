import { loadGames } from "./api.js";
import { loadFooter } from "./footer.js";
import { setupGameGallery } from "./game-gallery.js";
import { setupComments } from "./game-comments.js";
import { setupGamePlayer } from "./game-player.js";
import { setupFavoriteControls } from "./game-favorites.js";

const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const selected = (params.get("game") || params.get("id") || "").trim().toLowerCase();
const dateText = value => {
    if (!value) return "No informada";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
};
const names = values => (values || []).map(value => typeof value === "string" ? value : value.name || value.platform?.name).filter(Boolean).join(", ");

function showGame(game) {
    const title = game.name || "Juego";
    const image = game.background_image || game.background_image_low_res || "";
    document.title = `${title} | Game House`;
    $("#breadcrumb-title").textContent = title;
    $("#player-title").textContent = title;
    const genre = game.genres?.[0]?.name || "Juegos";
    $("#game-category").textContent = genre;
    const setImage = (selector, alt) => {
        const element = $(selector);
        element.src = image;
        element.alt = alt;
        element.hidden = !image;
        element.onerror = () => { element.hidden = true; };
    };
    setImage("#player-image", title);
    setImage("#about-image", `${title}: imagen del juego`);
    setupGameGallery({
        gallery: $("#about-gallery"),
        firstCard: $("#about-gallery-card-primary"),
        firstImage: $("#about-image"),
        secondImage: game.gallery_image,
        secondAlt: game.gallery_alt || `${title}: otra imagen del juego`,
        secondCard: $("#about-gallery-card-secondary"),
        secondImageElement: $("#about-image-secondary")
    });
    setImage("#video-image", `${title}: video del juego`);
    $("#game-description").textContent = game.description || "Descubrí este juego y conocé todos sus detalles en Game House.";
    $("#game-developer").textContent = names(game.developers) || game.developer || "Game House";
    $("#game-release").textContent = dateText(game.released);
    $("#game-updated").textContent = dateText(game.updated || game.last_updated);
    $("#game-platforms").textContent = names(game.platforms) || "Juega desde tu navegador web";

    setupGamePlayer(game);
    setupFavoriteControls(game);
    $("#video-preview").addEventListener("click", () => {
        const video = game.trailer_url || game.video_url;
        const message = $("#video-message");
        message.hidden = false;
        message.textContent = video ? "Video disponible en la ficha del juego." : "No hay un video disponible para este juego.";
    });
    setupComments(game);
}

loadFooter();
if (selected === "minion-peg-solitaire") {
    showGame({
        id: "minion-peg-solitaire",
        name: "Minion Peg Solitaire",
        genres: [{ name: "Solitario" }],
        background_image: "src/peg_solitaire.png",
        gallery_image: "src/peg-jugando.jpeg",
        gallery_alt: "Tablero de Minion Peg Solitaire con las fichas minion violetas",
        is_free: true,
        description: "Un clásico juego de estrategia y lógica en el que deberás mover las fichas sobre el tablero para ir eliminándolas una a una. Saltá una ficha sobre otra hacia un espacio vacío para retirarla del tablero. El objetivo es terminar con la menor cantidad de fichas posible, idealmente dejando solo una. Poné a prueba tu capacidad de planificación y encontrá la combinación de movimientos perfecta.",
        developers: ["Game House"],
        released: "2026-09-01",
        updated: "2026-09-01",
        platforms: ["Navegador web"]
    });
} else {
    loadGames().then(({ byRating }) => {
        const game = byRating.find(item => String(item.id ?? "").toLowerCase() === selected || item.name?.toLowerCase() === selected) || byRating[0];
        if (game) showGame(game);
    }).catch(error => {
        console.error("No se pudo cargar el juego:", error);
        $("#breadcrumb-title").textContent = "No se pudo cargar el juego";
        $("#player-title").textContent = "No se pudo cargar el juego";
        $("#game-description").textContent = "Revisá tu conexión e intentá de nuevo.";
    });
}
