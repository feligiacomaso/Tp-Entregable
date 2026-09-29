const password = document.querySelector("#password");
const repeatedPassword = document.querySelector("#repeat-password");

function validatePasswords() {
    repeatedPassword.setCustomValidity(
        repeatedPassword.value && repeatedPassword.value !== password.value
            ? "Las contraseñas no coinciden."
            : ""
    );
}

password.addEventListener("input", validatePasswords);
repeatedPassword.addEventListener("input", validatePasswords);
document.querySelector("form").addEventListener("submit", event => {
    validatePasswords();
    if (!event.currentTarget.checkValidity()) {
        event.preventDefault();
        event.currentTarget.reportValidity();
    }
});
