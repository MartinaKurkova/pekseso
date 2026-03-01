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
