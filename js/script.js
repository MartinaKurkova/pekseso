const hamburgerBtn = document.querySelector(".header__menu-toggle");
const navigation = document.querySelector(".header__navigation");
const body = document.body;

function toggleMenu() {
    const isOpen = navigation.classList.contains("is-open");
    
    if (isOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}

function openMenu() {
    hamburgerBtn.classList.add("is-active");
    navigation.classList.add("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    hamburgerBtn.setAttribute("aria-label", "Zavřít navigaci");
    body.classList.add("no-scroll");
}

function closeMenu() {
    hamburgerBtn.classList.remove("is-active");
    navigation.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    hamburgerBtn.setAttribute("aria-label", "Otevřít navigaci");
    body.classList.remove("no-scroll");
}

// Event Listeners
hamburgerBtn.addEventListener("click", toggleMenu);

// Zavření při kliknutí na odkaz
const navLinks = document.querySelectorAll(".header__nav-link");
navLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
});

// Zavření při kliknutí mimo menu (na overlay)
document.addEventListener("click", (e) => {
    if (navigation.classList.contains("is-open") && 
        !e.target.closest(".header__nav-list") && 
        !e.target.closest(".header__menu-toggle")) {
        closeMenu();
    }
});

// ESC klávesa
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navigation.classList.contains("is-open")) {
        closeMenu();
        hamburgerBtn.focus();
    }
});

// Resize check
window.addEventListener("resize", () => {
    if (window.innerWidth > 950 && navigation.classList.contains("is-open")) {
        closeMenu();
    }
});