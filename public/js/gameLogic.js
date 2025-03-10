// gameLogic.js

// --- Combined Question Array ---
// Each question file (addition.js, subtraction.js, multiplication.js, division.js)
// defines its own global array. We combine them here.
const allQuestions = [
    ...additionQuestions,
    ...subtractionQuestions,
    ...multiplicationQuestions,
    ...divisionQuestions
];

// Global variable for allyTop attack choice (default set to 'attack1')
let allyTopAttackChoice = 'attack1';

// --- Helper: Get Character by Name ---
function getCharacterByName(name) {
    switch(name) {
        case 'soldier': return soldier;
        case 'orc': return orc;
        case 'allyTop': return allyTop;
        case 'allyBottom': return allyBottom;
        case 'enemyTop': return enemyTop;
        case 'enemyBottom': return enemyBottom;
        default: return null;
    }
}

// --- Helper: Update Target Selection UI ---
function updateTargetSelectionUI() {
    const container = document.getElementById('target-selection');
    container.innerHTML = '<p>Select a target:</p>';
    if (!orc.dead) {
        const btnOrc = document.createElement('button');
        btnOrc.textContent = 'Orc';
        btnOrc.onclick = () => selectTarget('orc');
        container.appendChild(btnOrc);
    }
    if (!enemyTop.dead) {
        const btnTop = document.createElement('button');
        btnTop.textContent = 'Enemy Top';
        btnTop.onclick = () => selectTarget('enemyTop');
        container.appendChild(btnTop);
    }
    if (!enemyBottom.dead) {
        const btnBottom = document.createElement('button');
        btnBottom.textContent = 'Enemy Bottom';
        btnBottom.onclick = () => selectTarget('enemyBottom');
        container.appendChild(btnBottom);
    }
}

// --- Select Target ---
function selectTarget(target) {
    if (isPlayerTurn && currentUserCharacter) {
        document.getElementById('target-selection').style.display = 'none';
        selectedTarget = target;
        if (currentUserCharacter === soldier) {
            startSoldierAttack();
        } else if (currentUserCharacter === allyTop) {
            startAllyTopAttack();
        } else if (currentUserCharacter === allyBottom) {
            startAllyBottomAttack();
        }
    }
}

// --- Helper: Show Quiz Question via UI ---
function showQuizQuestion(questionText, options, enableTimer = false) {
    return new Promise((resolve) => {
        const container = document.getElementById('quiz-container');
        const questionBox = document.getElementById('quiz-question');
        const answerButtonsContainer = document.getElementById('quiz-answer-buttons');
        const timerElement = document.getElementById('quiz-timer');

        questionBox.textContent = questionText;
        answerButtonsContainer.innerHTML = "";
        container.classList.remove("hidden");
        if (enableTimer) {
            timerElement.classList.remove("hidden");
        } else {
            timerElement.classList.add("hidden");
        }

        options.forEach(option => {
            const btn = document.createElement("button");
            btn.textContent = option;
            btn.addEventListener("click", () => {
                container.classList.add("hidden");
                resolve(option);
            });
            answerButtonsContainer.appendChild(btn);
        });
    });
}

// --- Start Soldier Attack ---
async function startSoldierAttack() {
    let damage = 0;
    if (soldierAttackChoice === 'attack1') {
        damage = await performAttack1Quiz();
    } else if (soldierAttackChoice === 'attack2') {
        damage = await performAttack2Quiz();
    } else if (soldierAttackChoice === 'attack3') {
        damage = await performAttack3Quiz();
    }
    await attackAnimation(soldier, getSpriteFromTarget(selectedTarget));
    applyDamage(selectedTarget, damage);
    currentUserCharacter = null;
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    processTurn();
}

// --- Start AllyTop Attack ---
async function startAllyTopAttack() {
    let damage = 0;
    if (allyTopAttackChoice === 'attack1') {
        damage = await performAttack1Quiz();
    } else if (allyTopAttackChoice === 'attack2') {
        damage = await performAttack2Quiz();
    } else if (allyTopAttackChoice === 'attack3') {
        damage = await performAttack3Quiz();
    }
    await attackAnimation(allyTop, getSpriteFromTarget(selectedTarget));
    applyDamage(selectedTarget, damage);
    currentUserCharacter = null;
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    processTurn();
}

