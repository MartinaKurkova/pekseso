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

    // Ceny dopravy odpovídající ID ve Stripe
    const shippingPrices = {
        "shr_1T6BpcJdC0N7uBdkHIPwzJUj": 75, // Zásilkovna výdejní místo
        "shr_1T6BqAJdC0N7uBdkVBnfRr7E": 99, // Zásilkovna domů
        "shr_1T6CKnJdC0N7uBdkFiXUdiFe": 0   // Osobní odběr
    };

    if (cart.length === 0) {
        window.location.href = '/'; 
        return;
    }

    // --- 1. FUNKCE PRO VYKRESLENÍ SHRNUTÍ ---
    const renderSummary = () => {
        let itemsTotal = 0;
        
        // Vykreslení produktů s obrázky
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

        // Vykreslení vybrané dopravy a platby
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
            shippingPaymentHtml += `<div style="font-size: 0.9em; color: #555;"><strong>Platba:</strong> ${paymentLabel}</div>`;
            
            // Dynamická změna textu na tlačítku
            if (submitBtn) {
                submitBtn.innerText = selectedPayment.value === 'card' ? 'Zaplatit kartou' : 'Potvrdit objednávku';
            }
        }

        if (shippingPaymentContainer) {
            shippingPaymentContainer.innerHTML = shippingPaymentHtml;
        }

        // Celková cena
        totalPriceElement.innerText = itemsTotal + shippingTotal;
    };

    // --- 2. LOGIKA PŘEPÍNÁNÍ DOPRAVY (Zásilkovna / Hotovost) ---
    const handleLogicChange = () => {
        // Zobrazit/skrýt výběr pobočky Zásilkovny
        if (zasilkovnaSelector) {
            zasilkovnaSelector.style.display = (pickupRadio && pickupRadio.checked) ? 'block' : 'none';
        }
        
        // Zobrazení platby hotově (jen u osobního odběru)
        if (personalRadio && personalRadio.checked) {
            cashOption.style.display = 'block';
        } else {
            if (cashOption) cashOption.style.display = 'none';
            // Pokud byla vybraná hotovost a přepneme na jinou dopravu, vrátíme platbu na kartu
            const checkedPayment = document.querySelector('input[name="payment_method"]:checked');
            if (checkedPayment && checkedPayment.value === 'cash') {
                document.querySelector('input[value="card"]').checked = true;
            }
        }
        renderSummary();
    };

    // --- 3. POSLUCHAČE ZMĚN ---
    shippingRadios.forEach(radio => radio.addEventListener('change', handleLogicChange));
    paymentRadios.forEach(radio => radio.addEventListener('change', renderSummary));

    // Inicializace při načtení
    renderSummary();
    handleLogicChange();

    // --- 4. ZÁSILKOVNA WIDGET ---
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
        const formData = new FormData(e.target);
        
        // Přidání dat o obsahu košíku pro e-mail z Web3Forms
        const cartSummary = cart.map(i => `${i.name} (${i.quantity}x)`).join(', ');
        formData.append('objednavka_obsah', cartSummary);
        formData.append('celkova_cena_k_uhrade', totalPriceElement.innerText + ' Kč');

        const data = Object.fromEntries(formData.entries());

        // Validace Zásilkovny
        if (pickupRadio && pickupRadio.checked && !data.zasilkovna_id) {
            alert("Prosím, vyberte pobočku Zásilkovny přes tlačítko.");
            return;
        }

        // A) PLATBA KARTOU -> Jde přes Stripe (Netlify Function)
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
                            pobocka: pickupRadio.checked ? data.zasilkovna_name : (personalRadio.checked ? 'Osobní odběr Sadská' : 'Doručení na adresu') 
                        }
                    })
                });
                const resData = await response.json();
                if (resData.url) {
                    window.location.href = resData.url; 
                } else {
                    throw new Error(resData.error || "Chyba brány");
                }
            } catch (err) {
                alert("Nepodařilo se spustit platbu kartou. Zkuste to prosím znovu.");
                console.error(err);
            }
        } 
        // B) PŘEVOD NEBO HOTOVOST -> Jde přes Web3Forms (E-mail)
        else {
            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert("Objednávka byla úspěšně přijata! Instrukce k platbě vám zašleme na e-mail.");
                    localStorage.removeItem('pekseso_cart');
                    window.location.href = '/dekujeme/';
                } else {
                    alert("Chyba při odesílání objednávky. Zkuste to prosím později.");
                }
            } catch (err) {
                alert("Omlouváme se, server pro odeslání objednávek je momentálně nedostupný.");
            }
        }
    });
});