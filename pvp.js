// Question and Answer Pool
const questionPool = [
    { question: "2 x 3 = ?", correct: 6, options: [6, 9, 2] },
    { question: "5 + 4 = ?", correct: 9, options: [9, 3, 6] },
    { question: "8 - 3 = ?", correct: 5, options: [5, 7, 2] },
    { question: "6 ÷ 2 = ?", correct: 3, options: [3, 5, 1] },
    { question: "3 x 4 = ?", correct: 12, options: [12, 9, 6] }
];

let currentQuestionIndex = 0;
let enemyHealth = 100; // Track enemy health

function goToPlay() {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('play-mode').classList.remove('hidden');
}

function goBack() {
    document.getElementById('play-mode').classList.add('hidden');
    document.getElementById('homepage').classList.remove('hidden');
}

function start1v1() {
    document.getElementById('play-mode').classList.add('hidden');
    document.getElementById('game-1v1').classList.remove('hidden');
    resetGame(); // Reset game settings when starting
}

function goBackToMode() {
    document.getElementById('game-1v1').classList.add('hidden');
    document.getElementById('play-mode').classList.remove('hidden');
}

// Function to load a new random question
function loadNewQuestion() {
    currentQuestionIndex = Math.floor(Math.random() * questionPool.length);
    const questionData = questionPool[currentQuestionIndex];

    // Update question text
    document.querySelector(".question-box").textContent = questionData.question;

    // Update answer buttons
    const buttons = document.querySelectorAll(".answer-buttons button");
    buttons.forEach((btn, index) => {
        btn.textContent = questionData.options[index];
        btn.onclick = () => checkAnswer1v1(questionData.options[index]);
    });
}

// Function to check the answer
function checkAnswer1v1(answer) {
    const questionData = questionPool[currentQuestionIndex];

    if (answer === questionData.correct) {
        enemyHealth -= 50; // Reduce enemy health by 50%
        document.querySelector(".enemy-health .health-fill").style.width = `${enemyHealth}%`;

        if (enemyHealth <= 0) {
            setTimeout(() => {
                alert("Victory! You won the 1v1 battle!");
                resetGame();
            }, 500);
        } else {
            loadNewQuestion(); // Load new question if enemy is still alive
        }
    } else {
        alert("Incorrect! Try again.");
    }
}

// Reset game settings
function resetGame() {
    enemyHealth = 100; // Reset enemy health
    document.querySelector(".enemy-health .health-fill").style.width = "100%";
    loadNewQuestion(); // Load the first question
}
