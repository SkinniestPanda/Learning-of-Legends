const allQuestions = [
    ...additionQuestions,
    ...subtractionQuestions,
    ...multiplicationQuestions,
    ...divisionQuestions
  ];
  
  function selectTarget(target) {
      if (isPlayerTurn && currentUserCharacter) {
          // Hide the target selection UI so the quiz UI can be shown.
          document.getElementById('target-selection').style.display = 'none';
          selectedTarget = target;
          if (currentUserCharacter === soldier) {
              startSoldierAttack();
          } else if (currentUserCharacter === allyTop || currentUserCharacter === allyBottom) {
              userAllyAttack(currentUserCharacter, target);
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
  
          // Set question text and clear previous answer buttons.
          questionBox.textContent = questionText;
          answerButtonsContainer.innerHTML = "";
          container.classList.remove("hidden");
          if (enableTimer) {
              timerElement.classList.remove("hidden");
          } else {
              timerElement.classList.add("hidden");
          }
  
          // Create a button for each option.
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
  
  // --- Modified Soldier Attack Using Quiz UI ---
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
  
  // --- Function for Ally Attack ---
  async function userAllyAttack(ally, target) {
      await attackAnimation(ally, getSpriteFromTarget(target));
      applyDamage(target, 8); // Fixed damage for simplicity
      currentUserCharacter = null;
      currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
      processTurn();
  }
  
  // --- Process Turn ---
  function processTurn() {
      const currentTurn = turnOrder[currentTurnIndex];
      if (currentTurn === 'soldier') {
          isPlayerTurn = true;
          document.getElementById('soldier-attack-selection').style.display = 'block';
          document.getElementById('target-selection').style.display = 'none';
          currentUserCharacter = null;
      } else if (currentTurn === 'allyTop') {
          isPlayerTurn = true;
          document.getElementById('target-selection').style.display = 'block';
          currentUserCharacter = allyTop;
      } else if (currentTurn === 'allyBottom') {
          isPlayerTurn = true;
          document.getElementById('target-selection').style.display = 'block';
          currentUserCharacter = allyBottom;
      } else if (currentTurn === 'orc' || currentTurn === 'enemyTop' || currentTurn === 'enemyBottom') {
          isPlayerTurn = false;
          let activeEnemy;
          if (currentTurn === 'orc') activeEnemy = orc;
          else if (currentTurn === 'enemyTop') activeEnemy = enemyTop;
          else if (currentTurn === 'enemyBottom') activeEnemy = enemyBottom;
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
  
      await attackAnimation(attacker, target);
  
      if (target === soldier) {
          soldierHealth--;
          if (soldierHealth > 0) {
              soldier.takeHit();
          } else {
              soldier.die();
              setTimeout(() => endGame(), 2000);
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
  
  // --- Helper: Choose Soldier Attack ---
  function chooseSoldierAttack(choice) {
      soldierAttackChoice = choice;
      document.getElementById('soldier-attack-selection').style.display = 'none';
      currentUserCharacter = soldier;
      document.getElementById('target-selection').style.display = 'block';
  }
  
  // --- Helper: Map Target String to Sprite ---
  function getSpriteFromTarget(target) {
      switch (target) {
          case 'orc': return orc;
          case 'enemyTop': return enemyTop;
          case 'enemyBottom': return enemyBottom;
          default: return orc;
      }
  }
  
  // --- Helper: Apply Damage ---
  function applyDamage(target, amount) {
      if (target === 'orc') {
          wolfHealth -= amount;
          if (wolfHealth <= 0) {
              orc.die();
              setTimeout(() => endGame(), 2000);
          } else {
              orc.takeHit();
          }
      } else if (target === 'enemyTop') {
          enemyTopHealth -= amount;
          if (enemyTopHealth <= 0) {
              enemyTop.die();
              setTimeout(() => endGame(), 2000);
          } else {
              enemyTop.takeHit();
          }
      } else if (target === 'enemyBottom') {
          enemyBottomHealth -= amount;
          if (enemyBottomHealth <= 0) {
              enemyBottom.die();
              setTimeout(() => endGame(), 2000);
          } else {
              enemyBottom.takeHit();
          }
      }
  }
  
  // === NEW QUIZ FUNCTIONS FOR SOLDIER ATTACKS USING THE UI ===
  
  // ---------- Attack 1 with a 20-second Timer ----------
  // In Attack 1, the player has 20 seconds to answer as many questions as possible.
  // Each correctly answered question adds 1 damage.
  async function performAttack1Quiz() {
      const totalTime = 20; // seconds
      let correctCount = 0;
      let availableQuestions = [...allQuestions];
      const timerElement = document.getElementById('quiz-timer');
      const endTime = Date.now() + totalTime * 1000;
  
      // Show timer and initialize its text.
      timerElement.classList.remove("hidden");
      timerElement.textContent = `Time: ${totalTime}s`;
  
      // Update the timer display periodically.
      const timerInterval = setInterval(() => {
          const remaining = Math.ceil((endTime - Date.now()) / 1000);
          if (remaining >= 0) {
              timerElement.textContent = `Time: ${remaining}s`;
          }
      }, 250);
  
      // Loop: ask questions until time runs out or no questions remain.
      while (Date.now() < endTime && availableQuestions.length > 0) {
          const remainingTime = endTime - Date.now();
          const index = Math.floor(Math.random() * availableQuestions.length);
          const q = availableQuestions.splice(index, 1)[0];
  
          // Use Promise.race: either the player answers or the remaining time elapses.
          const answerPromise = showQuizQuestion(`Attack 1:\n${q.question}`, q.options, false);
          const timeoutPromise = new Promise((resolve) => {
              setTimeout(() => resolve(null), remainingTime);
          });
          const answer = await Promise.race([answerPromise, timeoutPromise]);
          if (answer === null) {
              break; // Time's up during waiting for an answer.
          }
          if (Number(answer) === q.correct) {
              correctCount++;
          }
      }
      clearInterval(timerInterval);
      timerElement.classList.add("hidden");
      alert(`You answered ${correctCount} correctly within 20 seconds!`);
      return correctCount;  // Damage equals the number of correct answers.
  }
  
  // ---------- Attack 2: Answer 3 random questions. Perfect score deals 40 damage; otherwise, 10 damage per correct answer.
  async function performAttack2Quiz() {
      const numQuestions = 3;
      let correctCount = 0;
      let questions = [];
      let availableQuestions = [...allQuestions];
      for (let i = 0; i < numQuestions && availableQuestions.length > 0; i++) {
          const index = Math.floor(Math.random() * availableQuestions.length);
          questions.push(availableQuestions.splice(index, 1)[0]);
      }
      for (const q of questions) {
          const answer = await showQuizQuestion(`Attack 2:\n${q.question}`, q.options);
          if (Number(answer) === q.correct) {
              correctCount++;
          }
      }
      alert(`You answered ${correctCount} out of ${numQuestions} correctly!`);
      return (correctCount === numQuestions) ? 40 : correctCount * 10;
  }
  
  // ---------- Attack 3: Answer one question as fast as you can—the faster the correct answer, the higher the damage.
  async function performAttack3Quiz() {
      let availableQuestions = [...allQuestions];
      const index = Math.floor(Math.random() * availableQuestions.length);
      const q = availableQuestions[index];
      const startTime = Date.now();
      const answer = await showQuizQuestion(`Attack 3:\n${q.question}`, q.options, true);
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