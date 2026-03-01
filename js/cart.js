// 1. NAČTENÍ DAT
let cart = JSON.parse(localStorage.getItem('pekseso_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    // Otevírání a zavírání panelu
    const cartBtn = document.getElementById('cart-btn');
    const closeBtn = document.getElementById('close__cart');
    const cartPanel = document.getElementById('cart__panel');
    const overlay = document.getElementById('cart__overlay');

    if (cartBtn && cartPanel) {
        cartBtn.addEventListener('click', () => {
            cartPanel.classList.add('is-active');
            if (overlay) overlay.classList.add('is-active');
        });
    }

    if (closeBtn && cartPanel) {
        closeBtn.addEventListener('click', () => {
            cartPanel.classList.remove('is-active');
            if (overlay) overlay.classList.remove('is-active');
        });
    }
});

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += product.quantity;
    } else {
        cart.push(product);
    }
    saveAndRefresh();
}

// 2. AKTUALIZACE PANELU (Tady jsou tvoje správné třídy)
function updateCartUI() {
    const cartBadge = document.querySelector('.header__basket-amount');
    const cartContent = document.querySelector('.cart__content'); // Opraveno na tvou třídu
    const totalPriceElement = document.querySelector('.cart__total-price--number'); // Tady přepíšeme jen to číslo

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) cartBadge.innerText = totalItems;

    if (cartContent) {
        cartContent.innerHTML = ''; // Smažeme ten statický testovací obsah

        if (cart.length === 0) {
            cartContent.innerHTML = '<p style="padding: 20px; text-align: center;">V košíku zatím nic není.</p>';
            if (totalPriceElement) totalPriceElement.innerText = '0';
            return;
        }

        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;

            // Používám přesně tvoji HTML strukturu pro položku
            cartContent.innerHTML += `
                <div class="cart__item">
                    <img src="${item.image}" alt="${item.name}" class="cart__image" width="400" height="400">
                    <div class="cart__details">
                        <h3 class="cart__subheading">${item.name}</h3>
                        <p class="cart__price">${item.price} Kč</p>
                    </div>
                    <div class="cart__quantity-wrapper">
                        <button class="cart__quantity-btn" onclick="changeCartQty(${index}, -1)">−</button>
                        <span class="cart__quantity-value">${item.quantity}</span>
                        <button class="cart__quantity-btn" onclick="changeCartQty(${index}, 1)">+</button>
                    </div>
                    <button class="cart__item-remove" onclick="removeFromCart(${index})" style="background:none; border:none; cursor:pointer; font-size: 20px; margin-left: 10px;">&times;</button>
                </div>
            `;
        });

        if (totalPriceElement) totalPriceElement.innerText = total;
    }
}

function changeCartQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        saveAndRefresh();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('pekseso_cart', JSON.stringify(cart));
    updateCartUI();
}


// klíč ze Stripe (začíná na pk_live_ nebo pk_test_)
const stripe = Stripe('pk_live_51T69CrJdC0N7uBdkPuW65kJsVcNnlUZs0J4OKMxZuE7nd7xpXO7sJyqdVWVlnNYHlzWLHl0YhSf8eVyGBC3Nssb9006jgrPdYK');

document.querySelector('.cart__checkout-btn')?.addEventListener('click', () => {
    if (cart.length === 0) return alert("Košík je prázdný!");
    // Přesměruje na naši novou stránku
    window.location.href = '/pokladna/';
});