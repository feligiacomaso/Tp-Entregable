import { loadGames } from "./api.js";
import { loadFooter } from "./footer.js";

const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const selected = (params.get("game") || params.get("id") || "").trim().toLowerCase();
const dateText = value => {
    if (!value) return "No informada";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
};
const names = values => (values || []).map(value => typeof value === "string" ? value : value.name || value.platform?.name).filter(Boolean).join(", ");

function toggleFavorite(game) {
    const key = `game-house-favorite-${game.id ?? game.name}`;
    const active = localStorage.getItem(key) !== "true";
    localStorage.setItem(key, String(active));
    document.querySelectorAll(".favorite-toggle,.favorite-cta").forEach(button => {
        button.setAttribute("aria-pressed", String(active));
        if (button.classList.contains("favorite-toggle")) button.textContent = active ? "★" : "☆";
    });
}

function addComment(text, list) {
    const item = document.createElement("article");
    item.className = "comment-item";
    item.innerHTML = '<span class="comment-avatar user" aria-hidden="true"><img src="img/icon_profile.svg" alt=""></span><div class="comment-body"><small>Vos</small><time>ahora</time><p></p><div class="comment-actions"><button type="button" data-vote="like" aria-label="Me gusta" aria-pressed="false"><img class="vote-icon" src="img/icon_like.svg" alt=""><span>0</span></button><button type="button" data-vote="dislike" aria-label="No me gusta" aria-pressed="false"><img class="vote-icon dislike" src="img/icon_like.svg" alt=""><span>0</span></button><button type="button" data-reply aria-expanded="false">Responder</button></div></div>';
    item.querySelector("p").textContent = text;
    list.prepend(item);
}

function setupComments(game) {
    const list = $("#comment-list");
    const key = `game-house-comments-${game.id ?? game.name}`;
    const comments = JSON.parse(localStorage.getItem(key) || "[]");
    if (!comments.length) list.innerHTML = '<p class="empty-comments">Todavía no hay comentarios. ¡Dejá el primero!</p>';
    comments.forEach(text => addComment(text, list));
    $(".comment-form").addEventListener("submit", event => {
        event.preventDefault();
        const input = event.currentTarget.elements.comment;
        const text = input.value.trim();
        if (!text) return;
        list.querySelector(".empty-comments")?.remove();
        addComment(text, list);
        localStorage.setItem(key, JSON.stringify([text, ...comments]));
        comments.unshift(text);
        input.value = "";
    });
    list.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;
        if (button.dataset.vote) {
            const item = button.closest(".comment-item");
            const previous = item.dataset.vote || "";
            const next = previous === button.dataset.vote ? "" : button.dataset.vote;
            if (previous) {
                const oldButton = item.querySelector(`[data-vote="${previous}"]`);
                oldButton.querySelector("span").textContent = Number(oldButton.querySelector("span").textContent) - 1;
                oldButton.setAttribute("aria-pressed", "false");
                oldButton.querySelector(".vote-icon").src = "img/icon_like.svg";
            }
            if (next) {
                button.querySelector("span").textContent = Number(button.querySelector("span").textContent) + 1;
                button.setAttribute("aria-pressed", "true");
                button.querySelector(".vote-icon").src = "img/icon_like_active.svg";
            }
            item.dataset.vote = next;
        }
        if (button.hasAttribute("data-reply")) {
            const body = button.closest(".comment-body");
            const existingForm = body.querySelector(".reply-form");
            if (existingForm) {
                existingForm.remove();
                button.setAttribute("aria-expanded", "false");
                return;
            }
            const form = document.createElement("form");
            form.className = "reply-form";
            form.innerHTML = '<input placeholder="Escribe una respuesta" aria-label="Escribe una respuesta" required><button type="submit">Responder</button>';
            form.addEventListener("submit", e => { e.preventDefault(); form.remove(); button.setAttribute("aria-expanded", "false"); });
            body.append(form);
            button.setAttribute("aria-expanded", "true");
        }
    });
}

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
    setImage("#video-image", `${title}: video del juego`);
    $("#game-description").textContent = game.description || "Descubrí este juego y conocé todos sus detalles en Game House.";
    $("#game-developer").textContent = names(game.developers) || game.developer || "Game House";
    $("#game-release").textContent = dateText(game.released);
    $("#game-updated").textContent = dateText(game.updated || game.last_updated);
    $("#game-platforms").textContent = names(game.platforms) || "Juega desde tu navegador web";

    $("#launch-game").addEventListener("click", () => {
        $("#game-player").classList.add("is-playing");
    }, { once: true });

    const favoriteKey = `game-house-favorite-${game.id ?? title}`;
    const favoriteButtons = document.querySelectorAll(".favorite-toggle,.favorite-cta");
    const setFavoriteState = active => favoriteButtons.forEach(button => {
        button.setAttribute("aria-pressed", String(active));
        if (button.classList.contains("favorite-toggle")) button.textContent = active ? "★" : "☆";
    });
    setFavoriteState(localStorage.getItem(favoriteKey) === "true");
    favoriteButtons.forEach(button => button.addEventListener("click", () => toggleFavorite(game)));

    $(".fullscreen-toggle").addEventListener("click", async () => {
        if (!document.fullscreenElement) await $("#game-player").requestFullscreen?.();
        else await document.exitFullscreen();
    });
    $("#video-preview").addEventListener("click", () => {
        const video = game.trailer_url || game.video_url;
        const message = $("#video-message");
        message.hidden = false;
        message.textContent = video ? "Video disponible en la ficha del juego." : "No hay un video disponible para este juego.";
    });
    setupComments(game);
}

loadFooter();
loadGames().then(({ byRating }) => {
    const game = byRating.find(item => String(item.id ?? "").toLowerCase() === selected || item.name?.toLowerCase() === selected) || byRating[0];
    if (game) showGame(game);
}).catch(error => {
    console.error("No se pudo cargar el juego:", error);
    $("#breadcrumb-title").textContent = "No se pudo cargar el juego";
    $("#player-title").textContent = "No se pudo cargar el juego";
    $("#game-description").textContent = "Revisá tu conexión e intentá de nuevo.";
});
