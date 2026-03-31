document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('pekseso_cart')) || [];
    const summaryContainer = document.getElementById('checkout__summary-items');
    const totalPriceElement = document.getElementById('checkout-total-price');
    const shippingPaymentContainer = document.getElementById('checkout__summary-shipping-payment');
    
    // Zásilkovna prvky
    const zasilkovnaBtn = document.getElementById('zasilkovna-btn');
    const zasilkovnaSelector = document.getElementById('zasilkovna-selector');
    const branchText = document.getElementById('selected-branch');
    const zasilkovnaInfoBox = document.getElementById('zasilkovna-info-box');
    const pickupRadio = document.getElementById('delivery-pickup');

    // Balíkovna prvky
    const balikovnaRadio = document.getElementById('delivery-balikovna');
    const balikovnaSelector = document.getElementById('balikovna-selector');
    const balikovnaIframe = document.getElementById('balikovna-iframe');
    const balikovnaInfoText = document.getElementById('selected-balikovna-info');
    const balikovnaInfoBox = document.getElementById('balikovna-info-box');
    const balikovnaModal = document.getElementById('balikovna-modal');
    const balikovnaOpenBtn = document.getElementById('balikovna-open-btn');
    const balikovnaCloseBtn = document.getElementById('close-balikovna');

    const personalRadio = document.getElementById('delivery-personaly');
    const cashOption = document.getElementById('payment-cash-option');
    const shippingRadios = document.getElementsByName('shipping_rate');
    const paymentRadios = document.getElementsByName('payment_method');
    const submitBtn = document.querySelector('.checkout__submit-btn');

    const shippingPrices = {
        "shr_1T6BpcJdC0N7uBdkHIPwzJUj": 75, // Zásilkovna
        "shr_1TGh3LJdC0N7uBdkLyfGt4eu": 75, // Balíkovna
        "shr_1T6BqAJdC0N7uBdkVBnfRr7E": 99,
        "shr_1T6CKnJdC0N7uBdkFiXUdiFe": 0
    };

    if (cart.length === 0) {
        window.location.href = '/';
        return;
    }

    // --- 1. POMOCNÉ FUNKCE ---
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
        if (zasilkovnaSelector) zasilkovnaSelector.style.display = (pickupRadio && pickupRadio.checked) ? 'block' : 'none';
        if (balikovnaSelector) balikovnaSelector.style.display = (balikovnaRadio && balikovnaRadio.checked) ? 'block' : 'none';

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
    // --- 4. ZÁSILKOVNA EVENT ---
    // --- 4. ZÁSILKOVNA EVENT ---
    // --- 4. ZÁSILKOVNA EVENT ---
    if (zasilkovnaBtn) {
        zasilkovnaBtn.addEventListener('click', () => {
            Packeta.Widget.pick('39e581085dd78c93', (point) => {
                if (point) {
                    // 1. Uložíme čistá data do skrytých polí pro odeslání
                    document.getElementById('zasilkovna-id').value = point.id;
                    document.getElementById('zasilkovna-name').value = point.name;
                    
                    // 2. Příprava textu pro zobrazení (odstranění duplicit)
                    if (branchText) {
                        const name = point.name || "";
                        const street = point.street || "";
                        const city = point.city || "";
                        
                        let displayInfo = "";

                        // Pokud název už obsahuje ulici (časté u Z-BOXů), nepíšeme ulici znovu
                        if (name.includes(street)) {
                            displayInfo = `${name}, ${city}`;
                        } else {
                            displayInfo = `${name}, ${street}, ${city}`;
                        }

                        branchText.innerText = displayInfo;
                    }

                    // 3. Zobrazení šedého boxu
                    if (zasilkovnaInfoBox) {
                        zasilkovnaInfoBox.style.display = 'block';
                    }
                    
                    renderSummary();
                }
            }, { country: 'cz', language: 'cs' });
        });
    }

 // --- 5. BALÍKOVNA EVENTS ---
    if (balikovnaOpenBtn) {
        balikovnaOpenBtn.addEventListener('click', () => {
            balikovnaModal.style.display = 'flex';
            if (!balikovnaIframe.src.includes("cpost.cz")) {
                balikovnaIframe.src = "https://b2c.cpost.cz/locations/?type=BALIKOVNY";
            }
        });
    }

    if (balikovnaCloseBtn) {
        balikovnaCloseBtn.addEventListener('click', () => { balikovnaModal.style.display = 'none'; });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === balikovnaModal) balikovnaModal.style.display = 'none';
    });

    // Příjem dat z Balíkovny (postMessage)
    window.addEventListener('message', (event) => {
        if (event.data.message === 'pickerResult' && event.data.point) {
            const point = event.data.point;
            
            // Vytvoříme kompletní název včetně adresy
            const kompletniNazev = `${point.name}, ${point.address}`;
            
            // Uložíme ID
            document.getElementById('balikovna-id').value = point.id;
            
            // OPRAVA: Do balikovna-name uložíme CELÝ řetězec, 
            // aby se v e-mailu objevila i ulice a město.
            document.getElementById('balikovna-name').value = kompletniNazev;
            
            if (balikovnaInfoText && balikovnaInfoBox) {
                balikovnaInfoText.innerText = kompletniNazev;
                balikovnaInfoBox.style.display = 'block';
            }
            
            balikovnaModal.style.display = 'none';
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
    // --- 7. ODESLÁNÍ FORMULÁŘE ---
    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        let hasError = false;

        // ... (validace adresy a poboček - ponech ji tak, jak ji máš) ...

        if (hasError) return;

        // 1. Získání hezkého názvu dopravy
        let dopravceNazev = "Doprava";
        const vybranyRadio = document.querySelector('input[name="shipping_rate"]:checked');
        if (vybranyRadio) {
            dopravceNazev = vybranyRadio.closest('.shipping-card').querySelector('.shipping-card__name').innerText;
        }

        // 2. Identifikace pobočky
        let vybranaPobocka = 'Adresa';
        if (pickupRadio && pickupRadio.checked) vybranaPobocka = `Zásilkovna: ${data.zasilkovna_name}`;
        if (balikovnaRadio && balikovnaRadio.checked) vybranaPobocka = `Balíkovna: ${data.balikovna_name}`;
        if (personalRadio && personalRadio.checked) vybranaPobocka = 'Osobní odběr';

        const teď = new Date();
        const vs = teď.getFullYear().toString().slice(-2) + (teď.getMonth() + 1).toString().padStart(2, '0') + teď.getDate().toString().padStart(2, '0') + teď.getHours().toString().padStart(2, '0') + teď.getMinutes().toString().padStart(2, '0');

        // 3. Sestavení finálního balíčku dat
        const orderPayload = {
            ...data,
            cart: cart,
            vs: vs,
            totalPrice: totalPriceElement.innerText,
            shipping_rate: dopravceNazev, // Přepíšeme technické ID hezkým názvem
            pobocka_metadata: vybranaPobocka // Tato proměnná MUSÍ být v šabloně e-mailu
        };

        if (data.payment_method === 'card') {
            // ... (logika pro Stripe/Card zůstává stejná) ...
            try {
                const response = await fetch('/.netlify/functions/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart.map(i => ({ price: i.id, quantity: i.quantity })),
                        customer: data,
                        shipping_rate: data.shipping_rate,
                        metadata: { vs: vs, pobocka: vybranaPobocka, doprava: dopravceNazev }
                    })
                });
                const resData = await response.json();
                if (resData.url) window.location.href = resData.url;
            } catch (err) { alert("Chyba při startu platby kartou."); }
        } else {
            // PLATBA PŘEVODEM / HOTOVĚ (zde je potřeba poslat orderPayload)
            try {
                const response = await fetch('/.netlify/functions/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload) // Důležité: posíláme orderPayload, ne jen data
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