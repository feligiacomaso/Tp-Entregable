function setupHeader() {
    const hostDocument = window.parent.document;
    const menuButton = document.querySelector(".menu-toggle");
    const profileButton = document.querySelector(".profile");

    if (!menuButton || !profileButton || hostDocument.getElementById("site-menu")) return;

    const copyTemplateToHost = templateId => {
        const template = document.getElementById(templateId);
        if (!template) return null;

        const panel = hostDocument.importNode(template.content, true).firstElementChild;
        hostDocument.body.append(panel);
        return panel;
    };

    const menuPanel = copyTemplateToHost("menu-panel-template");
    const profilePanel = copyTemplateToHost("profile-panel-template");
    if (!menuPanel || !profilePanel) return;

    const setPanelOpen = (panel, button, isOpen, label) => {
        panel.classList.toggle("is-open", isOpen);
        panel.setAttribute("aria-hidden", String(!isOpen));
        button.setAttribute("aria-expanded", String(isOpen));
        button.setAttribute("aria-label", `${isOpen ? "Cerrar" : "Abrir"} ${label}`);
    };

    const closePanels = () => {
        setPanelOpen(menuPanel, menuButton, false, "menú");
        setPanelOpen(profilePanel, profileButton, false, "perfil");
    };

    menuButton.addEventListener("click", () => {
        const shouldOpen = !menuPanel.classList.contains("is-open");
        closePanels();
        setPanelOpen(menuPanel, menuButton, shouldOpen, "menú");
    });

    profileButton.addEventListener("click", () => {
        const shouldOpen = !profilePanel.classList.contains("is-open");
        closePanels();
        setPanelOpen(profilePanel, profileButton, shouldOpen, "perfil");
    });

    hostDocument.addEventListener("click", event => {
        if (!menuPanel.contains(event.target) && !profilePanel.contains(event.target)) {
            closePanels();
        }
    });

    document.addEventListener("click", event => {
        if (!event.target.closest(".menu-toggle, .profile")) closePanels();
    });

    hostDocument.addEventListener("keydown", event => {
        if (event.key === "Escape") closePanels();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closePanels();
    });

    [menuPanel, profilePanel].forEach(panel => {
        panel.addEventListener("click", event => {
            if (event.target.closest("a")) closePanels();
        });
    });
}

setupHeader();
