// Function to show the Play Mode Selection
function goToPlay() {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('play-mode').classList.remove('hidden');
}

// Function to go back to Homepage
function goBack() {
    document.getElementById('play-mode').classList.add('hidden');
    document.getElementById('homepage').classList.remove('hidden');
}

// Function to start 1v1 mode
function start1v1() {
    document.getElementById('play-mode').classList.add('hidden');
    document.getElementById('game-1v1').classList.remove('hidden');
}

// Function to start 3v3 mode
function start3v3() {
    document.getElementById('play-mode').classList.add('hidden');
    document.getElementById('game-3v3').classList.remove('hidden');
}

// Function to return to mode selection
function goBackToMode() {
    document.getElementById('game-1v1').classList.add('hidden');
    document.getElementById('game-3v3').classList.add('hidden');
    document.getElementById('play-mode').classList.remove('hidden');
}

// Function to check answers in 1v1 mode
function checkAnswer1v1(answer) {
    const correctAnswer = 6;
    const enemyHealth = document.querySelector(".enemy-health .health-fill");

    if (answer === correctAnswer) {
        alert("Correct! You hit the enemy!");

        // Reduce enemy health
        let currentWidth = parseInt(enemyHealth.style.width) || 100;
        let newWidth = currentWidth - 50; // Reduce health by 50% per correct answer

        if (newWidth <= 0) {
            enemyHealth.style.width = "0%";
            alert("You won the 1v1 battle!");
            goBackToMode(); // Return to selection after winning
        } else {
            enemyHealth.style.width = newWidth + "%";
        }
    } else {
        alert("Incorrect! Try again.");
    }
}

// Function to check answers in 3v3 mode (kept same for now)
function checkAnswer3v3(answer) {
    if (answer === 9) {
        alert("Correct! Your team won the 3v3 battle!");
    } else {
        alert("Incorrect! Keep going.");
    }
}
