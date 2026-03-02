document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('pekseso_cart')) || [];
    const summaryContainer = document.getElementById('checkout__summary-items');
    const totalPriceElement = document.getElementById('checkout-total-price');
    const shippingPaymentContainer = document.getElementById('checkout__summary-shipping-payment');
    
    const zasilkovnaBtn = document.getElementById('zasilkovna-btn');
    const zasilkovnaSelector = document.getElementById('zasilkovna-selector');
    const branchText = document.getElementById('selected-branch');
    const pickupRadio = document.getElementById('delivery-pickup');
    const personalRadio = document.getElementById('delivery-personaly');
    const cashOption = document.getElementById('payment-cash-option');
    const shippingRadios = document.getElementsByName('shipping_rate');
    const paymentRadios = document.getElementsByName('payment_method');
    const submitBtn = document.querySelector('.checkout__submit-btn');

    const shippingPrices = {
        "shr_1T6BpcJdC0N7uBdkHIPwzJUj": 75,
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

    // Mazání chyb při psaní (v reálném čase)
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            emailInput.style.borderColor = '';
            const err = document.getElementById('email-error');
            if (err) err.style.display = 'none';
        });
    }
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            phoneInput.style.borderColor = '';
            const err = document.getElementById('phone-error');
            if (err) err.style.display = 'none';
        });
    }

    // --- 2. VYKRESLENÍ SHRNUTÍ ---
    const renderSummary = () => {
        let itemsTotal = 0;
        let itemsHtml = cart.map(item => {
            itemsTotal += item.price * item.quantity;
            return `
                <div class="checkout-item" style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                    <div style="flex-grow: 1;">
                        <div style="font-weight: bold; font-size: 0.95em;">${item.name}</div>
                        <div style="font-size: 0.85em; color: #666;">${item.quantity}x - ${item.price * item.quantity} Kč</div>
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
            shippingPaymentHtml += `<div style="font-size: 0.9em; margin-bottom: 4px;"><strong>Doprava:</strong> ${shippingName} (${shippingTotal} Kč)</div>`;
        }

        if (selectedPayment) {
            const paymentLabel = selectedPayment.closest('.payment-card').querySelector('.payment-card__name').innerText;
            shippingPaymentHtml += `<div style="font-size: 0.9em; color: #555;"><strong>Platba:</strong> ${paymentLabel} (0 Kč)</div>`;
            if (submitBtn) {
                submitBtn.innerText = selectedPayment.value === 'card' ? 'Zaplatit kartou' : 'Potvrdit objednávku';
            }
        }

        if (shippingPaymentContainer) shippingPaymentContainer.innerHTML = shippingPaymentHtml;
        totalPriceElement.innerText = itemsTotal + shippingTotal;
    };

    // --- 3. LOGIKA DOPRAVY ---
    const handleLogicChange = () => {
        if (zasilkovnaSelector) zasilkovnaSelector.style.display = (pickupRadio && pickupRadio.checked) ? 'block' : 'none';
        if (personalRadio && personalRadio.checked) {
            cashOption.style.display = 'block';
        } else {
            if (cashOption) cashOption.style.display = 'none';
            const checkedPayment = document.querySelector('input[name="payment_method"]:checked');
            if (checkedPayment && checkedPayment.value === 'cash') {
                document.querySelector('input[value="card"]').checked = true;
            }
        }
        renderSummary();
    };

    shippingRadios.forEach(radio => radio.addEventListener('change', handleLogicChange));
    paymentRadios.forEach(radio => radio.addEventListener('change', renderSummary));
    renderSummary();
    handleLogicChange();

    // --- 4. ZÁSILKOVNA ---
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

    // --- 5. ODESLÁNÍ FORMULÁŘE ---
    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        let hasError = false;

        // Validace telefonu
        const phoneClean = data.phone.replace(/\s/g, '');
        if (phoneClean.length < 9) {
            showError('phone', 'phone-error', 'Zadejte prosím aspoň 9 číslic.');
            hasError = true;
        }
        // Validace e-mailu
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(data.email)) {
            showError('email', 'email-error', 'Zadejte platný e-mail (např. jmeno@seznam.cz).');
            hasError = true;
        }
        // Validace Zásilkovny
        if (pickupRadio && pickupRadio.checked && !data.zasilkovna_id) {
            alert("Prosím, vyberte pobočku Zásilkovny.");
            hasError = true;
        }

        if (hasError) return;

        // Příprava Variabilního symbolu
        const teď = new Date();
        const vs = teď.getFullYear().toString().slice(-2) + 
                   (teď.getMonth() + 1).toString().padStart(2, '0') + 
                   teď.getDate().toString().padStart(2, '0') + 
                   teď.getHours().toString().padStart(2, '0') + 
                   teď.getMinutes().toString().padStart(2, '0');

        // Překlady pro e-mail (bez diakritiky)
        const dopravaPreklad = {
            "shr_1T6BpcJdC0N7uBdkHIPwzJUj": "Zasilkovna - Vydejni misto",
            "shr_1T6BqAJdC0N7uBdkVBnfRr7E": "Zasilkovna - Domu",
            "shr_1T6CKnJdC0N7uBdkFiXUdiFe": "Osobni odber Sadska"
        };
        const platbaPreklad = {
            "card": "Platebni karta online",
            "transfer": "Bankovni prevod",
            "cash": "Hotove pri prevzeti"
        };

        formData.append('Variabilni_symbol', vs);
        formData.append('Zpusob_dopravy', dopravaPreklad[data.shipping_rate] || data.shipping_rate);
        formData.append('Zpusob_platby', platbaPreklad[data.payment_method] || data.payment_method);
        formData.append('Obsah_objednavky', cart.map(i => `${i.name} (${i.quantity}x)`).join(', '));
        formData.append('Celkova_cena', totalPriceElement.innerText + ' Kč');
        formData.append('metadata_ignore', 'shipping_rate,payment_method,zasilkovna_id,checkbox,template');

        // Rozcestník plateb
        if (data.payment_method === 'card') {
            try {
                const response = await fetch('/.netlify/functions/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart.map(i => ({ price: i.id, quantity: i.quantity })),
                        customer: data,
                        shipping_rate: data.shipping_rate,
                        metadata: { 
                            vs: vs, 
                            pobocka: pickupRadio.checked ? data.zasilkovna_name : (personalRadio.checked ? 'Osobni odber' : 'Adresa') 
                        }
                    })
                });
                const resData = await response.json();
                if (resData.url) window.location.href = resData.url;
            } catch (err) { alert("Chyba při startu platby kartou."); }
        } else {
            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    window.location.href = `/dekujeme/?vs=${vs}&amount=${totalPriceElement.innerText}&method=${data.payment_method}`;
                    localStorage.removeItem('pekseso_cart');
                } else { alert("Chyba při odesílání objednávky."); }
            } catch (err) { alert("Server neodpovídá."); }
        }
    });
});