const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024; // Set canvas width
canvas.height = 576; // Set canvas height

let selectedTarget = null; // Track the selected target
let animationId; // Variable to store the animation loop ID

// Turn order: order of turns for all characters (player, allies, enemies)
let turnOrder = ['soldier', 'orc', 'allyTop', 'allyBottom', 'enemyTop', 'enemyBottom'];
let currentTurnIndex = 0; // Track whose turn it islet isPlayerTurn = true; // Will be true if the current turn is soldier's turn

let answerTimer; // Variable to store the answer timer
const answerTimeLimit = 10; // Time limit for answering the question (in seconds)
let answerTimeLeft = answerTimeLimit; // Time left to answer the question

// Sprite class for handling animations
class Sprite {
    constructor({
        position,
        offset = { x: 0, y: 0 },
        imageSrc,
        scale = 1,
        framesMax = 1,
        sprites
    }) {
        this.position = position;
        this.offset = offset;
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
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
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
    offset: { x:0, y: 0 },
    imageSrc: 'images/Soldier/Soldier_Idle.png',
    scale: 2,
    framesMax: 6, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/Soldier/Soldier_Idle.png',
            framesMax: 6,
        },
        attack: {
            imageSrc: 'images/Soldier/Soldier_Attack01.png', // Add attack animation
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

// Create two allies
const allyTop = new Sprite({
    position: { x: 100, y: 200 }, // Positioned above the soldier
    offset: { x:-110, y: -20 },
    imageSrc: 'images/allies/Fantasy_Warrior/Idle.png', // Replace with your ally image
    scale: 2,
    framesMax: 10, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/allies/Fantasy_Warrior/Idle.png', // Replace with your ally idle image
            framesMax: 10,
        },
        attack: {
            imageSrc: 'images/allies/Fantasy_Warrior/Attack1.png', // Add attack animation
            framesMax: 6,
        },
        takeHit: {
            imageSrc: 'images/allies/Fantasy_Warrior/Take hit.png', // Replace with your ally hit image
            framesMax: 3, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/allies/Fantasy_Warrior/Death.png', // Replace with your ally death image
            framesMax: 7, // Number of frames in death animation
        },
    },
});

const allyBottom = new Sprite({
    position: { x: 50, y: 400 }, // Positioned below the soldier
    offset: { x:0, y: 0},
    imageSrc: 'images/allies/Huntress_2/Idle.png', // Replace with your ally image
    scale: 2,
    framesMax: 10, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/allies/Huntress_2/Idle.png', // Replace with your ally idle image
            framesMax: 10,
        },
        attack: {
            imageSrc: 'images/allies/Huntress_2/Attack.png', // Add attack animation
            framesMax: 6,
        },
        takeHit: {
            imageSrc: 'images/allies/Huntress_2/Get Hit.png', // Replace with your ally hit image
            framesMax: 3, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/allies/Huntress_2/Death.png', // Replace with your ally death image
            framesMax: 10, // Number of frames in death animation
        },
    },
});

const enemyTop = new Sprite({
    position: { x: 700, y: 200 }, // Positioned above the orc
    offset: { x:0, y: 0},
    imageSrc: 'images/mobs/Goblin/Idle.png', // Replace with your enemy image
    scale: 2,
    framesMax: 4, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/mobs/Goblin/Idle.png', // Replace with your enemy idle image
            framesMax: 4,
        },
        attack: {
            imageSrc: 'images/mobs/Goblin/Attack.png', // Add attack animation
            framesMax: 8,
        },
        takeHit: {
            imageSrc: 'images/mobs/Goblin/Take Hit.png', // Replace with your enemy hit image
            framesMax: 4, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/mobs/Goblin/Death.png', // Replace with your enemy death image
            framesMax: 4, // Number of frames in death animation
        },
    },
});

const enemyBottom = new Sprite({
    position: { x: 700, y: 400 }, // Positioned below the orc
    offset: { x:0, y: 0},
    imageSrc: 'images/mobs/Skeleton/Idle.png', // Replace with your enemy image
    scale: 2,
    framesMax: 4, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/mobs/Skeleton/Idle.png', // Replace with your enemy idle image
            framesMax: 4,
        },
        attack: {
            imageSrc: 'images/mobs/Skeleton/Attack.png', // Add attack animation
            framesMax: 8,
        },
        takeHit: {
            imageSrc: 'images/mobs/Skeleton/Take Hit.png', // Replace with your enemy hit image
            framesMax: 4, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/mobs/Skeleton/Death.png', // Replace with your enemy death image
            framesMax: 4, // Number of frames in death animation
        },
    },
});

