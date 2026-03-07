const contactForm = document.querySelector('.contact-form__fieldset')?.closest('form');

if (contactForm) {

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    clearErrors();

    const isValid = validateAll();

    if (isValid) {
      HTMLFormElement.prototype.submit.call(this);
    }
  });

}

// ============================================================
//  Hlavní validace
// ============================================================

function validateAll() {
  let valid = true;

  // Jméno – neprázdné
  const name = document.getElementById('jmeno');
  if (!name.value.trim()) {
    showError('jmeno-error', 'Vyplňte jméno a příjmení.');
    valid = false;
  }

  // E-mail – formát
  const email = document.getElementById('email');
  if (!email.value.trim()) {
    showError('email-error', 'Vyplňte e-mailovou adresu.');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showError('email-error', 'Zadejte e-mail ve správném formátu (např. jan@example.cz).');
    valid = false;
  }

  // Zpráva – neprázdná
  const message = document.getElementById('message');
  if (!message.value.trim()) {
    showError('message-error', 'Napište nám zprávu.');
    valid = false;
  }

  // GDPR checkbox
  const checkbox = document.getElementById('checkbox');
  if (!checkbox.checked) {
    showError('checkbox-error', 'Pro odeslání formuláře je nutný souhlas se zásadami ochrany osobních údajů.');
    valid = false;
  }

  // Přesun focusu na první chybné pole (přístupnost)
  if (!valid) {
    const firstError = contactForm.querySelector('.contact-form__error:not(:empty)');
    if (firstError) {
      const field = firstError.previousElementSibling;
      if (field) field.focus();
    }
  }

  return valid;
}

// ============================================================
//  Pomocné funkce
// ============================================================

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors() {
  contactForm.querySelectorAll('.contact-form__error').forEach(el => {
    el.textContent = '';
  });
}
