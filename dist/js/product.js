{
    // Používáme let/const uvnitř bloku pro čistý scope
    window.currentImageIndex = 0; // Musí být globální pro onclick v HTML
    let images = [];
    const VISIBLE = 4;
    let thumbOffset = 0;
    let quantity = 1;

    // --- GALERIE ---

    function initGallery() {
        images = []; 
        // Načteme XL cesty ze všech náhledů do pole pro lightbox
        const thumbnails = document.querySelectorAll('.product__thumbnail img');
        thumbnails.forEach((thumb) => {
            const fullSrc = thumb.getAttribute('data-full');
            if (fullSrc) images.push(fullSrc);
        });
        
        updateCarousel();
    }

    window.changeImage = function(index) {
        window.currentImageIndex = index;
        const mainImg = document.getElementById('mainImg');
        const thumbnails = document.querySelectorAll('.product__thumbnail img');
        
        if (mainImg && thumbnails[index]) {
            const thumbImg = thumbnails[index];
            // Aktualizace hlavního náhledu
            mainImg.src = thumbImg.src;
            mainImg.srcset = ""; // Resetujeme srcset, aby prohlížeč vynutil nový src
            mainImg.setAttribute('data-full', thumbImg.getAttribute('data-full'));
            mainImg.alt = thumbImg.alt;
        }
        
        // Přepnutí aktivní třídy u náhledů
        const thumbnailContainers = document.querySelectorAll('.product__thumbnail');
        thumbnailContainers.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    window.slideThumbs = function(dir) {
        const track = document.getElementById('thumbTrack');
        if (!track) return;
        const totalThumbs = track.children.length;
        thumbOffset = Math.max(0, Math.min(thumbOffset + dir, totalThumbs - VISIBLE));
        updateCarousel();
    }

    function updateCarousel() {
        const track = document.getElementById('thumbTrack');
        const arrowL = document.getElementById('thumbArrowLeft');
        const arrowR = document.getElementById('thumbArrowRight');
        if (!track || track.children.length === 0) return;

        const totalThumbs = track.children.length;
        if (totalThumbs <= VISIBLE) {
            if (arrowL) arrowL.style.display = 'none';
            if (arrowR) arrowR.style.display = 'none';
            return;
        }

        const thumbW = track.children[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 8;
        track.style.transform = `translateX(-${thumbOffset * (thumbW + gap)}px)`;

        if (arrowL) arrowL.disabled = thumbOffset === 0;
        if (arrowR) arrowR.disabled = thumbOffset >= totalThumbs - VISIBLE;
    }

    // --- LIGHTBOX ---

    window.openLightbox = function(index) {
        window.currentImageIndex = index;
        let lightbox = document.getElementById('productLightbox');
        if (!lightbox) {
            lightbox = createLightbox();
            document.body.appendChild(lightbox);
        }
        const lightboxImg = document.getElementById('lightboxImg');
        if (lightboxImg && images[window.currentImageIndex]) {
            lightboxImg.src = images[window.currentImageIndex];
        }
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.id = 'productLightbox';
        lightbox.className = 'lightbox';
        // Zavření při kliknutí na pozadí
        lightbox.onclick = function(e) {
            if (e.target === lightbox) window.closeLightbox();
        };
        lightbox.innerHTML = `
            <div class="lightbox__content">
                <button class="lightbox__close" onclick="window.closeLightbox()" aria-label="Zavřít">&times;</button>
                <button class="lightbox__nav lightbox__nav--prev" onclick="window.navigateLightbox(-1, event)" aria-label="Předchozí">‹</button>
                <img id="lightboxImg" src="" alt="Zvětšený obrázek" class="lightbox__image">
                <button class="lightbox__nav lightbox__nav--next" onclick="window.navigateLightbox(1, event)" aria-label="Další">›</button>
            </div>
        `;
        return lightbox;
    }

    window.closeLightbox = function() {
        const lightbox = document.getElementById('productLightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    window.navigateLightbox = function(direction, event) {
        if (event) event.stopPropagation();
        window.currentImageIndex = (window.currentImageIndex + direction + images.length) % images.length;
        const lightboxImg = document.getElementById('lightboxImg');
        if (lightboxImg) lightboxImg.src = images[window.currentImageIndex];
    }

    // --- QUANTITY & BUY ---

    window.changeQty = function(delta) {
        quantity = Math.min(10, Math.max(1, quantity + delta));
        const display = document.getElementById('qty-display');
        if (display) display.textContent = quantity;
        
        const btnMinus = document.getElementById('btn-minus');
        if (btnMinus) btnMinus.disabled = quantity <= 1;
    }

    // Inicializace nákupního tlačítka
    const buyBtn = document.getElementById('btnBuy');
    if (buyBtn) {
        buyBtn.addEventListener('click', function() {
            const product = {
                id: this.dataset.id, 
                name: this.dataset.name,
                price: parseInt(this.dataset.price),
                image: this.dataset.image,
                quantity: quantity
            };

            if (typeof addToCart === 'function') {
                addToCart(product);
                window.added(); 
                quantity = 1;
                window.changeQty(0);
            } else {
                console.error("cart.js není načten!");
            }
        });
    }

    window.added = function() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    };

    // --- INICIALIZACE ---

    document.addEventListener('DOMContentLoaded', initGallery);
    window.addEventListener('resize', updateCarousel);
    
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('productLightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') window.closeLightbox();
            if (e.key === 'ArrowLeft') window.navigateLightbox(-1);
            if (e.key === 'ArrowRight') window.navigateLightbox(1);
        }
    });
}