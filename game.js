const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024; // Set canvas width
canvas.height = 576; // Set canvas height

// Sprite class for handling animations
class Sprite {
    constructor({ position, imageSrc, scale = 1, framesMax = 1, sprites }) {
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
        this.sprites = sprites; // Additional sprites (e.g., idle, takeHit, death)
        this.dead = false; // Track if the sprite is dead

        // Preload all additional sprites
        if (this.sprites) {
            for (const key in this.sprites) {
                const sprite = this.sprites[key];
                sprite.image = new Image();
                sprite.image.src = sprite.imageSrc;
            }
        }
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
                if (this.dead) return; // Stop animation if dead
                this.framesCurrent = 0;
            }
        }
    }

    update() {
        this.draw();
        this.animateFrames();
    }

    // Play hit animation then reset to idle after a short delay
    takeHit() {
        if (this.sprites?.takeHit) {
            this.image = this.sprites.takeHit.image;
            this.framesMax = this.sprites.takeHit.framesMax;
            this.framesCurrent = 0;
            setTimeout(() => {
                this.resetToIdle();
            }, 500); // Duration of hit animation
        }
    }

    // Play death animation and mark as dead
    die() {
        if (this.sprites?.death) {
            this.image = this.sprites.death.image;
            this.framesMax = this.sprites.death.framesMax;
            this.framesCurrent = 0;
            this.dead = true;
        }
    }

    // Reset sprite to idle animation
    resetToIdle() {
        if (this.sprites?.idle) {
            this.image = this.sprites.idle.image;
            this.framesMax = this.sprites.idle.framesMax;
            this.framesCurrent = 0;
            this.dead = false; // Reset dead flag
        }
    }
}

// Create soldier and orc sprites with their respective animations
const soldier = new Sprite({
    position: { x: 100, y: 300 },
    imageSrc: 'images/Soldier/Soldier_Idle.png',
    scale: 2,
    framesMax: 6, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/Soldier/Soldier_Idle.png',
            framesMax: 6,
        },
        takeHit: {
            imageSrc: 'images/Soldier/Soldier_Hit.png', // Path to hit sprite sheet
            framesMax: 5, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/Soldier/Soldier_Death.png', // Path to death sprite sheet
            framesMax: 4, // Number of frames in death animation
        },
    },
});

const orc = new Sprite({
    position: { x: 700, y: 300 },
    imageSrc: 'images/Orc/Orc_Idle.png',
    scale: 2,
    framesMax: 6, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/Orc/Orc_Idle.png',
            framesMax: 6,
        },
        takeHit: {
            imageSrc: 'images/Orc/Orc_Hit.png', // Path to hit sprite sheet
            framesMax: 5, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/Orc/Orc_Death.png', // Path to death sprite sheet
            framesMax: 4, // Number of frames in death animation
        },
    },
});

// Health variables (max health is 3 for both)
let wolfHealth = 3;
let soldierHealth = 3;

const questions = [
    { question: "2 + 6 = ?", answer: "8" },
    { question: "7 - 3 = ?", answer: "4" },
    { question: "5 * 4 = ?", answer: "20" },
    { question: "10 / 2 = ?", answer: "5" }
];

let currentQuestionIndex = 0;
let timeLeft = 30;
let timerInterval;

// Function to draw a health bar above a given sprite
function drawHealthBar(sprite, currentHealth, maxHealth) {
    const barWidth = 50 * sprite.scale; // Adjust width as needed
    const barHeight = 10;
    // Calculate sprite's drawn width based on current frame width and scale
    let spriteWidth = (sprite.image.width / sprite.framesMax) * sprite.scale;
    // Center the health bar above the sprite
    let x = sprite.position.x + (spriteWidth - barWidth) / 2;
    let y = sprite.position.y - 20; // 20 pixels above the sprite

    // Draw the background (red for missing health)
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, barWidth, barHeight);
    // Draw the current health (green overlay)
    const healthWidth = barWidth * (currentHealth / maxHealth);
    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, healthWidth, barHeight);
    // Draw border
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x, y, barWidth, barHeight);
}

// Start the game
function startGame() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('gameplay-screen').style.display = 'block';
    loadQuestion();
    startTimer();
    animate();
}

// Load the current question text
function loadQuestion() {
    const questionText = document.getElementById('question-text');
    questionText.textContent = questions[currentQuestionIndex].question;
}

// Handle answer submission and update health accordingly
function submitAnswer() {
    const userAnswer = document.getElementById('answer-input').value;
    if (userAnswer === questions[currentQuestionIndex].answer) {
        // Correct answer: orc takes damage
        wolfHealth--;
        if (wolfHealth > 0) {
            orc.takeHit(); // Play hit animation
        } else {
            orc.die(); // Play death animation
            setTimeout(() => {
                endGame();
            }, 2000); // Wait for death animation to finish
        }
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            endGame();
        }
    } else {
        // Incorrect answer: soldier takes damage
        soldierHealth--;
        if (soldierHealth > 0) {
            soldier.takeHit(); // Play hit animation
        } else {
            soldier.die(); // Play death animation
            setTimeout(() => {
                endGame();
            }, 2000);
        }
    }
    document.getElementById('answer-input').value = '';
}

// Start the countdown timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time-left').textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// End the game and reset state
function endGame() {
    clearInterval(timerInterval);
    alert('Game over!');
    currentQuestionIndex = 0;
    timeLeft = 30;
    wolfHealth = 3;
    soldierHealth = 3;

    // Reset sprites to idle mode
    soldier.resetToIdle();
    orc.resetToIdle();

    document.getElementById('time-left').textContent = timeLeft;
    document.querySelector('.container').style.display = 'block';
    document.getElementById('gameplay-screen').style.display = 'none';
}

// Animation loop: updates sprites and draws health bars
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Update sprite animations
    soldier.update();
    orc.update();

    // Draw health bars above the soldier and the orc
    drawHealthBar(soldier, soldierHealth, 3);
    drawHealthBar(orc, wolfHealth, 3);
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    startGame();
});