/**********************************
 * Student Flash Questions Logic
 **********************************/

// Define a sample set of arithmetic questions.
const questions = [
    { id: 1, question: "5 + 3 = ?", correctAnswer: 8, operation: "addition" },
    { id: 2, question: "10 - 4 = ?", correctAnswer: 6, operation: "subtraction" },
    { id: 3, question: "3 * 4 = ?", correctAnswer: 12, operation: "multiplication" },
    { id: 4, question: "16 / 4 = ?", correctAnswer: 4, operation: "division" }
  ];
  
  let currentQuestionIndex = 0;
  
  // Function to save an attempt (the student's answer) to localStorage.
  function saveAttempt(attempt) {
    // Retrieve existing attempts (if any), then add the new one.
    let attempts = JSON.parse(localStorage.getItem("attempts")) || [];
    attempts.push(attempt);
    localStorage.setItem("attempts", JSON.stringify(attempts));
  }
  
  // Function to load and display the current question.
  function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
      // Restart from the first question if we've gone through all.
      currentQuestionIndex = 0;
    }
    const questionObj = questions[currentQuestionIndex];
    document.getElementById("questionText").textContent = questionObj.question;
    document.getElementById("answerInput").value = "";
    document.getElementById("feedback").textContent = "";
    document.getElementById("nextQuestionBtn").style.display = "none";
  }
  
  // Function to check the student's answer.
  function checkAnswer() {
    const questionObj = questions[currentQuestionIndex];
    const answer = Number(document.getElementById("answerInput").value);
    const isCorrect = answer === questionObj.correctAnswer;
    const feedbackEl = document.getElementById("feedback");
    
    if (isCorrect) {
      feedbackEl.style.color = "green";
      feedbackEl.textContent = "Correct!";
    } else {
      feedbackEl.style.color = "red";
      feedbackEl.textContent = `Incorrect. The correct answer is ${questionObj.correctAnswer}.`;
    }
    
    // Create an object to record the student's attempt.
    const attempt = {
      id: questionObj.id,
      question: questionObj.question,
      correctAnswer: questionObj.correctAnswer,
      studentAnswer: answer,
      isCorrect: isCorrect,
      operation: questionObj.operation,
      timestamp: Date.now()
    };
    
    // Save the attempt to our "rough database" (localStorage).
    saveAttempt(attempt);
    
    // Show the "Next Question" button so the student can continue.
    document.getElementById("nextQuestionBtn").style.display = "inline-block";
  }
  
  // Set up event listeners.
  document.getElementById("submitAnswerBtn").addEventListener("click", checkAnswer);
  document.getElementById("nextQuestionBtn").addEventListener("click", () => {
    currentQuestionIndex++;
    loadQuestion();
  });
  
  // Load the first question when the page loads.
  window.onload = loadQuestion;
  