const orc = new Sprite({
    position: { x: 700, y: 300 },
    offset: { x:0, y: 0},
    imageSrc: 'images/Orc/Orc_Idle.png',
    scale: 2,
    framesMax: 6, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/Orc/Orc_Idle.png',
            framesMax: 6,
        },
        attack: {
            imageSrc: 'images/Orc/Orc_Attack01.png', // Add attack animation
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

// Health variables (max health is 3 for each)
let wolfHealth = 3;
let soldierHealth = 3;
let allyTopHealth = 3;
let allyBottomHealth = 3;
let enemyTopHealth = 3;
let enemyBottomHealth = 3;

// New array for enemy questions – used after a wrong answer / enemy attack
const enemyQuestions = [
    { question: "12 - 5 = ?", answer: "7" },
    { question: "3 * 3 = ?", answer: "9" },
    { question: "15 / 3 = ?", answer: "5" }
];

function selectTarget(target) {
    if (isPlayerTurn) {
        selectedTarget = target;
        document.getElementById('question-text').textContent = questions[currentQuestionIndex].question;
        document.getElementById('answer-input').style.display = 'block';
        document.getElementById('submit-button').style.display = 'block';
        document.getElementById('target-selection').style.display = 'none'; // Hide target selection
        document.getElementById('answer-timer').style.display = 'block'; // Show answer timer

        // Start the answer timer
        answerTimeLeft = answerTimeLimit;
        document.getElementById('answer-time-left').textContent = answerTimeLeft;
        startAnswerTimer();
    }
}

function startAnswerTimer() {
    answerTimer = setInterval(() => {
        answerTimeLeft--;
        document.getElementById('answer-time-left').textContent = answerTimeLeft;

        if (answerTimeLeft <= 0) {
            clearInterval(answerTimer);
            handleAnswerTimeout(); // Handle timeout (player fails to answer in time)
        }
    }, 1000);
}

// Modified to trigger turn progression on timeout
function handleAnswerTimeout() {
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').style.display = 'none';
    document.getElementById('submit-button').style.display = 'none';
    document.getElementById('question-text').textContent = 'Time is up!';
    selectedTarget = null;

    // Advance turn order
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    processTurn();
}

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
    let spriteWidth = (sprite.image.width / sprite.framesMax) * sprite.scale;
    let x = sprite.position.x + (spriteWidth - barWidth) / 2;
    let y = sprite.position.y - 20; // 20 pixels above the sprite

    // Draw missing health (red)
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, barWidth, barHeight);
    // Draw current health (green)
    const healthWidth = barWidth * (currentHealth / maxHealth);
    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, healthWidth, barHeight);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x, y, barWidth, barHeight);
}

// NEW: Function to draw the turn order at the top of the canvas
function drawTurnOrder() {
    const xStart = 20; // Starting x-coordinate for icons
    const yStart = 10; // y-coordinate for icons
    const iconSize = 40; // Width and height for each icon
    const spacing = 60; // Horizontal spacing between icons
    let x = xStart;
    
    for (let i = 0; i < turnOrder.length; i++) {
        let charName = turnOrder[i];
        let sprite;
        // Map turnOrder string to sprite object
        switch(charName) {
            case 'soldier':
                sprite = soldier;
                break;
            case 'orc':
                sprite = orc;
                break;
            case 'allyTop':
                sprite = allyTop;
                break;
            case 'allyBottom':
                sprite = allyBottom;
                break;
            case 'enemyTop':
                sprite = enemyTop;
                break;
            case 'enemyBottom':
                sprite = enemyBottom;
                break;
            default:
                continue;
        }
        // Highlight current turn with a yellow border
        if (i === currentTurnIndex) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, yStart, iconSize, iconSize);
        }
        // Draw the sprite's first idle frame as an icon (scaled down)
        ctx.drawImage(
            sprite.image,
            0, 0,
            sprite.image.width / sprite.framesMax, sprite.image.height,
            x, yStart,
            iconSize, iconSize
        );
        // Draw the character's name below the icon
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(charName, x, yStart + iconSize + 12);
        x += spacing;
    }
}

// NEW: Process the current turn based on the turnOrder
function processTurn() {
    const currentTurn = turnOrder[currentTurnIndex];
    if (currentTurn === 'soldier') {
        // Player's turn: show target selection and load question
        isPlayerTurn = true;
        document.getElementById('target-selection').style.display = 'block';
        loadQuestion();
    } else if (currentTurn === 'orc' || currentTurn === 'enemyTop' || currentTurn === 'enemyBottom') {
        // Enemy turn: trigger enemy attack for the specific enemy
        isPlayerTurn = false;
        let activeEnemy;
        if (currentTurn === 'orc') {
            activeEnemy = orc;
        } else if (currentTurn === 'enemyTop') {
            activeEnemy = enemyTop;
        } else if (currentTurn === 'enemyBottom') {
            activeEnemy = enemyBottom;
        }
        enemyTurn(activeEnemy);
    } else if (currentTurn === 'allyTop' || currentTurn === 'allyBottom') {
        // Ally turn: trigger ally attack for the specific ally
        isPlayerTurn = false;
        let activeAlly = (currentTurn === 'allyTop') ? allyTop : allyBottom;
        alliedTurn(activeAlly);
    }
}

