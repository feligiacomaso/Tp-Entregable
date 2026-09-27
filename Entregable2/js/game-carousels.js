import { createGameCard } from "./game-card.js";

function setupCarousel(section, games) {
    const track = section.querySelector(".track");
    track.replaceChildren(...games.map(game => createGameCard(game)));
    const [previous, next] = section.querySelectorAll(".row-arrow");
    const pagination = document.createElement("div");
    pagination.className = "carousel-pagination";
    pagination.setAttribute("aria-label", "Páginas del carrusel");
    section.querySelector(".carousel").after(pagination);
    let page = 0;
    let pages = 1;
    let scrollTimer;

    const renderPagination = () => {
        pages = Math.max(1, Math.ceil(track.scrollWidth / track.clientWidth));
        page = Math.min(page, pages - 1);
        pagination.replaceChildren(...Array.from({ length: pages }, (_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = `pagination-dot${index === page ? " is-active" : ""}`;
            dot.setAttribute("aria-label", `Página ${index + 1} de ${pages}`);
            dot.setAttribute("aria-current", index === page ? "true" : "false");
            dot.addEventListener("click", () => goTo(index));
            return dot;
        }));
    };
    const goTo = index => {
        page = (index + pages) % pages;
        track.scrollTo({ left: (track.scrollWidth - track.clientWidth) * page / Math.max(1, pages - 1), behavior: "smooth" });
        updatePagination();
    };
    const updatePagination = () => {
        pagination.querySelectorAll(".pagination-dot").forEach((dot, index) => {
            const active = index === page;
            dot.classList.toggle("is-active", active);
            dot.setAttribute("aria-current", active ? "true" : "false");
        });
    };
    const syncPage = () => {
        const max = track.scrollWidth - track.clientWidth;
        if (max > 0) page = Math.round(track.scrollLeft / max * (pages - 1));
        updatePagination();
    };

    next.addEventListener("click", () => goTo(page + 1));
    previous.addEventListener("click", () => goTo(page - 1));
    track.addEventListener("scroll", () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(syncPage, 120);
    }, { passive: true });
    new ResizeObserver(renderPagination).observe(track);
    renderPagination();
}

export function setupGameCarousels({ popular, recent, recommended }) {
    const sections = document.querySelectorAll(".game-section");
    setupCarousel(sections[0], popular);
    setupCarousel(sections[1], recent);
    setupCarousel(sections[2], recommended);
}
