// Pexeso pro jednoho hráče - Psi
// Automatické zamíchání, počítání tahů a času

// === PROMĚNNÉ ===
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let timerInterval = null;
let seconds = 0;
let minutes = 0;
let gameStarted = false;

// === ELEMENTY ===
const cards = document.querySelectorAll('.game__card');
const movesDisplay = document.querySelector('.game__moves');
const timerDisplay = document.querySelector('.game__counter');
const playAgainBtn = document.querySelector('.game__again');

// === INICIALIZACE HRY ===
function initGame() {
    // Zamíchání karet
    shuffleCards();
    
    // Přidání event listenerů na karty
    cards.forEach(card => {
        card.addEventListener('click', flipCard);
    });
    
    // Tlačítko hrát znovu
    playAgainBtn.addEventListener('click', resetGame);
    
    // Reset hodnot
    moves = 0;
    matchedPairs = 0;
    seconds = 0;
    minutes = 0;
    gameStarted = false;
    updateMovesDisplay();
    updateTimerDisplay();
}

// === ZAMÍCHÁNÍ KARET ===
function shuffleCards() {
    const gameGrid = document.querySelector('.game__grid');
    const cardsArray = Array.from(cards);
    
    // Fisher-Yates shuffle algoritmus
    for (let i = cardsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardsArray[i], cardsArray[j]] = [cardsArray[j], cardsArray[i]];
    }
    
    // Přidání karet zpět do gridu v novém pořadí
    cardsArray.forEach(card => gameGrid.appendChild(card));
}

// === OTOČENÍ KARTY ===
function flipCard() {
    // Kontroly - nelze otočit kartu pokud:
    if (lockBoard) return; // je zamčená hra
    if (this === firstCard) return; // je to stejná karta
    if (this.classList.contains('game__card--flipped')) return; // je už otočená
    
    // Spuštění časovače při prvním tahu
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // Otočení karty
    this.classList.add('game__card--flipped');
    
    // První nebo druhá karta?
    if (!firstCard) {
        // První karta
        firstCard = this;
        return;
    }
    
    // Druhá karta
    secondCard = this;
    moves++;
    updateMovesDisplay();
    
    // Kontrola shody
    checkForMatch();
}

// === KONTROLA SHODY ===
function checkForMatch() {
    // Získání data-pair atributu z obrázků
    const firstPair = firstCard.querySelector('.game__image--front').dataset.pair;
    const secondPair = secondCard.querySelector('.game__image--front').dataset.pair;
    
    // Je to shoda?
    if (firstPair === secondPair) {
        disableCards();
        matchedPairs++;
        
        // Konec hry?
        if (matchedPairs === 9) { // 9 párů
            endGame();
        }
    } else {
        unflipCards();
    }
}

// === SPRÁVNÁ SHODA - DEAKTIVACE KARET ===
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    // Přidání třídy pro matched stav (můžeš použít pro CSS styling)
    firstCard.classList.add('game__card--matched');
    secondCard.classList.add('game__card--matched');
    
    resetBoard();
}

// === ŠPATNÁ SHODA - OTOČENÍ ZPĚT ===
function unflipCards() {
    lockBoard = true;
    
    setTimeout(() => {
        firstCard.classList.remove('game__card--flipped');
        secondCard.classList.remove('game__card--flipped');
        resetBoard();
    }, 1000); // 1 sekunda na zapamatování
}

// === RESET PROMĚNNÝCH PRO DALŠÍ TAH ===
function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

// === ČASOVAČ ===
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            minutes++;
            seconds = 0;
        }
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimerDisplay() {
    const displayMinutes = minutes.toString().padStart(2, '0');
    const displaySeconds = seconds.toString().padStart(2, '0');
    timerDisplay.textContent = `Čas: ${displayMinutes}:${displaySeconds}`;
}

// === AKTUALIZACE POČTU TAHŮ ===
function updateMovesDisplay() {
    movesDisplay.textContent = `Počet tahů: ${moves}`;
}

// === KONEC HRY ===
function endGame() {
    stopTimer();
    
    setTimeout(() => {
        alert(`🎉 Gratulujeme! 🎉\n\nDokončil jsi hru!\n\nPočet tahů: ${moves}\nČas: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 500);
}

// === RESTART HRY ===
function resetGame(e) {
    e.preventDefault();
    
    // Stop časovače
    stopTimer();
    
    // Reset všech karet
    cards.forEach(card => {
        card.classList.remove('game__card--flipped', 'game__card--matched');
        card.addEventListener('click', flipCard);
    });
    
    // Reset proměnných
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matchedPairs = 0;
    seconds = 0;
    minutes = 0;
    gameStarted = false;
    
    // Aktualizace zobrazení
    updateMovesDisplay();
    updateTimerDisplay();
    
    // Nové zamíchání
    shuffleCards();
}

// === SPUŠTĚNÍ HRY PŘI NAČTENÍ STRÁNKY ===
document.addEventListener('DOMContentLoaded', initGame);