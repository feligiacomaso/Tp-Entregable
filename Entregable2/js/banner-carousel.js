import { createGameCard } from "./game-card.js";

export function setupBannerCarousel(games) {
    const section = document.querySelector(".featured");
    const track = section.querySelector(".track");
    const featuredGames = games.slice(0, 3);
    let activeIndex = 0;
    let cards;

    const update = () => cards.forEach((card, index) => {
        const position = (index - activeIndex + cards.length) % cards.length;
        card.classList.toggle("is-active", position === 0);
        card.classList.toggle("side-right", position === 1);
        card.classList.toggle("side-left", position === cards.length - 1);
    });

    cards = featuredGames.map((game, index) => createGameCard(game, {
        large: true,
        onPromote: () => { activeIndex = index; update(); }
    }));
    track.replaceChildren(...cards);
    section.querySelector(".hero-prev").addEventListener("click", () => {
        activeIndex = (activeIndex - 1 + cards.length) % cards.length;
        update();
    });
    section.querySelector(".hero-next").addEventListener("click", () => {
        activeIndex = (activeIndex + 1) % cards.length;
        update();
    });
    update();
}
