// gameInit.js
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024; // Set canvas width
canvas.height = 576; // Set canvas height

let selectedTarget = null; // Track the selected target
let animationId; // Variable to store the animation loop ID
let timerInterval; // Global variable for the turn timer interval

let turnOrder = ['soldier', 'orc', 'allyTop', 'allyBottom', 'enemyTop', 'enemyBottom'];
let currentTurnIndex = 0; // Track whose turn it is
let isPlayerTurn = true; // Will be true if the current turn is soldier's turn

let currentUserCharacter = null;  // Will be set to soldier, allyTop, or allyBottom when it's a user turn.
let soldierAttackChoice = 'attack1';  // Default soldier attack animation

let wolfHealth = 50;
let soldierHealth = 50;
let allyTopHealth = 50;
let allyBottomHealth = 50;
let enemyTopHealth = 50;
let enemyBottomHealth = 50;

// Start the game
function startGame() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('gameplay-screen').style.display = 'block';
    document.getElementById('target-selection').style.display = 'none';
    animate();
    processTurn();
}

// End the game and reset state
function endGame() {
    clearInterval(timerInterval);
    cancelAnimationFrame(animationId); // Stop the animation loop
    alert('Game over!');

    // Reset all game state variables
    currentTurnIndex = 0;
    wolfHealth = 50;
    soldierHealth = 50;
    allyTopHealth = 50;
    allyBottomHealth = 50;
    enemyTopHealth = 50;
    enemyBottomHealth = 50;

    // Reset sprites to idle mode
    soldier.resetToIdle();
    orc.resetToIdle();
    allyTop.resetToIdle();
    allyBottom.resetToIdle();
    enemyTop.resetToIdle();
    enemyBottom.resetToIdle();

    // Reset UI
    document.getElementById('target-selection').style.display = 'none';

    // Show the home screen and hide the gameplay screen
    document.querySelector('.container').style.display = 'block';
    document.getElementById('gameplay-screen').style.display = 'none';

    // Re-enable the play button
    document.getElementById('play-button').disabled = false;
}

document.addEventListener("DOMContentLoaded", function () {
    startGame();
});