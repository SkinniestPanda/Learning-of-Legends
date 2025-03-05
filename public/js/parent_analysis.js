// parent_analysis.js

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function loadDashboard() {
  try {
    const response = await fetch('/api/attempts');
    const attempts = await response.json();

    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentageCorrect = totalQuestions ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;

    document.getElementById("totalQuestions").textContent = totalQuestions;
    document.getElementById("correctAnswers").textContent = correctAnswers;
    document.getElementById("wrongAnswers").textContent = wrongAnswers;
    document.getElementById("percentageCorrect").textContent = percentageCorrect;

    let overallAnalysis = "";
    if (percentageCorrect >= 70) {
      overallAnalysis = "Overall, your child has an excellent understanding of the question types.";
    } else if (percentageCorrect >= 40) {
      overallAnalysis = "Overall, your child has a good understanding but could improve in some areas.";
    } else if (percentageCorrect >= 10) {
      overallAnalysis = "Overall, your child shows a weak understanding and may need more practice.";
    } else {
      overallAnalysis = "Overall, your child has little understanding and should seek additional help.";
    }

    const typeResults = {};
    attempts.forEach(attempt => {
      const op = attempt.operation.toLowerCase();
      if (!typeResults[op]) {
        typeResults[op] = { correct: 0, wrong: 0, total: 0 };
      }
      typeResults[op].total++;
      if (attempt.isCorrect) typeResults[op].correct++;
      else typeResults[op].wrong++;
    });

    let detailedTypeSummary = "";
    for (const op in typeResults) {
      const total = typeResults[op].total;
      const correct = typeResults[op].correct;
      const percent = total ? ((correct / total) * 100).toFixed(1) : 0;
      let opAnalysis = "";
      if (percent >= 70) opAnalysis = "has an excellent understanding";
      else if (percent >= 40) opAnalysis = "has a good understanding with room for improvement";
      else opAnalysis = "needs significant improvement";
      detailedTypeSummary += `<br><strong>${capitalize(op)}:</strong> ${correct}/${total} (${percent}%) – your child ${opAnalysis}.`;
    }

    document.getElementById("textAnalysis").innerHTML = overallAnalysis + detailedTypeSummary;

    // Render overall pie chart (optional)
    renderOverallChart(correctAnswers, wrongAnswers);

    // Populate wrong attempts list
    const wrongAttempts = attempts.filter(a => !a.isCorrect);
    const wrongAttemptsList = document.getElementById("wrongAttemptsList");
    wrongAttemptsList.innerHTML = "";
    if (wrongAttempts.length > 0) {
      wrongAttempts.forEach(attempt => {
        const li = document.createElement("li");
        const attemptDate = new Date(attempt.timestamp);
        li.innerHTML = `
          <strong>Question:</strong> "${attempt.question}"<br>
          <strong>Type:</strong> ${attempt.operation}<br>
          <strong>Your Child's Answer:</strong> ${attempt.studentAnswer}<br>
          <strong>Correct Answer:</strong> ${attempt.correctAnswer}<br>
          <strong>Attempted on:</strong> ${attemptDate.toLocaleString()}
        `;
        wrongAttemptsList.appendChild(li);
      });
    } else {
      wrongAttemptsList.innerHTML = "<li>No wrong attempts recorded.</li>";
    }

    // Populate questions answered list
    const questionsAnsweredList = document.getElementById("questionsAnsweredList");
    questionsAnsweredList.innerHTML = "";
    attempts.forEach(result => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>Question:</strong> ${result.question} - <strong>Your Child's Answer:</strong> ${result.studentAnswer} - <strong>Status:</strong> ${result.isCorrect ? "Correct" : "Wrong"}`;
      questionsAnsweredList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
}

function renderOverallChart(correct, wrong) {
  const ctx = document.getElementById('resultsChart').getContext('2d');
  if (window.resultsChartInstance) {
    window.resultsChartInstance.destroy();
  }
  window.resultsChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Correct', 'Wrong'],
      datasets: [{
        data: [correct, wrong],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Overall Child Performance' }
      }
    }
  });
}

window.addEventListener("load", loadDashboard);
