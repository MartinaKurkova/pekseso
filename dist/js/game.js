// Pexeso pro jednoho hráče

// proměnné
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let timerInterval = null;
let seconds = 0;
let minutes = 0;
let gameStarted = false;

const cards = document.querySelectorAll('.game__card');
const movesDisplay = document.querySelector('.game__moves');
const timerDisplay = document.querySelector('.game__counter');
const playAgainBtn = document.querySelector('.game__again');
const modal = document.getElementById('gameModal');
const modalMoves = document.getElementById('modalMoves');
const modalTime = document.getElementById('modalTime');
const modalPlayAgainBtn = document.getElementById('modalPlayAgain');

// začátek hry
function initGame() {
    // zamíchání karet
    shuffleCards();
    
    // přidání posluchačů na karty
    cards.forEach(card => {
        card.addEventListener('click', flipCard);
    });
    
    // tlačítko hrát znovu
    playAgainBtn.addEventListener('click', resetGame);
    
    // tlačítko v modalu
    modalPlayAgainBtn.addEventListener('click', () => {
        closeModal();
        resetGame();
    });
    
    // zavření modalu kliknutím mimo
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // reset hodnot
    moves = 0;
    matchedPairs = 0;
    seconds = 0;
    minutes = 0;
    gameStarted = false;
    updateMovesDisplay();
    updateTimerDisplay();
}

// zamíchání karet
function shuffleCards() {
    const gameGrid = document.querySelector('.game__grid');
    const cardsArray = Array.from(cards);
    
    // Fisher-Yates shuffle algoritmus
    for (let i = cardsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardsArray[i], cardsArray[j]] = [cardsArray[j], cardsArray[i]];
    }
    
    // přidání karet zpět do gridu v novém pořadí
    cardsArray.forEach(card => gameGrid.appendChild(card));
}

// otočení karty
function flipCard() {
    // kontrola
    if (lockBoard) return; 
    if (this === firstCard) return; 
    if (this.classList.contains('game__card--flipped')) return;
    
    // časovaču
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // otočení karty
    this.classList.add('game__card--flipped');
    
    // porovnání karet
    if (!firstCard) {
        // první karta
        firstCard = this;
        return;
    }
    
    // druhá karta
    secondCard = this;
    moves++;
    updateMovesDisplay();
    
    // kontrola shody
    checkForMatch();
}

// kontrola shody karet
function checkForMatch() {
    const firstPair = firstCard.querySelector('.game__image--front').dataset.pair;
    const secondPair = secondCard.querySelector('.game__image--front').dataset.pair;
    
    if (firstPair === secondPair) {
        disableCards();
        matchedPairs++;

        if (matchedPairs === 12) { 
            endGame();
        }
    } else {
        unflipCards();
    }
}

// správná shoda
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    firstCard.classList.add('game__card--matched');
    secondCard.classList.add('game__card--matched');
    
    resetBoard();
}

// neshoda
function unflipCards() {
    lockBoard = true;
    
    setTimeout(() => {
        firstCard.classList.remove('game__card--flipped');
        secondCard.classList.remove('game__card--flipped');
        resetBoard();
    }, 1000);
}

// reset proměnných
function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

// časovač
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

// počty tahů
function updateMovesDisplay() {
    movesDisplay.textContent = `Počet tahů: ${moves}`;
}

// konec hry
function endGame() {
    stopTimer();
    
    setTimeout(() => {
        showModal();
    }, 500);
}

// modal
function showModal() {
    modalMoves.textContent = moves;
    modalTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    modal.classList.add('game__modal--show');
    document.body.style.overflow = 'hidden'; 
}

function closeModal() {
    modal.classList.remove('game__modal--show');
    document.body.style.overflow = ''; 
}

// restart hry
function resetGame(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    
    // stop časovače
    stopTimer();
    
    // reset všech karet
    cards.forEach(card => {
        card.classList.remove('game__card--flipped', 'game__card--matched');
        card.addEventListener('click', flipCard);
    });
    
    // reset proměnných
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matchedPairs = 0;
    seconds = 0;
    minutes = 0;
    gameStarted = false;
    
    // aktualizace zobrazení
    updateMovesDisplay();
    updateTimerDisplay();
    
    // nové zamíchání
    shuffleCards();
}

// spuštění hry při načtení stránky
document.addEventListener('DOMContentLoaded', initGame);