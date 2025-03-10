// pvp.js

// Global variables for mode and question handling
let currentMode = null; // "1v1" or "3v3"
let canvas, ctx;
let animationFrameId;
let questionPool = [
  ...additionQuestions,
  ...subtractionQuestions,
  ...multiplicationQuestions,
  ...divisionQuestions
];
let currentQuestion = null;
let timerId, timeLeft = 10;

// Health variables for 1v1 mode
let playerHealth = 100, enemyHealth = 100;

// Health arrays for 3v3 mode (using three enemies and three players)
let teamPlayerHealth = [100, 100, 100];
let teamEnemyHealth = [100, 100, 100];
let currentEnemyIndex = 0;

// --- Mode Navigation Functions ---
function goToPlay() {
  document.getElementById('homepage').classList.add('hidden');
  document.getElementById('play-mode').classList.remove('hidden');
}

function goBack() {
  document.getElementById('play-mode').classList.add('hidden');
  document.getElementById('homepage').classList.remove('hidden');
}

function goBackToMode() {
  cancelAnimationFrame(animationFrameId);
  clearInterval(timerId);
  document.getElementById('game-1v1').classList.add('hidden');
  document.getElementById('game-3v3').classList.add('hidden');
  document.getElementById('play-mode').classList.remove('hidden');
}

// --- Question & Timer Functions ---
function loadNewQuestion() {
  const idx = Math.floor(Math.random() * questionPool.length);
  currentQuestion = questionPool[idx];
  if (currentMode === "1v1") {
    document.getElementById('question-box-1v1').textContent = currentQuestion.question;
    const container = document.getElementById('answer-buttons-1v1');
    container.innerHTML = "";
    currentQuestion.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => checkAnswer1v1(opt);
      container.appendChild(btn);
    });
  } else {
    document.getElementById('question-box-3v3').textContent = currentQuestion.question;
    const container = document.getElementById('answer-buttons-3v3');
    container.innerHTML = "";
    currentQuestion.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => checkAnswer3v3(opt);
      container.appendChild(btn);
    });
  }
  resetTimer();
}

function startTimer() {
  timeLeft = 10;
  timerId = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      alert("Time's up!");
      loadNewQuestion();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerId);
  startTimer();
}

// --- 1v1 Mode Functions ---
function start1v1() {
  currentMode = "1v1";
  document.getElementById('play-mode').classList.add('hidden');
  document.getElementById('game-1v1').classList.remove('hidden');

  // Setup canvas for 1v1 mode
  canvas = document.getElementById('pvp-canvas-1v1');
  ctx = canvas.getContext('2d');
  canvas.width = 1024;
  canvas.height = 576;

  // Reset health values
  playerHealth = 100;
  enemyHealth = 100;

  // Use the position and offset from the sprite objects
  soldier.position = { x: 150, y: 300 }; // Default position from sprites.js
  orc.position = { x: 650, y: 300 }; // Default position from sprites.js

  loadNewQuestion();
  animate1v1();
}

