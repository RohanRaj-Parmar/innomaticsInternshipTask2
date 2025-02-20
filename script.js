const categories = {
    fruits: ['🍎', '🍌', '🍇', '🍓', '🍍', '🥭', '🥝', '🍊'],
    emojis: ['😀', '😂', '😍', '🤓', '😎', '🥳', '😴', '🤯'],
    animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨'],
    planets: ['🪐', '🌍', '🌙', '☀️', '⭐', '🌕', '🌗', '🌘'],
    flags: ['🇺🇳', '🇺🇸', '🇯🇵', '🇧🇷', '🇮🇳', '🇷🇺', '🇫🇷', '🇬🇧']
};

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let score = 0;
let matches = 0;
let timer;
let timeLeft = 30;
let currentCategory;

function startGame(category) {
    currentCategory = category;
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    resetGame();
    createBoard();
    startTimer();
}

function createBoard() {
    const grid = document.getElementById('card-grid');
    grid.innerHTML = '';
    const items = [...categories[currentCategory], ...categories[currentCategory]];
    const shuffledItems = items.sort(() => Math.random() - 0.5);
    
    shuffledItems.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `<span class="hidden">${item}</span>`;
        card.addEventListener('click', handleCardClick);
        grid.appendChild(card);
    });
}

function handleCardClick(e) {
    if (lockBoard) return;
    const card = e.target;
    if (card === firstCard) return;

    card.classList.add('flipped');
    card.querySelector('span').classList.remove('hidden');

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lockBoard = true;

    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.innerText === secondCard.innerText;
    
    if (isMatch) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        score += 10;
        matches++;
        updateScore();
        resetBoard();

        if (matches === 8) {
            endGame(true);
        }
    } else {
        playSound('flip-sound'); // Sound plays only on wrong match
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            firstCard.querySelector('span').classList.add('hidden');
            secondCard.querySelector('span').classList.add('hidden');
            resetBoard();
        }, 1000);
    }
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function endGame(won) {
    clearInterval(timer);
    playSound(won ? 'match-sound' : 'game-over-sound'); // Different sounds for win vs lose
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
    
    const result = document.getElementById('game-result');
    const finalScore = document.getElementById('final-score');
    result.textContent = won ? 'You Won!' : 'Game Over!';
    finalScore.textContent = score;
    
    saveGameState();
}

function resetGame() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
    score = 0;
    matches = 0;
    timeLeft = 30;
    updateScore();
    document.getElementById('timer').textContent = timeLeft;
    clearInterval(timer);
}

function restartGame() {
    resetGame();
    createBoard();
    startTimer();
}

function showLandingPage() {
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('landing-page').classList.remove('hidden');
}

function playSound(id) {
    const sound = document.getElementById(id);
    sound.currentTime = 0;
    sound.play();
}

function saveGameState() {
    const gameState = {
        category: currentCategory,
        score: score,
        matches: matches,
        timeLeft: timeLeft
    };
    localStorage.setItem('memoryGameState', JSON.stringify(gameState));
}

// Check for saved game on load
window.onload = () => {
    const savedState = localStorage.getItem('memoryGameState');
    if (savedState) {
        const state = JSON.parse(savedState);
        if (state.timeLeft > 0 && state.matches < 8) {
            startGame(state.category);
            score = state.score;
            matches = state.matches;
            timeLeft = state.timeLeft;
            updateScore();
        }
    }
};