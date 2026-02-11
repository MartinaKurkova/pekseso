const hamburgerBtn = document.querySelector(".header__menu-toggle");
const navList = document.querySelector(".header__nav-list");
const body = document.body;

hamburgerBtn.addEventListener("click", () => {
    const isExpanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
    
    hamburgerBtn.setAttribute("aria-expanded", !isExpanded);
    hamburgerBtn.setAttribute("aria-label", !isExpanded ? "Zavřít navigaci" : "Otevřít navigaci");
    
    hamburgerBtn.classList.toggle("is-active");
    navList.classList.toggle("header__nav-list--visible");
    
    body.classList.toggle("no-scroll", !isExpanded);

});

const navLinks = document.querySelectorAll(".header__nav-link");
navLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".header__nav-list") && 
        !e.target.closest(".header__menu-toggle") && 
        navList.classList.contains("header__nav-list--visible")) {
        closeMenu();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navList.classList.contains("header__nav-list--visible")) {
        closeMenu();
        hamburgerBtn.focus();
    }
});

function closeMenu() {
    hamburgerBtn.classList.remove("is-active");
    navList.classList.remove("header__nav-list--visible");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    hamburgerBtn.setAttribute("aria-label", "Otevřít navigaci");
    body.classList.remove("no-scroll");
}

window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && navList.classList.contains("header__nav-list--visible")) {
        closeMenu();
    }
});