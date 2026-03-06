const withdrawalForm = document.querySelector('.withdrawal-form__fieldset')?.closest('form');

if (withdrawalForm) {

  withdrawalForm.addEventListener('submit', function (e) {
    e.preventDefault();

    clearErrors();

    const isValid = validateAll();

    if (isValid) {
      this.submit();
    }
  });

}

// ============================================================
//  Hlavní validace – projde všechna pole
// ============================================================

function validateAll() {
  let valid = true;

  // Číslo objednávky – pouze číslice
  const number = document.getElementById('number');
  if (!number.value.trim()) {
    showError('number-error', 'Vyplňte číslo objednávky.');
    valid = false;
  } else if (!/^\d+$/.test(number.value.trim())) {
    showError('number-error', 'Číslo objednávky může obsahovat pouze číslice.');
    valid = false;
  }

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

  // Telefon – volitelný, ale pokud vyplněn: číslice, mezery, + (mezinárodní formát)
  const phone = document.getElementById('phone');
  if (phone.value.trim() && !/^\+?[\d\s]{9,15}$/.test(phone.value.trim())) {
    showError('phone-error', 'Zadejte telefonní číslo ve správném formátu (např. +420 123 456 789).');
    valid = false;
  }

  // Číslo účtu – formát XXXXXX/XXXX (předčíslí volitelné: 123456-123456/1234)
  const account = document.getElementById('account');
  if (!account.value.trim()) {
    showError('account-error', 'Vyplňte číslo účtu.');
    valid = false;
  } else if (!/^(\d{1,6}-)?\d{1,10}\/\d{4}$/.test(account.value.trim())) {
    showError('account-error', 'Zadejte číslo účtu ve formátu 123456/0100 nebo 123456-123456/0100.');
    valid = false;
  }

  // Zpráva – neprázdná
  const message = document.getElementById('message');
  if (!message.value.trim()) {
    showError('message-error', 'Napište nám zprávu.');
    valid = false;
  }

  // Fotka – limit 10 MB (pokud přiložena)
  const attachment = document.getElementById('attachment');
  if (attachment.files.length > 0) {
    const maxSize = 10 * 1024 * 1024; // 10 MB v bytech
    if (attachment.files[0].size > maxSize) {
      showError('attachment-error', 'Fotka je příliš velká. Maximální velikost je 10 MB.');
      valid = false;
    }
  }

  // GDPR checkbox
  const checkbox = document.getElementById('checkbox');
  if (!checkbox.checked) {
    showError('checkbox-error', 'Pro odeslání formuláře je nutný souhlas se zásadami ochrany osobních údajů.');
    valid = false;
  }

  // Přesun focusu na první chybné pole (přístupnost)
  if (!valid) {
    const firstError = withdrawalForm.querySelector('.withdrawal-form__error:not(:empty)');
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
  withdrawalForm.querySelectorAll('.withdrawal-form__error').forEach(el => {
    el.textContent = '';
  });
}