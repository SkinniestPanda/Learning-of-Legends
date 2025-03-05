// student.js

const questions = [
  { id: 1, question: "5 + 3 = ?", correctAnswer: 8, operation: "addition" },
  { id: 2, question: "10 - 4 = ?", correctAnswer: 6, operation: "subtraction" },
  { id: 3, question: "3 * 4 = ?", correctAnswer: 12, operation: "multiplication" },
  { id: 4, question: "16 / 4 = ?", correctAnswer: 4, operation: "division" }
];

let currentQuestionIndex = 0;

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    currentQuestionIndex = 0;
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
  const isCorrect = (answer === currentQuestion.correctAnswer);

  const feedbackEl = document.getElementById("feedback");
  if (isCorrect) {
    feedbackEl.textContent = "Correct!";
    feedbackEl.style.color = "green";
  } else {
    feedbackEl.textContent = `Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`;
    feedbackEl.style.color = "red";
  }
  
  // Build attempt object (adjust studentId as needed)
  const attempt = {
    studentId: "student_001",  // In a real app, obtain dynamically.
    question: currentQuestion.question,
    correctAnswer: currentQuestion.correctAnswer,
    studentAnswer: answer,
    isCorrect: isCorrect,
    operation: currentQuestion.operation,
    timestamp: Date.now()
  };

  // Record attempt to the database via API
  recordAttempt(attempt);
  
  document.getElementById("nextQuestionBtn").style.display = "block";
}

document.getElementById("submitAnswerBtn").addEventListener("click", checkAnswer);
document.getElementById("nextQuestionBtn").addEventListener("click", () => {
  currentQuestionIndex++;
  loadQuestion();
});

window.addEventListener("load", loadQuestion);
