// game.js
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024; // Set canvas width
canvas.height = 576; // Set canvas height

// Sprite class for handling animations
class Sprite {
    constructor({ position, imageSrc, scale = 1, framesMax = 1 }) {
        this.position = position;
        this.width = 50;
        this.height = 150;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5; // Animation speed
    }

    draw() {
        ctx.drawImage(
            this.image,
            this.framesCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x,
            this.position.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale
        );
    }

    animateFrames() {
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++;
            } else {
                this.framesCurrent = 0;
            }
        }
    }

    update() {
        this.draw();
        this.animateFrames();
    }
}

// Create soldier and orc sprites
const soldier = new Sprite({
    position: { x: 100, y: 300 },
    imageSrc: 'images/Soldier/Soldier_Idle.png',
    scale: 2,
    framesMax: 6, // Number of frames in the sprite sheet
});

const orc = new Sprite({
    position: { x: 700, y: 300 },
    imageSrc: 'images/Orc/Orc_Idle.png',
    scale: 2,
    framesMax: 6, // Number of frames in the sprite sheet
});

// Game variables
let currentQuestionIndex = 0;
let timeLeft = 30;
let timerInterval;
let wolfHealth = 3;

const questions = [
    { question: "2 + 6 = ?", answer: "8" },
    { question: "7 - 3 = ?", answer: "4" },
    { question: "5 * 4 = ?", answer: "20" },
    { question: "10 / 2 = ?", answer: "5" }
];

// Start the game
function startGame() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('gameplay-screen').style.display = 'block';
    loadQuestion();
    startTimer();
    animate();
}

// Load the current question
function loadQuestion() {
    const questionText = document.getElementById('question-text');
    questionText.textContent = questions[currentQuestionIndex].question;
}

// Handle answer submission
function submitAnswer() {
    const userAnswer = document.getElementById('answer-input').value;
    if (userAnswer === questions[currentQuestionIndex].answer) {
        wolfHealth--;
        if (wolfHealth > 0) {
            takeDamage();
        } else {
            retreat();
        }
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            endGame();
        }
    } else {
        startAttacking();
        setTimeout(startWalking, 1000);
    }
    document.getElementById('answer-input').value = '';
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time-left').textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// End the game
function endGame() {
    clearInterval(timerInterval);
    alert('Game over!');
    // Reset game state
    currentQuestionIndex = 0;
    timeLeft = 30;
    wolfHealth = 3;
    document.getElementById('time-left').textContent = timeLeft;
    document.querySelector('.container').style.display = 'block';
    document.getElementById('gameplay-screen').style.display = 'none';
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    soldier.update(); // Update soldier animation
    orc.update(); // Update orc animation
}

// Initialize the game
document.addEventListener("DOMContentLoaded", function () {
    startGame();
});