import { isFreeToPlay } from "./api.js";

export function setupGamePlayer(game) {
    const player = document.querySelector("#game-player");
    const isFree = isFreeToPlay(game);
    document.querySelector("#launch-game").hidden = !isFree;
    document.querySelector("#paid-game-actions").hidden = isFree;

    const revealGame = () => player.classList.add("is-playing");
    document.querySelector("#launch-game").addEventListener("click", revealGame);
    document.querySelector("#buy-game").addEventListener("click", revealGame);
    document.querySelector("#wishlist-game").addEventListener("click", revealGame);
    document.querySelector("#return-game").addEventListener("click", () => {
        player.classList.remove("is-playing");
    });

    document.querySelector(".fullscreen-toggle").addEventListener("click", async () => {
        if (!document.fullscreenElement) await player.requestFullscreen?.();
        else await document.exitFullscreen();
    });
}
