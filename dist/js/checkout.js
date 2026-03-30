document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('pekseso_cart')) || [];
    const summaryContainer = document.getElementById('checkout__summary-items');
    const totalPriceElement = document.getElementById('checkout-total-price');
    const shippingPaymentContainer = document.getElementById('checkout__summary-shipping-payment');
    
    // Zásilkovna prvky
    const zasilkovnaBtn = document.getElementById('zasilkovna-btn');
    const zasilkovnaSelector = document.getElementById('zasilkovna-selector');
    const branchText = document.getElementById('selected-branch');
    const pickupRadio = document.getElementById('delivery-pickup');

    // Balíkovna prvky
    const balikovnaRadio = document.getElementById('delivery-balikovna'); // Musíš mít v HTML id="delivery-balikovna"
    const balikovnaSelector = document.getElementById('balikovna-selector');
    const balikovnaIframe = document.getElementById('balikovna-iframe');
    const balikovnaInfoText = document.getElementById('selected-balikovna-info');

    const personalRadio = document.getElementById('delivery-personaly');
    const cashOption = document.getElementById('payment-cash-option');
    const shippingRadios = document.getElementsByName('shipping_rate');
    const paymentRadios = document.getElementsByName('payment_method');
    const submitBtn = document.querySelector('.checkout__submit-btn');

    // Ceník dopravy (přidej tam ID Balíkovny, které máš v HTML)
    const shippingPrices = {
        "shr_1T6BpcJdC0N7uBdkHIPwzJUj": 75, // Zásilkovna box
        "shr_1TGh3LJdC0N7uBdkLyfGt4eu": 75,            // balikovna box
        "shr_1T6BqAJdC0N7uBdkVBnfRr7E": 99,
        "shr_1T6CKnJdC0N7uBdkFiXUdiFe": 0
    };

    if (cart.length === 0) {
        window.location.href = '/';
        return;
    }

    // --- 1. POMOCNÉ FUNKCE PRO VALIDACI ---
    const showError = (inputId, errorId, msg) => {
        const input = document.getElementById(inputId);
        const errorDiv = document.getElementById(errorId);
        if (input) input.style.borderColor = '#e63946';
        if (errorDiv) {
            errorDiv.innerText = msg;
            errorDiv.style.display = 'block';
        }
    };

    const clearErrors = () => {
        document.querySelectorAll('.checkout__input').forEach(input => input.style.borderColor = '');
        document.querySelectorAll('[id$="-error"]').forEach(div => div.style.display = 'none');
    };

    // --- 2. VYKRESLENÍ SHRNUTÍ ---
    const renderSummary = () => {
        let itemsTotal = 0;
        let itemsHtml = cart.map(item => {
            itemsTotal += item.price * item.quantity;
            return `
                <div class="checkout-item" style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                    <div style="flex-grow: 1;">
                        <div style="font-weight: bold; font-size: 1rem;">${item.name}</div>
                        <div style="font-size: 1rem; color: #0D0D0D;">${item.quantity}x - ${item.price * item.quantity} Kč</div>
                    </div>
                </div>`;
        }).join('');
        summaryContainer.innerHTML = itemsHtml;

        const selectedShipping = document.querySelector('input[name="shipping_rate"]:checked');
        const selectedPayment = document.querySelector('input[name="payment_method"]:checked');
        
        let shippingTotal = 0;
        let shippingPaymentHtml = '';

        if (selectedShipping) {
            shippingTotal = shippingPrices[selectedShipping.value] || 0;
            const shippingName = selectedShipping.closest('.shipping-card').querySelector('.shipping-card__name').innerText;
            shippingPaymentHtml += `<div style="font-size: 1rem; margin-bottom: 4px;"><strong>Doprava:</strong> ${shippingName} (${shippingTotal} Kč)</div>`;
        }

        if (selectedPayment) {
            const paymentLabel = selectedPayment.closest('.payment-card').querySelector('.payment-card__name').innerText;
            shippingPaymentHtml += `<div style="font-size: 1rem; color: #0D0D0D;"><strong>Platba:</strong> ${paymentLabel} (0 Kč)</div>`;
            if (submitBtn) submitBtn.innerText = 'Objednávka zavazující k platbě';
        }

        if (shippingPaymentContainer) shippingPaymentContainer.innerHTML = shippingPaymentHtml;
        totalPriceElement.innerText = itemsTotal + shippingTotal;
    };

    // --- 3. LOGIKA DOPRAVY A PLATBY ---
    const handleLogicChange = () => {
        // Zásilkovna toggle
        if (zasilkovnaSelector) zasilkovnaSelector.style.display = (pickupRadio && pickupRadio.checked) ? 'block' : 'none';
        
        // Balíkovna toggle
        if (balikovnaSelector) {
            if (balikovnaRadio && balikovnaRadio.checked) {
                balikovnaSelector.style.display = 'block';
                
                // OPRAVA: Kontrolujeme, zda src obsahuje doménu pošty
                // Pokud ne, nebo je tam jen prázdný řetězec/aktuální URL, vložíme mapu
                if (!balikovnaIframe.src.includes("cpost.cz")) {
                    balikovnaIframe.src = "https://b2c.cpost.cz/locations/?type=BALIKOVNY";
                    console.log("Mapa Balíkovny se právě načítá do iframe...");
                }
            } else {
                balikovnaSelector.style.display = 'none';
            }
        }

        if (personalRadio && personalRadio.checked) {
            if (cashOption) cashOption.style.display = 'flex';
        } else {
            if (cashOption) cashOption.style.display = 'none';
            const checkedPayment = document.querySelector('input[name="payment_method"]:checked');
            if (checkedPayment && checkedPayment.value === 'cash') {
                const cardRadio = document.querySelector('input[value="card"]');
                if (cardRadio) cardRadio.checked = true;
            }
        }
        renderSummary();
    };

    shippingRadios.forEach(radio => radio.addEventListener('change', handleLogicChange));
    paymentRadios.forEach(radio => radio.addEventListener('change', renderSummary));

    // --- 4. ZÁSILKOVNA EVENT ---
    if (zasilkovnaBtn) {
        zasilkovnaBtn.addEventListener('click', () => {
            Packeta.Widget.pick('39e581085dd78c93', (point) => {
                if (point) {
                    document.getElementById('zasilkovna-id').value = point.id;
                    document.getElementById('zasilkovna-name').value = point.name;
                    branchText.innerText = "Vybráno: " + point.name;
                    renderSummary();
                }
            }, { country: 'cz', language: 'cs' });
        });
    }

    // --- 5. BALÍKOVNA EVENT (postMessage) ---
    window.addEventListener('message', (event) => {
        if (event.data.message === 'pickerResult' && event.data.point) {
            const point = event.data.point;
            document.getElementById('balikovna-id').value = point.id;
            document.getElementById('balikovna-name').value = point.name;
            if (balikovnaInfoText) {
                balikovnaInfoText.innerText = `Vybráno: ${point.name}, ${point.address}`;
            }
            renderSummary();
        }
    });

    // --- 6. DODACÍ ADRESA TOGGLE ---
    const shippingCheckbox = document.getElementById('shipping-different');
    const shippingSection  = document.getElementById('shipping-section');
    const shippingInputs   = shippingSection ? shippingSection.querySelectorAll('input') : [];

    function toggleShipping() {
        const isVisible = shippingCheckbox && shippingCheckbox.checked;
        if (shippingSection) {
            shippingSection.classList.toggle('is-visible', isVisible);
            shippingSection.setAttribute('aria-hidden', String(!isVisible));
        }
        shippingInputs.forEach(input => {
            if (isVisible) input.setAttribute('required', '');
            else { input.removeAttribute('required'); input.value = ''; }
        });
    }

    if (shippingCheckbox) {
        shippingCheckbox.addEventListener('change', toggleShipping);
        toggleShipping();
    }

    // --- 7. ODESLÁNÍ FORMULÁŘE ---
    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        let hasError = false;

        // ... (ponechána stávající validace jména, e-mailu a telefonu) ...
        if (!data.billing_first_name) { showError('billing_first_name', 'billing_first_name-error', 'Vyplňte jméno.'); hasError = true; }
        if (!data.billing_last_name)  { showError('billing_last_name', 'billing_last_name-error', 'Vyplňte příjmení.'); hasError = true; }
        if (!data.billing_street)     { showError('billing_street', 'billing_street-error', 'Vyplňte ulici a číslo popisné.'); hasError = true; }
        if (!data.billing_city)       { showError('billing_city', 'billing_city-error', 'Vyplňte město.'); hasError = true; }
        if (!data.billing_zip)        { showError('billing_zip', 'billing_zip-error', 'Vyplňte PSČ.'); hasError = true; }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(data.email)) { showError('email', 'email-error', 'Zadejte platný e-mail.'); hasError = true; }

        // Validace výběru pobočky
        if (pickupRadio && pickupRadio.checked && !data.zasilkovna_id) {
            alert("Prosím, vyberte pobočku Zásilkovny.");
            hasError = true;
        }
        if (balikovnaRadio && balikovnaRadio.checked && !data.balikovna_id) {
            alert("Prosím, vyberte pobočku Balíkovny v mapě.");
            hasError = true;
        }

        const checkbox = document.getElementById('checkbox');
        if (!checkbox || !checkbox.checked) {
            showError('checkbox', 'checkbox-error', 'Musíte souhlasit s obchodními podmínkami.');
            hasError = true;
        }

        if (hasError) return;

        // Identifikace vybraného místa pro metadata
        let vybranaPobocka = 'Adresa';
        if (pickupRadio && pickupRadio.checked) vybranaPobocka = `Zásilkovna: ${data.zasilkovna_name}`;
        if (balikovnaRadio && balikovnaRadio.checked) vybranaPobocka = `Balíkovna: ${data.balikovna_name}`;
        if (personalRadio && personalRadio.checked) vybranaPobocka = 'Osobní odběr';

        // Variabilní symbol
        const teď = new Date();
        const vs = teď.getFullYear().toString().slice(-2) + (teď.getMonth() + 1).toString().padStart(2, '0') + teď.getDate().toString().padStart(2, '0') + teď.getHours().toString().padStart(2, '0') + teď.getMinutes().toString().padStart(2, '0');

        // Společný objekt pro odeslání (přidána Balíkovna)
        const orderPayload = {
            ...data,
            cart: cart,
            vs: vs,
            totalPrice: totalPriceElement.innerText,
            pobocka_metadata: vybranaPobocka // Pro snazší přehled v adminu/mailu
        };

        if (data.payment_method === 'card') {
            try {
                const response = await fetch('/.netlify/functions/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart.map(i => ({ price: i.id, quantity: i.quantity })),
                        customer: data,
                        shipping_rate: data.shipping_rate,
                        metadata: { vs: vs, pobocka: vybranaPobocka }
                    })
                });
                const resData = await response.json();
                if (resData.url) window.location.href = resData.url;
            } catch (err) { alert("Chyba při startu platby kartou."); }
        } else {
            try {
                const response = await fetch('/.netlify/functions/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });
                const resData = await response.json();
                if (resData.success) {
                    localStorage.removeItem('pekseso_cart');
                    window.location.href = `/dekujeme/?vs=${vs}&amount=${totalPriceElement.innerText}&method=${data.payment_method}`;
                } else { alert("Chyba při odesílání objednávky."); }
            } catch (err) { alert("Server neodpovídá."); }
        }
    });

    handleLogicChange();
});