// NEW: Modified enemyTurn accepts an optional activeEnemy parameter
async function enemyTurn(activeEnemy) {
    let attacker = activeEnemy;
    // Choose a random target from player characters: soldier, allyTop, allyBottom
    const playerTargets = [];
    if (!soldier.dead) playerTargets.push(soldier);
    if (!allyTop.dead) playerTargets.push(allyTop);
    if (!allyBottom.dead) playerTargets.push(allyBottom);
    if (playerTargets.length === 0) return;
    const target = playerTargets[Math.floor(Math.random() * playerTargets.length)];

    await attackAnimation(attacker, target);

    // Apply damage to the chosen target
    if (target === soldier) {
        soldierHealth--;
        if (soldierHealth > 0) {
            soldier.takeHit();
        } else {
            soldier.die();
            setTimeout(() => {
                endGame();
            }, 2000);
        }
    } else if (target === allyTop) {
        allyTopHealth--;
        if (allyTopHealth > 0) {
            allyTop.takeHit();
        } else {
            allyTop.die();
        }
    } else if (target === allyBottom) {
        allyBottomHealth--;
        if (allyBottomHealth > 0) {
            allyBottom.takeHit();
        } else {
            allyBottom.die();
        }
    }
    
    // Advance turn order and process the next turn
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    processTurn();
}

// NEW: Function for ally turns – allies automatically attack a random enemy
async function alliedTurn(activeAlly) {
    let attacker = activeAlly;
    // Choose a random target from enemy characters: orc, enemyTop, enemyBottom
    const enemyTargets = [];
    if (!orc.dead) enemyTargets.push(orc);
    if (enemyTop && !enemyTop.dead) enemyTargets.push(enemyTop);
    if (enemyBottom && !enemyBottom.dead) enemyTargets.push(enemyBottom);
    if (enemyTargets.length === 0) return;
    const target = enemyTargets[Math.floor(Math.random() * enemyTargets.length)];
    
    await attackAnimation(attacker, target);

    // Apply damage to the chosen enemy target
    if (target === orc) {
        wolfHealth--;
        if (wolfHealth > 0) {
            orc.takeHit();
        } else {
            orc.die();
            setTimeout(() => {
                endGame();
            }, 2000);
        }
    } else if (target === enemyTop) {
        enemyTopHealth--;
        if (enemyTopHealth > 0) {
            enemyTop.takeHit();
        } else {
            enemyTop.die();
            setTimeout(() => {
                endGame();
            }, 2000);
        }
    } else if (target === enemyBottom) {
        enemyBottomHealth--;
        if (enemyBottomHealth > 0) {
            enemyBottom.takeHit();
        } else {
            enemyBottom.die();
            setTimeout(() => {
                endGame();
            }, 2000);
        }
    }
    
    // Advance turn order and process the next turn
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    processTurn();
}

// Start the game
function startGame() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('gameplay-screen').style.display = 'block';
    // Initially hide target selection and answer timer (will be shown in processTurn)
    document.getElementById('target-selection').style.display = 'none';
    document.getElementById('answer-timer').style.display = 'none';
    // Load the first question (if needed) and start the timer and animation
    loadQuestion();
    startTimer();
    animate();
    // Begin processing the first turn (should be soldier by default)
    processTurn();
}

// Load the current question text
function loadQuestion() {
    const questionText = document.getElementById('question-text');
    questionText.textContent = questions[currentQuestionIndex].question;
}

