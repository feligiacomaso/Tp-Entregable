export function setupGameGallery({ gallery, firstCard, firstImage, secondImage, secondAlt, secondCard, secondImageElement }) {
    if (!secondImage || !gallery || !firstCard || !firstImage || !secondCard || !secondImageElement) return;

    secondImageElement.src = secondImage;
    secondImageElement.alt = secondAlt;
    secondCard.hidden = false;
    gallery.classList.add("is-stacked");

    const cards = [firstCard, secondCard];
    let frontIndex = 0;

    const updateCardStates = () => cards.forEach((card, index) => {
        const isFront = index === frontIndex;
        card.classList.toggle("is-front", isFront);
        card.classList.toggle("is-back", !isFront);
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-pressed", String(isFront));
        card.setAttribute("aria-label", isFront
            ? `Imagen ${index + 1} al frente. Activá para traer la otra imagen adelante.`
            : `Traer imagen ${index + 1} al frente`);
    });

    const bringForward = card => {
        const clickedIndex = cards.indexOf(card);
        if (clickedIndex < 0) return;
        frontIndex = clickedIndex === frontIndex ? (frontIndex + 1) % cards.length : clickedIndex;
        updateCardStates();
    };

    cards.forEach(card => {
        card.addEventListener("click", () => bringForward(card));
        card.addEventListener("keydown", event => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            bringForward(card);
        });
    });

    updateCardStates();
}
