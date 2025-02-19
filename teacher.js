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
  
  // Update overall performance statistics.
  document.getElementById("totalQuestions").textContent = totalQuestions;
  document.getElementById("correctAnswers").textContent = correctAnswers;
  document.getElementById("wrongAnswers").textContent = wrongAnswers;
  document.getElementById("percentageCorrect").textContent = percentageCorrect;
  
  // Build breakdown by arithmetic operation (simple list).
  const breakdown = attempts.reduce((acc, attempt) => {
    acc[attempt.operation] = (acc[attempt.operation] || 0) + 1;
    return acc;
  }, {});
  
  const breakdownList = document.getElementById("breakdownList");
  if (breakdownList) {
    breakdownList.innerHTML = "";
    for (const op in breakdown) {
      const li = document.createElement("li");
      li.textContent = `${op}: ${breakdown[op]} question(s)`;
      breakdownList.appendChild(li);
    }
  }
  
  // Build a list of wrong attempts details.
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
      `;
      wrongAttemptsList.appendChild(li);
    });
  } else {
    wrongAttemptsList.innerHTML = "<li>No wrong attempts recorded.</li>";
  }
  
  // Render the overall performance pie chart.
  renderOverallChart(correctAnswers, wrongAnswers);
  
  // Create pie charts and text summaries for each question type.
  createTypeCharts(attempts);
}

// Function to render the overall performance pie chart.
function renderOverallChart(correct, wrong) {
  const ctx = document.getElementById('resultsChart').getContext('2d');
  
  // Destroy any previous chart instance to avoid duplicates.
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
        legend: { position: 'top' },
        title: { display: true, text: 'Overall Student Performance' }
      }
    }
  });
}

// Function to create pie charts and text summaries for each question type.
function createTypeCharts(attempts) {
  // Group attempts by question type.
  const typeResults = {};
  attempts.forEach(attempt => {
    const op = attempt.operation;
    if (!typeResults[op]) {
      typeResults[op] = { correct: 0, wrong: 0, total: 0 };
    }
    typeResults[op].total++;
    if (attempt.isCorrect) {
      typeResults[op].correct++;
    } else {
      typeResults[op].wrong++;
    }
  });
  
  // Containers for the charts and text summaries.
  const chartsContainer = document.getElementById("chartsContainer");
  chartsContainer.innerHTML = ""; // Clear any previous charts.
  
  const analysisSummary = document.getElementById("analysisSummary");
  analysisSummary.innerHTML = ""; // Clear previous summaries.
  
  // For each question type, create a pie chart and a text summary.

for (const op in typeResults) {
  // Create a container for the current question type.
  const opContainer = document.createElement("div");
  opContainer.style.marginBottom = "20px";
  opContainer.style.border = "1px solid #ccc";
  opContainer.style.padding = "10px";
  
  // Create a canvas for the pie chart.
  const canvas = document.createElement("canvas");
  canvas.id = `chart-${op}`;
  // Set fixed dimensions to ensure a square chart.
  canvas.width = 300;
  canvas.height = 300;
  opContainer.appendChild(canvas);
  chartsContainer.appendChild(opContainer);
  



    
    // Create the pie chart for this question type.
    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Correct', 'Wrong'],
        datasets: [{
          data: [typeResults[op].correct, typeResults[op].wrong],
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
          title: { 
            display: true, 
            text: `Performance in ${op.charAt(0).toUpperCase() + op.slice(1)}` 
          }
        }
      }
    });
    
    // Create a text summary for the current question type.
    const total = typeResults[op].total;
    const correct = typeResults[op].correct;
    const wrong = typeResults[op].wrong;
    const percent = total ? ((correct / total) * 100).toFixed(1) : 0;
    const summaryText = document.createElement("p");
    summaryText.innerHTML = `<strong>${op.charAt(0).toUpperCase() + op.slice(1)}:</strong> Total Attempts: ${total}, Correct: ${correct}, Wrong: ${wrong}, Percentage Correct: ${percent}%`;
    analysisSummary.appendChild(summaryText);
  }
}

// Set up the "Clear Data" button to remove stored attempts.
document.getElementById("clearDataBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all student data?")) {
    localStorage.removeItem("attempts");
    loadDashboard();
  }
});

// Load the dashboard when the page loads.
window.onload = loadDashboard;
