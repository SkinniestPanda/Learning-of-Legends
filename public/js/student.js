// student.js

// If using ES modules:
import { additionQuestions } from '../questions/addition.js';
import { subtractionQuestions } from '../questions/subtraction.js';
import { multiplicationQuestions } from '../questions/multiplication.js';
import { divisionQuestions } from '../questions/division.js';

// Merge all questions into one array
let questions = [
  ...additionQuestions,
  ...subtractionQuestions,
  ...multiplicationQuestions,
  ...divisionQuestions
];

// Shuffle the questions array using Fisher-Yates algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Shuffle the questions array
questions = shuffle(questions);

let currentQuestionIndex = 0;

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    currentQuestionIndex = 0; // Optionally, you can reshuffle if you want a new order for each cycle
  }
  const currentQuestion = questions[currentQuestionIndex];
  document.getElementById("questionText").textContent = currentQuestion.question;
  document.getElementById("answerInput").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("nextQuestionBtn").style.display = "none";
}

async function recordAttempt(attempt) {
  try {
    const response = await fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt)
    });
    const data = await response.json();
    console.log("Attempt recorded with ID:", data.id);
  } catch (err) {
    console.error("Error recording attempt:", err);
  }
}

function checkAnswer() {
  const currentQuestion = questions[currentQuestionIndex];
  const answer = Number(document.getElementById("answerInput").value);
  const isCorrect = answer === currentQuestion.correctAnswer;
  
  const feedbackEl = document.getElementById("feedback");
  if (isCorrect) {
    feedbackEl.textContent = "Correct!";
    feedbackEl.style.color = "green";
  } else {
    feedbackEl.textContent = `Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`;
    feedbackEl.style.color = "red";
  }
  
  const attempt = {
    studentId: "student_001", // Replace with a dynamic identifier if available
    question: currentQuestion.question,
    correctAnswer: currentQuestion.correctAnswer,
    studentAnswer: answer,
    isCorrect: isCorrect,
    operation: currentQuestion.operation,
    source: "questions/" + currentQuestion.operation + ".js", // Optional: indicates file source
    timestamp: Date.now()
  };

  recordAttempt(attempt);
  document.getElementById("nextQuestionBtn").style.display = "block";
}

document.getElementById("submitAnswerBtn").addEventListener("click", checkAnswer);
document.getElementById("nextQuestionBtn").addEventListener("click", () => {
  currentQuestionIndex++;
  loadQuestion();
});

window.addEventListener("load", loadQuestion);
