import { loadGames } from "./api.js";
import { loadFooter } from "./footer.js";
import { setupPegSolitaire } from "./peg-solitaire.js";

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

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function addReply(reply, list) {
    const item = document.createElement("div");
    item.className = "comment-reply";
    item.innerHTML = '<span class="comment-avatar reply-avatar" aria-hidden="true"><img src="img/icon_profile.svg" alt=""></span><div><small>Vos</small><time>ahora</time><p></p></div>';
    item.querySelector("p").textContent = reply.text;
    list.append(item);
}

function addComment(comment, list) {
    const item = document.createElement("article");
    item.className = "comment-item";
    item.dataset.commentId = comment.id;
    item.innerHTML = '<span class="comment-avatar user" aria-hidden="true"><img src="img/icon_profile.svg" alt=""></span><div class="comment-body"><small>Vos</small><time>ahora</time><p></p><div class="comment-actions"><button type="button" data-vote="like" aria-label="Me gusta" aria-pressed="false"><img class="vote-icon" src="img/icon_like.svg" alt=""><span>0</span></button><button type="button" data-vote="dislike" aria-label="No me gusta" aria-pressed="false"><img class="vote-icon dislike" src="img/icon_like.svg" alt=""><span>0</span></button><button type="button" data-reply aria-expanded="false">Responder</button></div><div class="reply-list"></div></div>';
    item.querySelector(".comment-body > p").textContent = comment.text;
    comment.replies.forEach(reply => addReply(reply, item.querySelector(".reply-list")));
    list.prepend(item);
}

function setupComments(game) {
    const list = $("#comment-list");
    const key = `game-house-comments-${game.id ?? game.name}`;
    const comments = JSON.parse(localStorage.getItem(key) || "[]").map(comment => typeof comment === "string"
        ? { id: createId(), text: comment, replies: [] }
        : { ...comment, id: comment.id || createId(), replies: comment.replies || [] });
    if (!comments.length) list.innerHTML = '<p class="empty-comments">Todavía no hay comentarios. ¡Dejá el primero!</p>';
    comments.forEach(comment => addComment(comment, list));
    $(".comment-form").addEventListener("submit", event => {
        event.preventDefault();
        const input = event.currentTarget.elements.comment;
        const text = input.value.trim();
        if (!text) return;
        list.querySelector(".empty-comments")?.remove();
        const comment = { id: createId(), text, replies: [] };
        addComment(comment, list);
        comments.unshift(comment);
        localStorage.setItem(key, JSON.stringify(comments));
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
            form.innerHTML = '<input name="reply" placeholder="Escribe una respuesta" aria-label="Escribe una respuesta" required><button type="submit">Responder</button>';
            body.append(form);
            button.setAttribute("aria-expanded", "true");
        }
    });
    list.addEventListener("submit", event => {
        const form = event.target.closest(".reply-form");
        if (!form) return;
        event.preventDefault();
        const text = form.elements.reply.value.trim();
        if (!text) return;
        const item = form.closest(".comment-item");
        const comment = comments.find(entry => entry.id === item.dataset.commentId);
        if (!comment) return;
        const reply = { text };
        comment.replies.push(reply);
        addReply(reply, item.querySelector(".reply-list"));
        localStorage.setItem(key, JSON.stringify(comments));
        form.remove();
        item.querySelector("[data-reply]").setAttribute("aria-expanded", "false");
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

    if (game.id === "minion-peg-solitaire") {
        $("#player-image").hidden = true;
        $("#game-player").classList.add("is-peg-game");
        setupPegSolitaire($("#peg-solitaire"), $("#game-player"), $("#launch-game"));
    } else {
        $("#launch-game").addEventListener("click", () => {
            $("#game-player").classList.add("is-playing");
        }, { once: true });
    }

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
if (selected === "minion-peg-solitaire") {
    showGame({
        id: "minion-peg-solitaire",
        name: "Minion Peg Solitaire",
        genres: [{ name: "Solitario" }],
        background_image: "img/peg_solitaire.png",
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