// --- Start AllyBottom Attack ---
async function startAllyBottomAttack() {
    const damage = await performAttack3Quiz();
    await attackAnimation(allyBottom, getSpriteFromTarget(selectedTarget));
    applyDamage(selectedTarget, damage);
    currentUserCharacter = null;
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    processTurn();
}

// --- Choose Soldier Attack ---
function chooseSoldierAttack(choice) {
    soldierAttackChoice = choice;
    document.getElementById('soldier-attack-selection').style.display = 'none';
    currentUserCharacter = soldier;
    updateTargetSelectionUI();
    document.getElementById('target-selection').style.display = 'block';
}

// --- Choose AllyTop Attack ---
function chooseAllyTopAttack(choice) {
    allyTopAttackChoice = choice;
    document.getElementById('allyTop-attack-selection').style.display = 'none';
    currentUserCharacter = allyTop;
    updateTargetSelectionUI();
    document.getElementById('target-selection').style.display = 'block';
}

// --- Win Condition Helpers ---
function isAllEnemiesDead() {
    return orc.dead && enemyTop.dead && enemyBottom.dead;
}
function isAllAlliesDead() {
    return soldier.dead && allyTop.dead && allyBottom.dead;
}

// --- Process Turn ---
// Hides the quiz UI and timer before processing the turn.
function processTurn() {
    // Always hide the quiz UI for the next turn.
    document.getElementById('quiz-container').classList.add("hidden");
    document.getElementById('quiz-timer').classList.add("hidden");
    
    if (isAllEnemiesDead()) {
        alert("Victory! All enemies are defeated.");
        endGame();
        return;
    }
    if (isAllAlliesDead()) {
        alert("Game Over! All allies are defeated.");
        endGame();
        return;
    }
    
    const currentTurnName = turnOrder[currentTurnIndex];
    const currentCharacter = getCharacterByName(currentTurnName);
    if (currentCharacter && currentCharacter.dead) {
        currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
        processTurn();
        return;
    }
    
    if (currentTurnName === 'soldier') {
        isPlayerTurn = true;
        document.getElementById('soldier-attack-selection').style.display = 'block';
        document.getElementById('target-selection').style.display = 'none';
        currentUserCharacter = null;
    } else if (currentTurnName === 'allyTop') {
        isPlayerTurn = true;
        document.getElementById('allyTop-attack-selection').style.display = 'block';
        document.getElementById('target-selection').style.display = 'none';
        currentUserCharacter = null;
    } else if (currentTurnName === 'allyBottom') {
        isPlayerTurn = true;
        updateTargetSelectionUI();
        document.getElementById('target-selection').style.display = 'block';
        currentUserCharacter = allyBottom;
    } else if (
        currentTurnName === 'orc' ||
        currentTurnName === 'enemyTop' ||
        currentTurnName === 'enemyBottom'
    ) {
        isPlayerTurn = false;
        let activeEnemy;
        if (currentTurnName === 'orc') activeEnemy = orc;
        else if (currentTurnName === 'enemyTop') activeEnemy = enemyTop;
        else if (currentTurnName === 'enemyBottom') activeEnemy = enemyBottom;
        enemyTurn(activeEnemy);
    }
}

