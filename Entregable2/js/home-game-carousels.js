import { createGameCard } from "./home-game-card.js";

function setupCarousel(section, games) {
    const track = section.querySelector(".track");
    track.replaceChildren(...games.map(game => createGameCard(game)));
    const [previous, next] = section.querySelectorAll(".row-arrow");
    const pagination = document.createElement("div");
    pagination.className = "carousel-pagination";
    pagination.setAttribute("aria-label", "Páginas del carrusel");
    section.querySelector(".carousel").after(pagination);
    let cardIndex = 0;
    let pages = 1;

    const getVisibleCards = () => {
        const firstCard = track.querySelector(".card");
        if (!firstCard) return 1;

        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const cardStep = firstCard.getBoundingClientRect().width + gap;
        return Math.max(1, Math.round((track.clientWidth + gap) / cardStep));
    };

    const getLastCardIndex = () => Math.max(0, games.length - getVisibleCards());

    const getCurrentPage = () => {
        const lastCardIndex = getLastCardIndex();
        return lastCardIndex === 0
            ? 0
            : Math.round(cardIndex / lastCardIndex * (pages - 1));
    };

    const moveTrack = () => {
        const firstCard = track.querySelector(".card");
        if (!firstCard) return;

        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const offset = (firstCard.getBoundingClientRect().width + gap) * cardIndex;
        track.style.transform = `translateX(-${offset}px)`;
    };

    const renderPagination = () => {
        const visibleCards = getVisibleCards();
        pages = Math.max(1, Math.ceil(games.length / visibleCards));
        cardIndex = Math.min(cardIndex, getLastCardIndex());
        moveTrack();
        pagination.replaceChildren(...Array.from({ length: pages }, (_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = `pagination-dot${index === getCurrentPage() ? " is-active" : ""}`;
            dot.setAttribute("aria-label", `Página ${index + 1} de ${pages}`);
            dot.setAttribute("aria-current", index === getCurrentPage() ? "true" : "false");
            dot.addEventListener("click", () => goToPage(index));
            return dot;
        }));
        updatePagination();
    };
    const goToCard = index => {
        const lastCardIndex = getLastCardIndex();
        cardIndex = Math.min(Math.max(index, 0), lastCardIndex);
        moveTrack();
        updatePagination();
    };

    const goToPage = index => {
        cardIndex = Math.round(getLastCardIndex() * index / Math.max(1, pages - 1));
        moveTrack();
        updatePagination();
    };
    const updatePagination = () => {
        const currentPage = getCurrentPage();
        previous.disabled = cardIndex === 0;
        next.disabled = cardIndex === getLastCardIndex();
        pagination.querySelectorAll(".pagination-dot").forEach((dot, index) => {
            const active = index === currentPage;
            dot.classList.toggle("is-active", active);
            dot.setAttribute("aria-current", active ? "true" : "false");
        });
    };
    next.addEventListener("click", () => goToCard(cardIndex + 1));
    previous.addEventListener("click", () => goToCard(cardIndex - 1));
    new ResizeObserver(renderPagination).observe(track);
    renderPagination();
}

export function setupGameCarousels({ popular, recent, recommended }) {
    const sections = document.querySelectorAll(".game-section");
    setupCarousel(sections[0], popular);
    setupCarousel(sections[1], recent);
    setupCarousel(sections[2], recommended);
}
