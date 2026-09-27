const dialog = document.createElement("dialog");
dialog.className = "game-dialog";
dialog.innerHTML = '<button class="dialog-close" aria-label="Cerrar">×</button><img class="dialog-image" alt=""><div class="dialog-content"><small class="dialog-meta"></small><h2></h2><p class="dialog-description"></p><p class="dialog-platforms"></p></div>';
document.body.append(dialog);
dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

export function openGameDetails(game) {
    const image = dialog.querySelector(".dialog-image");
    image.src = game.background_image || game.background_image_low_res || "";
    image.hidden = !image.src;
    dialog.querySelector("h2").textContent = game.name || "Juego sin título";
    dialog.querySelector(".dialog-meta").textContent = [
        game.rating ? `★ ${game.rating}` : "Sin calificación",
        game.released || "Fecha desconocida",
        (game.genres || []).map(genre => genre.name).join(" · ")
    ].filter(Boolean).join("  ·  ");
    dialog.querySelector(".dialog-description").textContent = game.description || "No hay descripción disponible.";
    dialog.querySelector(".dialog-platforms").textContent =
        "Plataformas: " + ((game.platforms || []).map(platform => platform.name).join(", ") || "No informadas");
    dialog.showModal();
}