function animate1v1() {
  animationFrameId = requestAnimationFrame(animate1v1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Update the shared sprites from sprites.js
  soldier.update();
  orc.update();
  // Draw health bars using a helper function (similar to ui.js)
  drawHealthBar(soldier, playerHealth, 100, ctx);
  drawHealthBar(orc, enemyHealth, 100, ctx);
}

function checkAnswer1v1(answer) {
  if (answer == currentQuestion.correct) {
    // Walk up and attack: animate soldier moving toward orc then attacking
    attackAnimation(soldier, orc).then(() => {
      enemyHealth -= 50;
      if (enemyHealth <= 0) {
        alert("Victory! You won the 1v1 battle!");
        goBackToMode();
      } else {
        loadNewQuestion();
      }
    });
  } else {
    alert("Incorrect! Try again.");
  }
}

// --- 3v3 Mode Functions ---
function start3v3() {
  currentMode = "3v3";
  document.getElementById('play-mode').classList.add('hidden');
  document.getElementById('game-3v3').classList.remove('hidden');

  canvas = document.getElementById('pvp-canvas-3v3');
  ctx = canvas.getContext('2d');
  canvas.width = 1024;
  canvas.height = 576;

  // Position player team sprites using their default positions from sprites.js
  soldier.position = { x: 150, y: 300 }; // Default position from sprites.js
  allyTop.position = { x: 50, y: 200 }; // Default position from sprites.js
  allyBottom.position = { x: 50, y: 400 }; // Default position from sprites.js

  // Position enemy team sprites using their default positions from sprites.js
  enemyTop.position = { x: 700, y: 200 }; // Default position from sprites.js
  enemyTop.flip = true;
  enemyBottom.position = { x: 700, y: 400 }; // Default position from sprites.js
  enemyBottom.flip = true;
  orc.position = { x: 650, y: 300 }; // Default position from sprites.js
  orc.flip = true;

  // Reset health values
  teamPlayerHealth = [100, 100, 100];
  teamEnemyHealth = [100, 100, 100];
  currentEnemyIndex = 0;

  loadNewQuestion();
  animate3v3();
}

function animate3v3() {
  animationFrameId = requestAnimationFrame(animate3v3);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Update all team sprites
  soldier.update();
  allyTop.update();
  allyBottom.update();
  enemyTop.update();
  enemyBottom.update();
  orc.update();
  // Draw health bars for player team
  drawHealthBar(soldier, teamPlayerHealth[0], 100, ctx);
  drawHealthBar(allyTop, teamPlayerHealth[1], 100, ctx);
  drawHealthBar(allyBottom, teamPlayerHealth[2], 100, ctx);
  // Draw health bars for enemy team
  drawHealthBar(enemyTop, teamEnemyHealth[0], 100, ctx);
  drawHealthBar(enemyBottom, teamEnemyHealth[1], 100, ctx);
  drawHealthBar(orc, teamEnemyHealth[2], 100, ctx);
}

function checkAnswer3v3(answer) {
  if (answer == currentQuestion.correct) {
    // For demonstration, soldier will attack the current enemy
    let targetSprite;
    if (currentEnemyIndex === 0) {
      targetSprite = enemyTop;
    } else if (currentEnemyIndex === 1) {
      targetSprite = enemyBottom;
    } else {
      targetSprite = orc;
    }
    attackAnimation(soldier, targetSprite).then(() => {
      teamEnemyHealth[currentEnemyIndex] -= 50;
      if (teamEnemyHealth[currentEnemyIndex] <= 0) {
        currentEnemyIndex++;
        if (currentEnemyIndex >= 3) {
          alert("Victory! Your team won the 3v3 battle!");
          goBackToMode();
          return;
        }
      }
      loadNewQuestion();
    });
  } else {
    alert("Incorrect! Try again.");
  }
}

async function attackAnimation(attacker, target) {
    // Save original position to return after the attack.
    const originalPosition = { x: attacker.position.x, y: attacker.position.y };
  
    // Calculate the attacker's drawn width (from its image, frame count, and scale)
    const attackerWidth = (attacker.image.width / attacker.framesMax) * attacker.scale;
    
    // Calculate destination: use the target's effective position (from sprites.js) 
    // and subtract half the attacker's width so that the attacker stops near the target.
    const destination = {
      x: target.position.x + target.offset.x - attackerWidth * 0.5,
      y: target.position.y + target.offset.y
    };
  
    // Switch to running animation (if available) so the attacker "walks" toward the target.
    if (attacker.sprites.run) {
      attacker.image = attacker.sprites.run.image;
      attacker.framesMax = attacker.sprites.run.framesMax;
      attacker.framesCurrent = 0;
    }
  
    // Animate movement toward the destination.
    while (Math.hypot(attacker.position.x - destination.x, attacker.position.y - destination.y) > 5) {
      const dx = destination.x - attacker.position.x;
      const dy = destination.y - attacker.position.y;
      const angle = Math.atan2(dy, dx);
      const step = 5; // Adjust for desired speed.
      attacker.position.x += step * Math.cos(angle);
      attacker.position.y += step * Math.sin(angle);
      await new Promise(resolve => setTimeout(resolve, 16)); // ~60 FPS
    }
    // Snap to destination.
    attacker.position.x = destination.x;
    attacker.position.y = destination.y;
  
    // Play attack animation.
    if (attacker === soldier && attacker.sprites.attack1) {
      attacker.image = attacker.sprites.attack1.image;
      attacker.framesMax = attacker.sprites.attack1.framesMax;
    } else if (attacker.sprites.attack) {
      attacker.image = attacker.sprites.attack.image;
      attacker.framesMax = attacker.sprites.attack.framesMax;
    }
    attacker.framesCurrent = 0;
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for the attack animation
  
    // Reset to idle.
    attacker.resetToIdle();
  
    // Switch back to running animation for the return journey.
    if (attacker.sprites.run) {
      attacker.image = attacker.sprites.run.image;
      attacker.framesMax = attacker.sprites.run.framesMax;
      attacker.framesCurrent = 0;
    }
    // Animate movement back to the original position.
    while (Math.hypot(attacker.position.x - originalPosition.x, attacker.position.y - originalPosition.y) > 5) {
      const dx = originalPosition.x - attacker.position.x;
      const dy = originalPosition.y - attacker.position.y;
      const angle = Math.atan2(dy, dx);
      const step = 5;
      attacker.position.x += step * Math.cos(angle);
      attacker.position.y += step * Math.sin(angle);
      await new Promise(resolve => setTimeout(resolve, 16));
    }
    // Snap back to original position.
    attacker.position.x = originalPosition.x;
    attacker.position.y = originalPosition.y;
    attacker.resetToIdle();
  }
  

// --- Helper: Draw Health Bar on Canvas ---
function drawHealthBar(sprite, current, max, context) {
  const barWidth = 50 * sprite.scale;
  const barHeight = 10;
  let spriteWidth = (sprite.image.width / sprite.framesMax) * sprite.scale;
  let x = (sprite.position.x + sprite.offset.x) + (spriteWidth - barWidth) / 2;
  let y = sprite.position.y - 20; // Adjust y position based on sprite's position
  context.fillStyle = 'red';
  context.fillRect(x, y, barWidth, barHeight);
  let healthWidth = barWidth * (current / max);
  context.fillStyle = 'green';
  context.fillRect(x, y, healthWidth, barHeight);
  context.strokeStyle = 'black';
  context.strokeRect(x, y, barWidth, barHeight);
}