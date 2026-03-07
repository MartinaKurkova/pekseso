// Přidej tento kód do svého withdrawal JS souboru,
// nebo vlož jako samostatný <script> před </body> na stránce s formulářem.
//
// Předpoklad: formulář má action="..." a klasický HTML submit.
// Tento kód submit zachytí, přečte číslo objednávky a přesměruje na děkovnou stránku.

const withdrawalForm = document.querySelector('.withdrawal-form__fieldset')?.closest('form');

if (withdrawalForm) {
  withdrawalForm.addEventListener('submit', function (e) {

    // Validace proběhne ve tvém stávajícím kódu — tady jen zachytíme číslo objednávky
    // DŮLEŽITÉ: tento listener přidej AŽ PO svém validačním listeneru,
    // nebo ho integruj přímo do stávajícího submit handleru (viz níže).

    const orderNumber = document.getElementById('number')?.value.trim();
    const redirectUrl = 'https://pekseso-web.netlify.app/dekujeme/?form=withdrawal' + (orderNumber ? '&order=' + encodeURIComponent(orderNumber) : '');

    // Změň action formuláře těsně před odesláním
    // (Web3Forms action zůstane, přesměrování řídí Web3Forms přes _redirect)
    const redirectInput = withdrawalForm.querySelector('input[name="_redirect"]');
    if (redirectInput) {
      redirectInput.value = redirectUrl;
    } else {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = '_redirect';
      input.value = redirectUrl;
      withdrawalForm.appendChild(input);
    }

    // Formulář se odešle standardně na Web3Forms
  });
}
