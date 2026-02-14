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
    
    // Zavřít všechna submenu při zavření hlavního menu
    const openSubmenus = document.querySelectorAll(".header__nav-item--open");
    openSubmenus.forEach(item => item.classList.remove("header__nav-item--open"));
}

// Event Listeners
hamburgerBtn.addEventListener("click", toggleMenu);

// SUBMENU TOGGLE (jen na mobilu)
const itemsWithSubmenu = document.querySelectorAll(".header__nav-item:has(.header__nav-list-second)");

itemsWithSubmenu.forEach(item => {
    const link = item.querySelector(".header__nav-link");
    
    link.addEventListener("click", (e) => {
        // Jen na mobilu
        if (window.innerWidth <= 768) {
            e.preventDefault(); // Zabránit navigaci na desktop
            item.classList.toggle("header__nav-item--open");
        }
    });
});

// Zavření při kliknutí na odkaz v submenu
const submenuLinks = document.querySelectorAll(".header__nav-list-second .header__nav-link");
submenuLinks.forEach(link => {
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
    if (window.innerWidth > 768 && navigation.classList.contains("is-open")) {
        closeMenu();
    }
});

//E-mail
document.addEventListener('DOMContentLoaded', function() {
  const user = 'ahoj';
  const domain = 'pekseso.cz';
  const email = user + '@' + domain;
  
  const emailDisplay = document.getElementById('email-display');
  if (emailDisplay) {
    emailDisplay.innerHTML = 
      '<a href="mailto:' + email + '" class="contact__address-link">' + email + '</a>';
  }
  
  const emailFooter = document.getElementById('email-footer');
  if (emailFooter) {
    emailFooter.innerHTML = 
      '<a href="mailto:' + email + '" class="footer__contact-link">' + email + '</a>';
  }
});