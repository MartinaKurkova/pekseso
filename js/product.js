// Univerzální galerie produktu
let currentImageIndex = 0;
let images = [];

// karusel
const VISIBLE = 4;
let thumbOffset = 0;

// inicializace galerie
function initGallery() {
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
    
    console.log('Načtené obrázky pro lightbox:', images);

    // Inicializace stavu šipek karuselu
    updateCarousel();
}

// změna hlavního pbrázku při kliknutí
function changeImage(index) {
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

// karusel posun thumbnailu

// posune karusel +-
function slideThumbs(dir) {
    const track = document.getElementById('thumbTrack');
    if (!track) return;

    const totalThumbs = track.children.length;
    thumbOffset = Math.max(0, Math.min(thumbOffset + dir, totalThumbs - VISIBLE));
    updateCarousel();
}

// přepočet pozice šipek
function updateCarousel() {
    const track = document.getElementById('thumbTrack');
    const arrowL = document.getElementById('thumbArrowLeft');
    const arrowR = document.getElementById('thumbArrowRight');
    if (!track) return;

    const totalThumbs = track.children.length;

    // Pokud je thumbů méně nebo stejně jako VISIBLE, šipky schovej úplně
    if (totalThumbs <= VISIBLE) {
        if (arrowL) arrowL.style.display = 'none';
        if (arrowR) arrowR.style.display = 'none';
        return;
    }

    // Posun tracku
    const thumbW = track.children[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 8;
    track.style.transform = `translateX(-${thumbOffset * (thumbW + gap)}px)`;

    // Stav šipek
    if (arrowL) arrowL.disabled = thumbOffset === 0;
    if (arrowR) arrowR.disabled = thumbOffset >= totalThumbs - VISIBLE;
}

window.addEventListener('resize', updateCarousel);

// otevření lightboxu
function openLightbox(index) {
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

// lightbox struktura
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

// zavření lightboxu
function closeLightbox(event) {
    const lightbox = document.getElementById('productLightbox');
    
    if (event.target.id === 'productLightbox' || 
        event.target.classList.contains('lightbox__close')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

/**
 * Navigace v lightboxu (předchozí/další obrázek)
 */
function navigateLightbox(direction, event) {
    event.stopPropagation();
    
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = images.length - 1;
    } else if (currentImageIndex >= images.length) {
        currentImageIndex = 0;
    }
    
    const lightboxImg = document.getElementById('lightboxImg');
    if (lightboxImg && images[currentImageIndex]) {
        lightboxImg.src = images[currentImageIndex];
    }
}

/**
 * Klávesové zkratky pro lightbox
 */
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('productLightbox');
    
    if (lightbox && lightbox.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeLightbox({target: {id: 'productLightbox'}});
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1, {stopPropagation: () => {}});
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1, {stopPropagation: () => {}});
        }
    }
});

/**
 * Inicializace po načtení stránky
 */
document.addEventListener('DOMContentLoaded', initGallery);



// quantity
let quantity = 1;
const min = 1;
const max = 20;

function changeQty(delta) {
    quantity = Math.min(max, Math.max(min, quantity + delta));
    document.getElementById('qty-display').textContent = quantity;
    document.getElementById('btn-minus').disabled = quantity <= min;
    document.getElementById('btn-plus').disabled = quantity >= max;
}

// Nastav počáteční stav tlačítek
changeQty(0);