// Modified submitAnswer to update turn order after soldier's turn
async function submitAnswer() {
    clearInterval(answerTimer); // Stop the answer timer

    const userAnswer = document.getElementById('answer-input').value;
    if (userAnswer === questions[currentQuestionIndex].answer) {
        // Correct answer: soldier attacks the selected target
        if (selectedTarget === 'orc') {
            await attackAnimation(soldier, orc);
            wolfHealth--;
            if (wolfHealth > 0) {
                orc.takeHit();
            } else {
                orc.die();
                setTimeout(() => {
                    endGame();
                }, 2000);
            }
        } else if (selectedTarget === 'enemyTop') {
            await attackAnimation(soldier, enemyTop);
            enemyTopHealth--;
            if (enemyTopHealth > 0) {
                enemyTop.takeHit();
            } else {
                enemyTop.die();
                setTimeout(() => {
                    endGame();
                }, 2000);
            }
        } else if (selectedTarget === 'enemyBottom') {
            await attackAnimation(soldier, enemyBottom);
            enemyBottomHealth--;
            if (enemyBottomHealth > 0) {
                enemyBottom.takeHit();
            } else {
                enemyBottom.die();
                setTimeout(() => {
                    endGame();
                }, 2000);
            }
        }
        // Clear UI after a correct answer
        document.getElementById('answer-input').value = '';
        document.getElementById('answer-input').style.display = 'none';
        document.getElementById('submit-button').style.display = 'none';
        document.getElementById('question-text').textContent = '';
    } else {
        // Incorrect answer: simply clear the input and notify the player
        document.getElementById('answer-input').value = '';
        document.getElementById('answer-input').style.display = 'none';
        document.getElementById('submit-button').style.display = 'none';
        document.getElementById('question-text').textContent = 'Wrong Answer!';
    }
    // Advance turn order and process the next turn
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    processTurn();
}

// Modified attackAnimation function:
// The attacker walks up to the target, then stays there to complete the full attack animation.
// Once the attack animation is finished, the sprite resets to idle and then walks back.
async function attackAnimation(attacker, target) {
    const originalX = attacker.position.x;
    const attackDistance = 50; // Distance to move toward the target

    // Move toward the target
    while (attacker.position.x < target.position.x - attackDistance) {
        attacker.position.x += 5;
        await new Promise(resolve => setTimeout(resolve, 16)); // 60 FPS
    }

    // Start the attack animation at the target
    attacker.image = attacker.sprites.attack.image;
    attacker.framesMax = attacker.sprites.attack.framesMax;
    attacker.framesCurrent = 0;

    // Wait for the attack animation to finish fully while staying at the target position.
    // (You can adjust the delay to match the duration of your attack animation.)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Now reset to idle animation before walking back.
    attacker.resetToIdle();

    // Move back to the original position while showing idle animation
    while (attacker.position.x > originalX) {
        attacker.position.x -= 5;
        await new Promise(resolve => setTimeout(resolve, 16)); // 60 FPS
    }
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
    clearInterval(answerTimer); // Stop the answer timer (if running)
    cancelAnimationFrame(animationId); // Stop the animation loop
    alert('Game over!');

    // Reset all game state variables, including health, so the health bars display as full.
    currentQuestionIndex = 0;
    timeLeft = 30;
    wolfHealth = 3;
    soldierHealth = 3;
    allyTopHealth = 3;
    allyBottomHealth = 3;
    enemyTopHealth = 3;
    enemyBottomHealth = 3;

    // Reset sprites to idle mode
    soldier.resetToIdle();
    orc.resetToIdle();
    allyTop.resetToIdle();
    allyBottom.resetToIdle();
    enemyTop.resetToIdle();
    enemyBottom.resetToIdle();

    // Reset UI
    document.getElementById('time-left').textContent = timeLeft;
    document.getElementById('answer-time-left').textContent = answerTimeLimit;
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').style.display = 'none';
    document.getElementById('submit-button').style.display = 'none';
    document.getElementById('question-text').textContent = '';
    document.getElementById('target-selection').style.display = 'none';
    document.getElementById('answer-timer').style.display = 'none';

    // Show the home screen and hide the gameplay screen
    document.querySelector('.container').style.display = 'block';
    document.getElementById('gameplay-screen').style.display = 'none';

    // Re-enable the play button
    document.getElementById('play-button').disabled = false;
}

// Animation loop: updates sprites and draws health bars, then overlays the turn order display
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw allies first (behind the soldier)
    allyTop.update();
    allyBottom.update();

    // Draw enemies (behind the soldier)
    if (enemyTop) enemyTop.update();
    if (enemyBottom) enemyBottom.update();

    // Update main characters
    soldier.update();
    orc.update();

    // Draw health bars for all characters
    drawHealthBar(soldier, soldierHealth, 3);
    drawHealthBar(orc, wolfHealth, 3);
    drawHealthBar(allyTop, allyTopHealth, 3);
    drawHealthBar(allyBottom, allyBottomHealth, 3);
    if (enemyTop) drawHealthBar(enemyTop, enemyTopHealth, 3);
    if (enemyBottom) drawHealthBar(enemyBottom, enemyBottomHealth, 3);

    // Draw the turn order bar on top
    drawTurnOrder();
}

document.addEventListener("DOMContentLoaded", function () {
    startGame();
});
