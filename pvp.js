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

function checkAnswer1v1(answer) {
    if (answer === 6) {
        alert("Correct! You won the 1v1 battle!");
    } else {
        alert("Incorrect! Try again.");
    }
}

function checkAnswer3v3(answer) {
    if (answer === 9) {
        alert("Correct! Your team won the 3v3 battle!");
    } else {
        alert("Incorrect! Keep going.");
    }
}
