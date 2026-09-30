function renderFavoriteState(buttons, active) {
    buttons.forEach(button => {
        button.setAttribute("aria-pressed", String(active));
        if (button.classList.contains("favorite-toggle")) {
            button.textContent = active ? "★" : "☆";
        }
        if (button.classList.contains("favorite-cta")) {
            button.classList.toggle("is-favorite", active);
        }
    });
}

export function setupFavoriteControls(game) {
    const key = `game-house-favorite-${game.id ?? game.name}`;
    const buttons = document.querySelectorAll(".favorite-toggle,.favorite-cta");
    renderFavoriteState(buttons, localStorage.getItem(key) === "true");
    buttons.forEach(button => button.addEventListener("click", () => {
        const active = localStorage.getItem(key) !== "true";
        localStorage.setItem(key, String(active));
        renderFavoriteState(buttons, active);
    }));
}
