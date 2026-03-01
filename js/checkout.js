document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('pekseso_cart')) || [];
    const summaryContainer = document.getElementById('checkout-summary-items');
    const totalPriceElement = document.getElementById('checkout-total-price');
    
    const zasilkovnaBtn = document.getElementById('zasilkovna-btn');
    const zasilkovnaSelector = document.getElementById('zasilkovna-selector');
    const branchText = document.getElementById('selected-branch');
    const pickupRadio = document.getElementById('delivery-pickup');
    const personalRadio = document.getElementById('delivery-personaly');
    const cashOption = document.getElementById('payment-cash-option');
    const shippingRadios = document.getElementsByName('shipping_rate');
    const paymentRadios = document.getElementsByName('payment_method');

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
        let html = cart.map(item => {
            itemsTotal += item.price * item.quantity;
            return `<div class="checkout-item">${item.name} (${item.quantity}x) - ${item.price * item.quantity} Kč</div>`;
        }).join('');

        const selectedRadio = document.querySelector('input[name="shipping_rate"]:checked');
        let shippingTotal = 0;

        if (selectedRadio) {
            shippingTotal = shippingPrices[selectedRadio.value] || 0;
            const shippingName = selectedRadio.closest('.shipping-card').querySelector('.shipping-card__name').innerText;
            html += `<div class="checkout-item--shipping" style="border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px;">
                        <em>${shippingName} ${shippingTotal} Kč</em>
                     </div>`;
        }

        summaryContainer.innerHTML = html;
        totalPriceElement.innerText = itemsTotal + shippingTotal;
    };

    const handleLogicChange = () => {
        // 1. Zobrazení Zásilkovna widgetu
        zasilkovnaSelector.style.display = (pickupRadio && pickupRadio.checked) ? 'block' : 'none';
        
        // 2. Zobrazení platby hotově (jen u osobního odběru)
        if (personalRadio && personalRadio.checked) {
            cashOption.style.display = 'block';
        } else {
            cashOption.style.display = 'none';
            // Pokud byla vybraná hotovost a přepneme dopravu, přepneme platbu zpět na kartu
            if (document.querySelector('input[name="payment_method"]:checked').value === 'cash') {
                document.querySelector('input[value="card"]').checked = true;
            }
        }
        renderSummary();
    };

    shippingRadios.forEach(radio => radio.addEventListener('change', handleLogicChange));
    renderSummary();
    handleLogicChange();

    if (zasilkovnaBtn) {
        zasilkovnaBtn.addEventListener('click', () => {
            Packeta.Widget.pick('39e581085dd78c93', (point) => {
                if (point) {
                    document.getElementById('zasilkovna-id').value = point.id;
                    document.getElementById('zasilkovna-name').value = point.name;
                    branchText.innerText = "Vybráno: " + point.name;
                }
            }, { country: 'cz', language: 'cs' });
        });
    }

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (pickupRadio.checked && !data.zasilkovna_id) {
            alert("Prosím, vyberte pobočku Zásilkovny.");
            return;
        }

        // Pokud je zvolena KARTA -> Jdeme do Stripe
        if (data.payment_method === 'card') {
            const response = await fetch('/.netlify/functions/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(i => ({ price: i.id, quantity: i.quantity })),
                    customer: data,
                    shipping_rate: data.shipping_rate,
                    metadata: { pobocka: pickupRadio.checked ? data.zasilkovna_name : (personalRadio.checked ? 'Osobní odběr Sadská' : 'Na adresu') }
                })
            });
            const resData = await response.json();
            if (resData.url) window.location.href = resData.url;
        } 
        // Pokud je PŘEVOD nebo HOTOVOST -> Stripe nepotřebujeme
        else {
            alert("Objednávka přijata! Instrukce k platbě převodem vám zašleme e-mailem.");
            // Tady by ideálně mělo následovat odeslání e-mailu tobě přes Netlify Forms
            localStorage.removeItem('pekseso_cart');
            window.location.href = '/dekujeme/';
        }
    });
});