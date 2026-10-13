import { isFreeToPlay } from "./api.js";

export function setupGamePlayer(game) {
    const player = document.querySelector("#game-player");
    const frame = document.querySelector("#game-frame");
    const image = document.querySelector("#player-image");

    const isFree = isFreeToPlay(game);

    document.querySelector("#launch-game").hidden = !isFree;
    document.querySelector("#paid-game-actions").hidden = isFree;

    const revealGame = () => {
        if (game.id === "blocka") {
            frame.src = "blocka.html";
            frame.hidden = false;
            image.hidden = true;
        }

        player.classList.add("is-playing");
    };

    document.querySelector("#launch-game").addEventListener("click", revealGame);
    document.querySelector("#buy-game").addEventListener("click", revealGame);
    document.querySelector("#wishlist-game").addEventListener("click", revealGame);
    document.querySelector("#return-game").addEventListener("click", () => {
        player.classList.remove("is-playing");
        if (game.id === "blocka" ) {
            frame.src = "about:blank";
            frame.hidden = true;
            image.hidden = false;
        }
    });

    document.querySelector(".fullscreen-toggle").addEventListener("click", async () => {
        if (!document.fullscreenElement) await player.requestFullscreen?.();
        else await document.exitFullscreen();
    });
}
