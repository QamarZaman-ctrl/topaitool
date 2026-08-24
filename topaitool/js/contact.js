function initContactForm() {
  const form = document.getElementById("contact-form");
  const successEl = document.getElementById("form-success");
  const sendAnotherBtn = document.getElementById("send-another");
  if (!form) return;

  const fields = {
    name: { el: document.getElementById("name"), error: document.getElementById("name-error"), validate: (v) => v.trim().length >= 2 || "Please enter your full name (at least 2 characters)." },
    email: { el: document.getElementById("email"), error: document.getElementById("email-error"), validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Please enter a valid email address." },
    subject: { el: document.getElementById("subject"), error: document.getElementById("subject-error"), validate: (v) => v.trim() !== "" || "Please select a subject." },
    message: { el: document.getElementById("message"), error: document.getElementById("message-error"), validate: (v) => v.trim().length >= 10 || "Please enter a message (at least 10 characters)." },
  };

  function clearErrors() {
    Object.values(fields).forEach(({ el, error }) => {
      el.classList.remove("input-error");
      if (error) error.textContent = "";
    });
  }

  function validateField(key) {
    const { el, error, validate } = fields[key];
    const result = validate(el.value);
    if (result === true) {
      el.classList.remove("input-error");
      if (error) error.textContent = "";
      return true;
    }
    el.classList.add("input-error");
    if (error) error.textContent = result;
    return false;
  }

  Object.keys(fields).forEach((key) => {
    fields[key].el.addEventListener("blur", () => validateField(key));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const valid = Object.keys(fields).every((key) => validateField(key));
    if (!valid) return;

    form.hidden = true;
    successEl.hidden = false;
    successEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener("click", () => {
      form.reset();
      clearErrors();
      form.hidden = false;
      successEl.hidden = true;
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "contact") {
    initContactForm();
    if (typeof injectContactPageSchema === "function") injectContactPageSchema();
  }
});
