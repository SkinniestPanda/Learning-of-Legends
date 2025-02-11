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

    // ✅ Reset enemy health bar to full when starting a new match
    const enemyHealth = document.querySelector(".enemy-health .health-fill");
    enemyHealth.style.width = "100%";
}

function start3v3() {
    document.getElementById('play-mode').classList.add('hidden');
    document.getElementById('game-3v3').classList.remove('hidden');
}

function goBackToMode() {
    document.getElementById('game-1v1').classList.add('hidden');
    document.getElementById('game-3v3').classList.add('hidden');
    document.getElementById('play-mode').classList.remove('hidden');
}

function checkAnswer1v1(selected) {
    const correctAnswer = 6;
    const enemyHealth = document.querySelector(".enemy-health .health-fill");

    // Get current health percentage
    let currentWidth = parseInt(enemyHealth.style.width) || 100;

    if (selected === correctAnswer) {
        if (currentWidth > 0) {
            currentWidth -= 50; // ✅ Reduce health bar by 50%
            enemyHealth.style.width = currentWidth + "%"; // ✅ Update visually
        }

        // ✅ If health reaches 0, wait briefly before displaying victory message
        if (currentWidth <= 0) {
            setTimeout(() => {
                alert("Victory! You won the 1v1 battle!");
                goBackToMode(); // ✅ Return to mode selection
            }, 500); // ✅ Small delay to allow health bar to fully update
        }
    } else {
        alert("Wrong Answer! Try again.");
    }
}
