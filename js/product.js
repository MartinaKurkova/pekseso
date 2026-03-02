{
    // Používáme blok {}, aby proměnné zůstaly uvnitř a nezpůsobovaly chybu "already declared"
    let currentImageIndex = 0;
    let images = [];
    const VISIBLE = 4;
    let thumbOffset = 0;
    let quantity = 1;

    // --- GALERIE ---

    function initGallery() {
        images = []; // Vždy vyčistit pole před načtením
        
        const mainImg = document.getElementById('mainImg');
        if (mainImg) {
            const fullSrc = mainImg.getAttribute('data-full') || mainImg.src;
            images.push(fullSrc);
        }
        
        const thumbnails = document.querySelectorAll('.product__thumbnail img');
        thumbnails.forEach((thumb, index) => {
            const fullSrc = thumb.getAttribute('data-full') || thumb.src;
            if (index > 0) {
                images.push(fullSrc);
            }
        });
        
        updateCarousel();
    }

    window.changeImage = function(index) {
        currentImageIndex = index;
        const mainImg = document.getElementById('mainImg');
        const thumbnails = document.querySelectorAll('.product__thumbnail img');
        
        if (mainImg && thumbnails[index]) {
            const thumbImg = thumbnails[index];
            mainImg.src = thumbImg.src;
            mainImg.srcset = thumbImg.srcset;
            mainImg.setAttribute('data-full', thumbImg.getAttribute('data-full'));
            mainImg.alt = thumbImg.alt;
        }
        
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
        currentImageIndex = index;
        let lightbox = document.getElementById('productLightbox');
        if (!lightbox) {
            lightbox = createLightbox();
            document.body.appendChild(lightbox);
        }
        const lightboxImg = document.getElementById('lightboxImg');
        if (lightboxImg && images[index]) {
            lightboxImg.src = images[index];
        }
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.id = 'productLightbox';
        lightbox.className = 'lightbox';
        lightbox.onclick = closeLightbox;
        lightbox.innerHTML = `
            <div class="lightbox__content">
                <button class="lightbox__close" onclick="closeLightbox(event)" aria-label="Zavřít">&times;</button>
                <button class="lightbox__nav lightbox__nav--prev" onclick="navigateLightbox(-1, event)" aria-label="Předchozí">‹</button>
                <img id="lightboxImg" src="" alt="Zvětšený obrázek" class="lightbox__image">
                <button class="lightbox__nav lightbox__nav--next" onclick="navigateLightbox(1, event)" aria-label="Další">›</button>
            </div>
        `;
        return lightbox;
    }

    window.closeLightbox = function(event) {
        const lightbox = document.getElementById('productLightbox');
        if (!event || event.target.id === 'productLightbox' || event.target.classList.contains('lightbox__close')) {
            if (lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    }

    window.navigateLightbox = function(direction, event) {
        if (event) event.stopPropagation();
        currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
        const lightboxImg = document.getElementById('lightboxImg');
        if (lightboxImg) lightboxImg.src = images[currentImageIndex];
    }

    // --- QUANTITY & BUY ---

    window.changeQty = function(delta) {
        quantity = Math.min(20, Math.max(1, quantity + delta));
        const display = document.getElementById('qty-display');
        if (display) display.textContent = quantity;
        
        const btnMinus = document.getElementById('btn-minus');
        const btnPlus = document.getElementById('btn-plus');
        if (btnMinus) btnMinus.disabled = quantity <= 1;
        if (btnPlus) btnPlus.disabled = quantity >= 10;
    }

    document.getElementById('btnBuy')?.addEventListener('click', function() {
        const product = {
            id: this.dataset.id, 
            name: this.dataset.name,
            price: parseInt(this.dataset.price),
            image: this.dataset.image,
            quantity: quantity
        };

        if (typeof addToCart === 'function') {
            addToCart(product);
            if (typeof added === 'function') added(); // Toast
            
            // Reset quantity po nákupu
            quantity = 1;
            changeQty(0);
        } else {
            console.error("Chyba: cart.js není načten!");
        }
    });

    // --- TOAST NOTIFIKACE ---
    window.added = function() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('show');
            
            // Po 3 vteřinách ho schováme
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    };

    // --- INICIALIZACE ---

    document.addEventListener('DOMContentLoaded', initGallery);
    window.addEventListener('resize', updateCarousel);
    
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('productLightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        }
    });
}