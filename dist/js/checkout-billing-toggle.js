// --- Dodací adresa toggle ---
// Fakturační adresa je vždy viditelná.
// Dodací sekce se rozbalí, pokud se liší od fakturační.

const shippingCheckbox = document.getElementById('shipping-different');
const shippingSection  = document.getElementById('shipping-section');
const shippingInputs   = shippingSection ? shippingSection.querySelectorAll('input') : [];

function toggleShipping() {
  const isVisible = shippingCheckbox.checked;
  shippingSection.classList.toggle('is-visible', isVisible);
  shippingSection.setAttribute('aria-hidden', String(!isVisible));

  // Povolit/zakázat required na polích dodací adresy
  shippingInputs.forEach(input => {
    if (isVisible) {
      input.setAttribute('required', '');
    } else {
      input.removeAttribute('required');
      input.value = ''; // vyčistit hodnoty při skrytí
    }
  });
}

if (shippingCheckbox) {
  shippingCheckbox.addEventListener('change', toggleShipping);
  toggleShipping(); // inicializace při načtení stránky
}
