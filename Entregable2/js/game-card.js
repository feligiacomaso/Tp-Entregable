import { isFreeToPlay } from "./api.js";

export function createGameCard(game, { large = false, onPromote = null } = {}) {
    const card = document.createElement("article");
    card.className = `card ${isFreeToPlay(game) ? "is-free" : "is-paid"}`;
    const art = document.createElement("div");
    art.className = "art";

    const imageUrl = large
        ? (game.background_image || game.background_image_low_res)
        : (game.background_image_low_res || game.background_image);
    if (imageUrl) {
        const image = document.createElement("img");
        image.className = "art-image";
        image.src = imageUrl;
        image.alt = "";
        image.loading = large ? "eager" : "lazy";
        image.onerror = () => image.remove();
        art.append(image);
    }

    const name = document.createElement("span");
    name.className = "art-name";
    name.textContent = game.name || "Juego sin título";
    art.append(name);

    const free = isFreeToPlay(game);
    const action = document.createElement("button");
    action.className = large
        ? `hero-action ${free ? "is-free" : "is-paid"}`
        : `game-action ${free ? "is-free" : "is-paid"}`;
    action.type = "button";
    action.setAttribute("aria-label", `${free ? "Jugar" : "Comprar"} ${game.name || "juego"}`);
    action.innerHTML = free
        ? '<b>Jugar</b><img class="action-icon icon-play" src="img/icon_play.svg" alt="">'
        : '<b>Comprar</b><img class="action-icon icon-shop" src="img/icon_shop.svg" alt="">';

    const info = document.createElement("div");
    info.className = "card-info";
    const title = document.createElement("h3");
    title.textContent = game.name || "Juego sin título";
    const rating = document.createElement("span");
    rating.className = "card-rating";
    rating.textContent = game.rating ? `★ ${game.rating}` : "";
    info.append(title, rating);

    if (large) art.append(action);
    card.append(art);
    if (!large) card.append(action, info);

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ver detalles de ${game.name || "juego"}`);
    const activate = () => {
        if (large && !card.classList.contains("is-active") && onPromote) onPromote();
        else location.href = `page-game.html?game=${encodeURIComponent(game.id ?? game.name)}`;
    };
    card.addEventListener("click", activate);
    card.addEventListener("keydown", event => {
        if (event.target === card && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            activate();
        }
    });
    return card;
}
