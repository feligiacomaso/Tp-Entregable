export function setupHeader() {
    const parent = window.parent.document;
    const menuButton = document.querySelector(".menu-toggle");
    const profileButton = document.querySelector(".profile");
    const menuPanel = parent.createElement("aside");
    const profilePanel = parent.createElement("aside");

    menuPanel.className = "menu-panel";
    menuPanel.innerHTML = `<nav aria-label="Menú principal">
        <a href="index.html"><span class="category-icon">⌂</span>Inicio</a>
        <a href="#"><span class="category-icon">✦</span>Nuevos</a>
        <a href="#"><span class="category-icon">♛</span>Populares</a>
        <a href="#"><span class="category-icon">★</span>Favoritos</a>
        <a href="#"><span class="category-icon">◆</span>Todas las categorías</a>
        <div class="menu-divider"></div>
        <a href="#"><span class="category-icon">●</span>Acción</a>
        <a href="#"><span class="category-icon">▣</span>Arcade</a>
        <a href="#"><span class="category-icon">◉</span>Aventuras</a>
        <a href="#"><span class="category-icon">♠</span>Solitario</a>
        <a href="#"><span class="category-icon">▤</span>Cocina</a>
        <a href="#"><span class="category-icon">⚯</span>Deportes</a>
        <a href="#"><span class="category-icon">◉</span>Conducir</a>
        <a href="#"><span class="category-icon">♟</span>Estrategia</a>
        <a href="#"><span class="category-icon">☷</span>Gestión</a>
        <a href="#"><span class="category-icon">⌕</span>Objetos ocultos</a>
        <a href="#"><span class="category-icon">✚</span>Rompecabezas</a>
    </nav>`;
    profilePanel.className = "profile-panel";
    profilePanel.innerHTML = `<h2>Mi perfil</h2><nav aria-label="Menú de perfil">
        <a href="#">Perfil</a><a href="#">Favoritos</a><a href="#">Wishlist</a>
        <a href="#">Configuración</a><a href="#">Cerrar sesión</a>
    </nav>`;
    parent.body.append(menuPanel, profilePanel);

    const closeMenu = () => {
        menuPanel.classList.remove("is-open");
        menuButton.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Abrir menú");
    };
    menuButton.addEventListener("click", () => {
        const isOpen = menuPanel.classList.toggle("is-open");
        menuButton.classList.toggle("is-open", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
        profilePanel.classList.remove("is-open");
    });
    profileButton.addEventListener("click", () => {
        profilePanel.classList.toggle("is-open");
        menuPanel.classList.remove("is-open");
        closeMenu();
    });
    menuPanel.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
}

setupHeader();
