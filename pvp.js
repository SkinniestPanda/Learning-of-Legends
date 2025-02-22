// Combine all questions into one pool
const questionPool = [
    ...additionQuestions,
    ...subtractionQuestions,
    ...multiplicationQuestions,
    ...divisionQuestions
];

let currentQuestionIndex = 0;
let enemyHealth = 100;
let timeLeft = 10;
let timer;
let currentMode = "1v1"; // Track if in 1v1 or 3v3 mode

function goToPlay() {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('play-mode').classList.remove('hidden');
}

function goBack() {
    document.getElementById('play-mode').classList.add('hidden');
    document.getElementById('homepage').classList.remove('hidden');
}

// Generate Background Image Paths Automatically (1.png to 32.png)
const backgrounds = Array.from({ length: 32 }, (_, i) => `images/${i + 1}.png`);
let lastBackground = null; // Stores the last used background

function changeBackground() {
    let newBackground;

    do {
        newBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    } while (newBackground === lastBackground);

    lastBackground = newBackground;

    // Apply to the correct battlefield
    if (currentMode === "1v1") {
        document.querySelector("#game-1v1 .battlefield").style.backgroundImage = `url(${newBackground})`;
    } else {
        document.querySelector("#game-3v3 .battlefield").style.backgroundImage = `url(${newBackground})`;
    }
}

// Function to Set Random Background
function setRandomBackground(mode) {
    const battlefield = document.querySelector(`#${mode} .battlefield`);
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    battlefield.style.backgroundImage = `url(${randomBg})`;
}

// Start 1v1 Mode with Random Background
function start1v1() {
    document.getElementById('play-mode').classList.add('hidden');
    document.getElementById('game-1v1').classList.remove('hidden');
    setRandomBackground('game-1v1'); // Set background for 1v1
    currentMode = "1v1";
    resetGame();
}

// Start 3v3 Mode with Random Background
function start3v3() {
    document.getElementById('play-mode').classList.add('hidden');
    document.getElementById('game-3v3').classList.remove('hidden');
    setRandomBackground('game-3v3'); // Set background for 3v3
    currentMode = "3v3";
    resetGame();
}

function goBackToMode() {
    document.getElementById('game-1v1').classList.add('hidden');
    document.getElementById('game-3v3').classList.add('hidden');
    document.getElementById('play-mode').classList.remove('hidden');
    clearInterval(timer);
}

// Function to load a new random question
function loadNewQuestion() {
    currentQuestionIndex = Math.floor(Math.random() * questionPool.length);
    const questionData = questionPool[currentQuestionIndex];

    let questionBox;
    let answerButtonsContainer;

    if (currentMode === "1v1") {
        questionBox = document.querySelector("#game-1v1 .question-box");
        answerButtonsContainer = document.querySelector("#game-1v1 .answer-buttons");
    } else {
        questionBox = document.querySelector("#game-3v3 .question-box");
        answerButtonsContainer = document.querySelector("#game-3v3 .answer-buttons");
    }

    if (questionBox) {
        questionBox.textContent = questionData.question;
    }

    // Clear previous buttons
    if (answerButtonsContainer) {
        answerButtonsContainer.innerHTML = "";
    }

    // Generate new buttons for answer choices
    questionData.options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;

        if (currentMode === "1v1") {
            btn.onclick = () => checkAnswer1v1(option);
        } else {
            btn.onclick = () => checkAnswer3v3(option);
        }

        answerButtonsContainer.appendChild(btn);
    });

    resetTimer(); // Reset timer when a new question appears
}

// 1v1 Answer Check
function checkAnswer1v1(answer) {
    const questionData = questionPool[currentQuestionIndex];

    if (answer === questionData.correct) {
        enemyHealth -= 50;
        document.querySelector(".enemy-health .health-fill").style.width = `${enemyHealth}%`;

        if (enemyHealth <= 0) {
            setTimeout(() => {
                alert("Victory! You won the 1v1 battle!");
                changeBackground(); // Change background after a win
                resetGame();
            }, 500);
        } else {
            loadNewQuestion();
        }
    } else {
        alert("Incorrect! Try again.");
    }
}

let currentEnemy = 0; // Track which enemy's health to decrease

// 3v3 Answer Check
function checkAnswer3v3(answer) {
    const questionData = questionPool[currentQuestionIndex];

    if (answer === questionData.correct) {
        const enemyBars = document.querySelectorAll("#game-3v3 .enemy-health .health-fill");

        if (currentEnemy < enemyBars.length) {
            // Get current enemy health width
            let currentHealth = parseInt(enemyBars[currentEnemy].style.width) || 100;

            // Reduce health by 50%
            currentHealth -= 50;
            enemyBars[currentEnemy].style.width = `${currentHealth}%`;

            // If current enemy reaches 0%, move to the next one
            if (currentHealth <= 0) {
                currentEnemy++;

                // If all enemies are defeated, declare victory
                if (currentEnemy >= enemyBars.length) {
                    setTimeout(() => {
                        alert("Victory! Your team won the 3v3 battle!");
                        resetGame();  // Reset health and game state
                        setTimeout(changeBackground, 300); // Change background after reset
                    }, 500);
                    return;
                }
            }
            loadNewQuestion();
        }
    } else {
        alert("Incorrect! Try again.");
    }
}

// Timer function (shared for 1v1 and 3v3)
function startTimer() {
    timeLeft = 10;

    if (currentMode === "1v1") {
        document.getElementById("timer").textContent = `Time: ${timeLeft}s`;
    } else {
        document.getElementById("timer-3v3").textContent = `Time: ${timeLeft}s`;
    }

    timer = setInterval(() => {
        timeLeft--;

        if (currentMode === "1v1") {
            document.getElementById("timer").textContent = `Time: ${timeLeft}s`;
        } else {
            document.getElementById("timer-3v3").textContent = `Time: ${timeLeft}s`;
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Time's up! New question loaded.");
            loadNewQuestion(); // Load a new question instead of ending the game
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    startTimer();
}

// Reset game settings (for both 1v1 and 3v3)
function resetGame() {
    enemyHealth = 100;  // Reset main enemy health
    currentEnemy = 0;    // Reset enemy tracking for 3v3 mode

    // Reset all enemy health bars
    document.querySelectorAll(".enemy-health .health-fill").forEach((bar) => {
        bar.style.width = "100%";
    });

    // Reset all player health bars (if applicable)
    document.querySelectorAll(".player-health .health-fill").forEach((bar) => {
        bar.style.width = "100%";
    });

    loadNewQuestion(); // Generate a new question after resetting
}
