export async function loadFooter() {
    const mount = document.querySelector("#site-footer");
    try {
        const response = await fetch(new URL("../footer.html", import.meta.url));
        if (!response.ok) throw new Error(`No se pudo cargar footer.html (${response.status})`);
        mount.innerHTML = await response.text();
        mount.querySelector("[data-year]").textContent = new Date().getFullYear();
    } catch (error) {
        console.error("Error al cargar el footer:", error);
    }
}
