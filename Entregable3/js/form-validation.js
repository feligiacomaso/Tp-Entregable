const forms = document.querySelectorAll("form[data-validate-required]");

forms.forEach(form => {
    const fields = [...form.querySelectorAll("input[required], select[required], textarea[required]")];
    const successMessage = form.querySelector(".registration-success");
    let hasAttemptedSubmit = false;
    let isSubmitting = false;

    const updateMatchingFields = () => {
        fields.forEach(field => {
            if (!field.dataset.matches) return;

            const matchingField = form.querySelector(field.dataset.matches);
            const mismatch = field.value && field.value !== matchingField?.value;
            field.setCustomValidity(mismatch ? "Las contraseñas no coinciden." : "");
        });
    };

    const getErrorMessage = field => {
        if (field.validity.valueMissing) {
            if (field.dataset.requiredMessage) return field.dataset.requiredMessage;

            const label = field.labels[0]?.textContent.replace("*", "").trim();
            return `${label || "Este campo"} es obligatorio.`;
        }

        if (field.validity.typeMismatch && field.type === "email") {
            return "Ingresá un correo electrónico válido.";
        }

        return field.validationMessage;
    };

    const validateField = field => {
        const error = form.querySelector(`#${field.getAttribute("aria-describedby")}`);
        const message = field.validity.valid ? "" : getErrorMessage(field);

        field.setAttribute("aria-invalid", String(Boolean(message)));
        error.textContent = message;
        error.hidden = !message;

        return !message;
    };

    form.addEventListener("submit", event => {
        if (isSubmitting) {
            event.preventDefault();
            return;
        }

        hasAttemptedSubmit = true;
        updateMatchingFields();

        const firstInvalidField = fields.find(field => !validateField(field));
        if (firstInvalidField) {
            event.preventDefault();
            firstInvalidField.focus();
        } else if (successMessage) {
            event.preventDefault();
            isSubmitting = true;
            window.setTimeout(() => {
                successMessage.classList.add("is-visible");
                window.setTimeout(() => window.location.assign(form.action), 1500);
            }, 1800);
        }
    });

    form.addEventListener("input", () => {
        if (!hasAttemptedSubmit) return;

        updateMatchingFields();
        fields.forEach(validateField);
    });
});
