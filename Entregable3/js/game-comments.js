const $ = selector => document.querySelector(selector);
const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function addReply(reply, list) {
    const item = document.createElement("div");
    item.className = "comment-reply";
    item.innerHTML = '<span class="comment-avatar reply-avatar" aria-hidden="true"><img src="src/icon_profile.svg" alt=""></span><div><small>Vos</small><time>ahora</time><p></p></div>';
    item.querySelector("p").textContent = reply.text;
    list.append(item);
}

function addComment(comment, list) {
    const item = document.createElement("article");
    item.className = "comment-item";
    item.dataset.commentId = comment.id;
    item.innerHTML = '<span class="comment-avatar user" aria-hidden="true"><img src="src/icon_profile.svg" alt=""></span><div class="comment-body"><small>Vos</small><time>ahora</time><p></p><div class="comment-actions"><button type="button" data-vote="like" aria-label="Me gusta" aria-pressed="false"><img class="vote-icon" src="src/icon_like.svg" alt=""><span>0</span></button><button type="button" data-vote="dislike" aria-label="No me gusta" aria-pressed="false"><img class="vote-icon dislike" src="src/icon_like.svg" alt=""><span>0</span></button><button type="button" data-reply aria-expanded="false">Responder</button></div><div class="reply-list"></div></div>';
    item.querySelector(".comment-body > p").textContent = comment.text;
    comment.replies.forEach(reply => addReply(reply, item.querySelector(".reply-list")));
    list.prepend(item);
}

export function setupComments(game) {
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
                oldButton.querySelector(".vote-icon").src = "src/icon_like.svg";
            }
            if (next) {
                button.querySelector("span").textContent = Number(button.querySelector("span").textContent) + 1;
                button.setAttribute("aria-pressed", "true");
                button.querySelector(".vote-icon").src = "src/icon_like_active.svg";
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
            form.innerHTML = '<input name="reply" placeholder="Escribe una respuesta" aria-label="Escribe una respuesta" required><button type="submit"><span>Responder</span></button>';
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
