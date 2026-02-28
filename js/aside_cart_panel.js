const cartBtn = document.querySelector(".header__basket");
const closeBtn = document.querySelector("#close__cart");
const cartPanel = document.querySelector("#cart__panel");
const overlay = document.querySelector("#cart__overlay");

// Otevřít
cartBtn.addEventListener("click", () => {
  cartPanel.classList.add("is-open");
  overlay.classList.add("is-active");
});

// Zavřít
const closeCart = () => {
  cartPanel.classList.remove("is-open");
  overlay.classList.remove("is-active");
};

closeBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);



// quantity
{
    let quantity = 1;
    const min = 1;
    const max = 20;

    function changeQty(delta) {
        quantity = Math.min(max, Math.max(min, quantity + delta));
        
        const display = document.getElementById('qty-display-aside');
        const btnMinus = document.getElementById('btn-minus-aside');
        const btnPlus = document.getElementById('btn-plus-aside');
        
        if (display) display.textContent = quantity;
        if (btnMinus) btnMinus.disabled = quantity <= min;
        if (btnPlus) btnPlus.disabled = quantity >= max;
    }

    changeQty(0);
}