// PVP Game System for Math Challenge
// This script handles 1v1 matchmaking and gameplay

// Socket connection for real-time communication
let socket;
let inQueue = false;
let currentGame = null;
let playerHealth = 10;
let opponentHealth = 10;
let currentQuestion = null;
let gameMode = '1v1'; // Default to 1v1 mode

// Connect to the server when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load the socket.io client library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
    script.onload = initializeSocket;
    document.head.appendChild(script);
    
    // Setup UI event listeners
    setupEventListeners();
});

function initializeSocket() {
    // Connect to the same host that served the page
    socket = io();
    
    // Setup socket event listeners
    socket.on('connect', () => {
        console.log('Connected to server');
        updateStatus('Connected to server');
    });
    
    socket.on('matchFound', handleMatchFound);
    socket.on('questionUpdate', handleQuestionUpdate);
    socket.on('opponentAnswer', handleOpponentAnswer);
    socket.on('gameOver', handleGameOver);
    socket.on('opponentDisconnect', handleOpponentDisconnect);
}

function setupEventListeners() {
    // These functions are already defined in the HTML
    // We're just ensuring they have the proper implementation
    window.goToPlay = () => {
        document.getElementById('homepage').classList.add('hidden');
        document.getElementById('play-mode').classList.remove('hidden');
    };
    
    window.goBack = () => {
        document.getElementById('play-mode').classList.add('hidden');
        document.getElementById('homepage').classList.remove('hidden');
        leaveQueue();
    };
    
    window.goBackToMode = () => {
        document.getElementById('game-1v1').classList.add('hidden');
        document.getElementById('game-3v3').classList.add('hidden');
        document.getElementById('play-mode').classList.remove('hidden');
        endGame();
    };
    
    window.start1v1 = () => {
        gameMode = '1v1';
        joinQueue();
    };
    
    window.start3v3 = () => {
        gameMode = '3v3';
        // For now, we'll just implement 1v1 mode
        alert('3v3 mode is not implemented yet');
    };
    
    window.checkAnswer1v1 = (answer) => {
        submitAnswer(answer);
    };
}

// Matchmaking functions
function joinQueue() {
    if (!socket || inQueue) return;
    
    inQueue = true;
    socket.emit('joinQueue', { mode: gameMode });
    updateStatus('Joining queue for ' + gameMode + '...');
    
    // Show loading/waiting UI
    document.getElementById('play-mode').innerHTML = `
        <h2>Finding Opponent...</h2>
        <div class="loader"></div>
        <button onclick="leaveQueue()">Cancel</button>
    `;
}

function leaveQueue() {
    if (!socket || !inQueue) return;
    
    socket.emit('leaveQueue');
    inQueue = false;
    updateStatus('Left queue');
    
    // Restore the play mode UI
    document.getElementById('play-mode').innerHTML = `
        <h2>Choose Your Mode</h2>
        <button onclick="start1v1()">1v1</button>
        <button onclick="start3v3()">3v3</button>
        <button onclick="goBack()">Back</button>
    `;
}

// Game event handlers
function handleMatchFound(data) {
    inQueue = false;
    currentGame = data.gameId;
    updateStatus('Match found! Game starting...');
    
    // Show the game UI
    document.getElementById('play-mode').classList.add('hidden');
    document.getElementById('game-1v1').classList.remove('hidden');
    
    // Reset health bars
    playerHealth = 10;
    opponentHealth = 10;
    updateHealthBars();
}

function handleQuestionUpdate(data) {
    currentQuestion = data.question;
    
    // Update the question display
    const questionBox = document.querySelector('.question-box');
    questionBox.textContent = data.question.question;
    
    // Create answer buttons
    const answerButtons = document.querySelector('.answer-buttons');
    answerButtons.innerHTML = ''; // Clear previous buttons
    
    data.question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => submitAnswer(option);
        answerButtons.appendChild(button);
    });
    
    // Start or reset the timer
    startTimer(10); // 10 second timer for each question
}

function handleOpponentAnswer(data) {
    if (data.correct) {
        // Opponent answered correctly, reduce player health
        playerHealth--;
        
        // Show attack animation
        showAttackAnimation('opponent');
        
        if (playerHealth <= 0) {
            // Player lost
            socket.emit('gameOver', { winner: false });
            endGame('lose');
        } else {
            updateHealthBars();
        }
    }
}

function handleGameOver(data) {
    const result = data.winner ? 'win' : 'lose';
    endGame(result);
}

function handleOpponentDisconnect() {
    updateStatus('Opponent disconnected. You win!');
    endGame('win');
}

// Game mechanics
function submitAnswer(answer) {
    if (!currentQuestion || !currentGame) return;
    
    const isCorrect = answer === currentQuestion.correct;
    socket.emit('submitAnswer', {
        gameId: currentGame,
        answer: answer,
        correct: isCorrect
    });
    
    if (isCorrect) {
        // Player answered correctly, reduce opponent health
        opponentHealth--;
        
        // Show attack animation
        showAttackAnimation('player');
        
        if (opponentHealth <= 0) {
            // Player won
            socket.emit('gameOver', { winner: true });
            endGame('win');
        } else {
            updateHealthBars();
        }
    }
}

function updateHealthBars() {
    const playerHealthBar = document.querySelector('.player-health .health-fill');
    const enemyHealthBar = document.querySelector('.enemy-health .health-fill');
    
    playerHealthBar.style.width = (playerHealth / 10 * 100) + '%';
    enemyHealthBar.style.width = (opponentHealth / 10 * 100) + '%';
}

function showAttackAnimation(attacker) {
    const attackerElement = document.querySelector(`.character.${attacker}`);
    attackerElement.classList.add('attack');
    
    setTimeout(() => {
        attackerElement.classList.remove('attack');
    }, 500);
}

function startTimer(seconds) {
    const timerElement = document.getElementById('timer');
    let timeLeft = seconds;
    
    // Clear any existing timer
    if (window.gameTimer) {
        clearInterval(window.gameTimer);
    }
    
    // Update timer display and start countdown
    timerElement.textContent = `Time: ${timeLeft}s`;
    
    window.gameTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}s`;
        
        if (timeLeft <= 0) {
            clearInterval(window.gameTimer);
            // Time's up, opponent gets a free hit
            socket.emit('timeUp', { gameId: currentGame });
        }
    }, 1000);
}

function endGame(result) {
    // Clear any ongoing game state
    currentGame = null;
    clearInterval(window.gameTimer);
    
    // Show game result
    const gameUI = document.getElementById('game-1v1');
    
    if (result) {
        const resultMessage = result === 'win' ? 'You Won!' : 'You Lost!';
        gameUI.innerHTML += `
            <div class="game-result">
                <h2>${resultMessage}</h2>
                <button onclick="goBackToMode()">Back to Menu</button>
            </div>
        `;
    }
}

function updateStatus(message) {
    console.log('Status: ' + message);
    // Could also update a status display in the UI if desired
}

// Helper function to get random questions from the available question sets
function getRandomQuestions(count = 10) {
    // Combine all question types
    const allQuestions = [
        ...additionQuestions,
        ...subtractionQuestions,
        ...multiplicationQuestions,
        ...divisionQuestions
    ];
    
    // Shuffle and pick the requested number
    return shuffleArray(allQuestions).slice(0, count);
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
