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
            shippingPaymentHtml += `<div style="font-size: 0.9em; color: #555;"><strong>Platba:</strong> ${paymentLabel}</div>`;
            if (submitBtn) {
                submitBtn.innerText = selectedPayment.value === 'card' ? 'Zaplatit kartou' : 'Potvrdit objednávku';
            }
        }

        if (shippingPaymentContainer) shippingPaymentContainer.innerHTML = shippingPaymentHtml;
        totalPriceElement.innerText = itemsTotal + shippingTotal;
    };

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

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const teď = new Date();
        const vs = teď.getFullYear().toString().slice(-2) + 
                   (teď.getMonth() + 1).toString().padStart(2, '0') + 
                   teď.getDate().toString().padStart(2, '0') + 
                   teď.getHours().toString().padStart(2, '0') + 
                   teď.getMinutes().toString().padStart(2, '0');

        formData.append('variabilni_symbol', vs);
        const cartSummary = cart.map(i => `${i.name} (${i.quantity}x)`).join(', ');
        formData.append('objednavka_obsah', cartSummary);
        formData.append('celkova_cena_k_uhrade', totalPriceElement.innerText + ' Kč');

        const data = Object.fromEntries(formData.entries());

        if (pickupRadio && pickupRadio.checked && !data.zasilkovna_id) {
            alert("Prosím, vyberte pobočku Zásilkovny.");
            return;
        }

        if (data.payment_method === 'card') {
            try {
                const response = await fetch('/.netlify/functions/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart.map(i => ({ price: i.id, quantity: i.quantity })),
                        customer: data,
                        shipping_rate: data.shipping_rate,
                        metadata: { vs: vs, pobocka: pickupRadio.checked ? data.zasilkovna_name : (personalRadio.checked ? 'Osobní odběr' : 'Adresa') }
                    })
                });
                const resData = await response.json();
                if (resData.url) window.location.href = resData.url;
            } catch (err) { alert("Chyba při startu platby."); }
        } else {
            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    const celkem = totalPriceElement.innerText;
                    // Tady předáváme i metodu (transfer/cash)
                    window.location.href = `/dekujeme/?vs=${vs}&amount=${celkem}&method=${data.payment_method}`;
                    localStorage.removeItem('pekseso_cart');
                } else { alert("Chyba při odesílání."); }
            } catch (err) { alert("Server neodpovídá."); }
        }
    });
});