// --- Enemy Turn ---
async function enemyTurn(activeEnemy) {
    let attacker = activeEnemy;
    const playerTargets = [];
    if (!soldier.dead) playerTargets.push(soldier);
    if (!allyTop.dead) playerTargets.push(allyTop);
    if (!allyBottom.dead) playerTargets.push(allyBottom);
    if (playerTargets.length === 0) return;
    const target = playerTargets[Math.floor(Math.random() * playerTargets.length)];

    await enemyAttackAnimation(attacker, target);

    if (target === soldier) {
        soldierHealth--;
        if (soldierHealth > 0) {
            soldier.takeHit();
        } else {
            soldier.die();
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
    
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    processTurn();
}

// --- Map Target to Sprite ---
function getSpriteFromTarget(target) {
    switch (target) {
        case 'orc': return orc;
        case 'enemyTop': return enemyTop;
        case 'enemyBottom': return enemyBottom;
        default: return orc;
    }
}

// --- Apply Damage ---
function applyDamage(target, amount) {
    if (target === 'orc') {
        wolfHealth = Math.max(0, wolfHealth - amount);
        if (wolfHealth <= 0) {
            orc.die();
        } else {
            orc.takeHit();
        }
    } else if (target === 'enemyTop') {
        enemyTopHealth = Math.max(0, enemyTopHealth - amount);
        if (enemyTopHealth <= 0) {
            enemyTop.die();
        } else {
            enemyTop.takeHit();
        }
    } else if (target === 'enemyBottom') {
        enemyBottomHealth = Math.max(0, enemyBottomHealth - amount);
        if (enemyBottomHealth <= 0) {
            enemyBottom.die();
        } else {
            enemyBottom.takeHit();
        }
    }
}

// --- Quiz Functions for Soldier Attacks ---
// Attack 1: 20-second timer; each correct answer adds 1 damage.
async function performAttack1Quiz() {
    const totalTime = 20; // seconds
    let correctCount = 0;
    let availableQuestions = [...allQuestions];
    const timerElement = document.getElementById('quiz-timer');
    const endTime = Date.now() + totalTime * 1000;
    timerElement.classList.remove("hidden");
    timerElement.textContent = `Time: ${totalTime}s`;
    const timerInterval = setInterval(() => {
        const remaining = Math.ceil((endTime - Date.now()) / 1000);
        if (remaining >= 0) {
            timerElement.textContent = `Time: ${remaining}s`;
        }
    }, 250);
    while (Date.now() < endTime && availableQuestions.length > 0) {
        const remainingTime = endTime - Date.now();
        const index = Math.floor(Math.random() * availableQuestions.length);
        const q = availableQuestions.splice(index, 1)[0];
        const answerPromise = showQuizQuestion(`Attack 1:\n${q.question}`, q.options, true);
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve(null), remainingTime);
        });
        const answer = await Promise.race([answerPromise, timeoutPromise]);
        if (answer === null) break;
        if (Number(answer) === q.correct) {
            correctCount++;
        }
    }
    clearInterval(timerInterval);
    timerElement.classList.add("hidden");
    alert(`You answered ${correctCount} correctly within 20 seconds!`);
    return correctCount;
}

// Attack 2: 15-second timer for 3 questions; if time runs out, quiz stops.
async function performAttack2Quiz() {
    const totalTime = 15; // seconds
    const numQuestions = 3;
    let correctCount = 0;
    let questions = [];
    let availableQuestions = [...allQuestions];
    for (let i = 0; i < numQuestions && availableQuestions.length > 0; i++) {
        const index = Math.floor(Math.random() * availableQuestions.length);
        questions.push(availableQuestions.splice(index, 1)[0]);
    }
    const timerElement = document.getElementById('quiz-timer');
    const endTime = Date.now() + totalTime * 1000;
    timerElement.classList.remove("hidden");
    timerElement.textContent = `Time: ${totalTime}s`;
    const timerInterval = setInterval(() => {
        const remaining = Math.ceil((endTime - Date.now()) / 1000);
        if (remaining >= 0) {
            timerElement.textContent = `Time: ${remaining}s`;
        }
    }, 250);
    for (let q of questions) {
        const remainingTime = endTime - Date.now();
        if (remainingTime <= 0) break;
        const answerPromise = showQuizQuestion(`Attack 2:\n${q.question}`, q.options, true);
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve(null), remainingTime);
        });
        const answer = await Promise.race([answerPromise, timeoutPromise]);
        if (answer === null) break;
        if (Number(answer) === q.correct) {
            correctCount++;
        }
    }
    clearInterval(timerInterval);
    timerElement.classList.add("hidden");
    alert(`You answered ${correctCount} out of ${numQuestions} correctly!`);
    return (correctCount === numQuestions) ? 40 : correctCount * 10;
}

// Attack 3: No timer is shown.
async function performAttack3Quiz() {
    let availableQuestions = [...allQuestions];
    const index = Math.floor(Math.random() * availableQuestions.length);
    const q = availableQuestions[index];
    const startTime = Date.now();
    // Pass false for enableTimer so that the timer is not shown.
    const answer = await showQuizQuestion(`Attack 3:\n${q.question}`, q.options, false);
    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTime) / 1000;
    if (Number(answer) === q.correct) {
        const damage = Math.max(0, Math.round(30 - elapsedSeconds * 5));
        alert(`Correct! You answered in ${elapsedSeconds.toFixed(2)} seconds, dealing ${damage} damage!`);
        return damage;
    } else {
        alert(`Incorrect answer! No damage dealt.`);
        return 0;
    }
}
