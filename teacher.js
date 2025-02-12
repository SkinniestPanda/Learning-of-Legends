/**********************************
 * Teacher / Parent Dashboard Logic
 **********************************/

function loadDashboard() {
  // Retrieve attempts from localStorage.
  const attempts = JSON.parse(localStorage.getItem("attempts")) || [];
  const totalQuestions = attempts.length;
  const correctAnswers = attempts.filter(a => a.isCorrect).length;
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentageCorrect = totalQuestions ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;
  
  // Update the HTML elements with the computed statistics.
  document.getElementById("totalQuestions").textContent = totalQuestions;
  document.getElementById("correctAnswers").textContent = correctAnswers;
  document.getElementById("wrongAnswers").textContent = wrongAnswers;
  document.getElementById("percentageCorrect").textContent = percentageCorrect;
  
  // Build breakdown by arithmetic operation.
  const breakdown = attempts.reduce((acc, attempt) => {
    acc[attempt.operation] = (acc[attempt.operation] || 0) + 1;
    return acc;
  }, {});
  
  const breakdownList = document.getElementById("breakdownList");
  breakdownList.innerHTML = "";
  for (const op in breakdown) {
    const li = document.createElement("li");
    li.textContent = `${op}: ${breakdown[op]} question(s)`;
    breakdownList.appendChild(li);
  }
  
  // New: Build a list of wrong attempts with detailed info.
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
        <strong>Your Answer:</strong> ${attempt.studentAnswer}<br>
        <strong>Correct Answer:</strong> ${attempt.correctAnswer}<br>
        <strong>Attempted on:</strong> ${attemptDate.toLocaleString()}
        <br><br>
      `;
      wrongAttemptsList.appendChild(li);
    });
  } else {
    wrongAttemptsList.innerHTML = "<li>No wrong attempts recorded.</li>";
  }
  
  // Render the performance pie chart.
  renderChart(correctAnswers, wrongAnswers);
}

// Function to render the pie chart using Chart.js.
function renderChart(correct, wrong) {
  const ctx = document.getElementById('resultsChart').getContext('2d');
  
  // Destroy any previous chart instance to avoid duplicate charts.
  if (window.resultsChartInstance) {
    window.resultsChartInstance.destroy();
  }
  
  window.resultsChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Correct', 'Wrong'],
      datasets: [{
        label: 'Student Performance',
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
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Student Performance Analysis'
        }
      }
    }
  });
}

// Set up the "Clear Data" button to remove the stored attempts.
document.getElementById("clearDataBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all student data?")) {
    localStorage.removeItem("attempts");
    loadDashboard();
  }
});

// Load the dashboard when the page loads.
window.onload = loadDashboard;
