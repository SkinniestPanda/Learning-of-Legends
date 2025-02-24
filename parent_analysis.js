/**********************************
 * Parent Analysis Dashboard Logic
 **********************************/

function loadDashboard() {
  // Get the selected filter value from the dropdown.
  const filter = document.getElementById("filterDropdown").value;
  
  // Retrieve your child's attempts from localStorage.
  let attempts = JSON.parse(localStorage.getItem("attempts")) || [];
  
  // If a specific type is selected, filter the attempts.
  if (filter !== "all") {
    attempts = attempts.filter(a => a.operation.toLowerCase() === filter.toLowerCase());
  }
  
  // Compute summary data.
  const totalQuestions = attempts.length;
  const correctAnswers = attempts.filter(a => a.isCorrect).length;
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentageCorrect = totalQuestions ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;
  
  // Update overall statistics.
  document.getElementById("totalQuestions").textContent = totalQuestions;
  document.getElementById("correctAnswers").textContent = correctAnswers;
  document.getElementById("wrongAnswers").textContent = wrongAnswers;
  document.getElementById("percentageCorrect").textContent = percentageCorrect;
  
  // Compute overall text analysis for your child's performance.
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
  
  // Build a detailed type summary.
  let detailedTypeSummary = "";
  for (const op in typeResults) {
    const total = typeResults[op].total;
    const correct = typeResults[op].correct;
    const percent = total ? ((correct / total) * 100).toFixed(1) : 0;
    let opAnalysis = "";
    if (percent >= 70) {
      opAnalysis = "has an excellent understanding";
    } else if (percent >= 40) {
      opAnalysis = "has a good understanding with room for improvement";
    } else {
      opAnalysis = "needs significant improvement";
    }
    detailedTypeSummary += `<br><strong>${op.charAt(0).toUpperCase() + op.slice(1)}:</strong> ${correct}/${total} (${percent}%) - your child ${opAnalysis}.`;
  }
  
  // Combine overall and detailed type summaries.
  document.getElementById("textAnalysis").innerHTML = overallAnalysis + detailedTypeSummary;
  
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
        <strong>Your Child's Answer:</strong> ${attempt.studentAnswer}<br>
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
  
  // Create type-specific charts and text summaries.
  createTypeCharts(attempts);
  
  // Populate the questions answered list.
  const questionsAnsweredList = document.getElementById("questionsAnsweredList");
  if (questionsAnsweredList) {
    questionsAnsweredList.innerHTML = "";
    attempts.forEach(result => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>Question:</strong> ${result.question} - <strong>Your Child's Answer:</strong> ${result.studentAnswer} - <strong>Status:</strong> ${result.isCorrect ? "Correct" : "Wrong"}`;
      questionsAnsweredList.appendChild(li);
    });
  }
}

// Function to render the overall performance pie chart.
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
        label: 'Child Performance',
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

// Function to create pie charts and text summaries for each question type.
function createTypeCharts(attempts) {
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
  
  const chartsContainer = document.getElementById("chartsContainer");
  chartsContainer.innerHTML = "";
  
  const analysisSummary = document.getElementById("analysisSummary");
  analysisSummary.innerHTML = "";
  
  for (const op in typeResults) {
    // Create a container for the chart.
    const opContainer = document.createElement("div");
    opContainer.style.marginBottom = "20px";
    opContainer.style.border = "1px solid #ccc";
    opContainer.style.padding = "10px";
    
    // Create a canvas for the chart.
    const canvas = document.createElement("canvas");
    canvas.id = `chart-${op}`;
    canvas.width = 300;
    canvas.height = 300;
    opContainer.appendChild(canvas);
    chartsContainer.appendChild(opContainer);
    
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
    
    // Create a text summary for this type.
    const total = typeResults[op].total;
    const correct = typeResults[op].correct;
    const percent = total ? ((correct / total) * 100).toFixed(1) : 0;
    const summaryText = document.createElement("p");
    summaryText.innerHTML = `<strong>${op.charAt(0).toUpperCase() + op.slice(1)}:</strong> Total Attempts: ${total}, Correct: ${correct}, Wrong: ${typeResults[op].wrong}, Percentage Correct: ${percent}%`;
    analysisSummary.appendChild(summaryText);
  }
}

// Set up the dropdown event listener to filter the dashboard.
document.getElementById("filterDropdown").addEventListener("change", loadDashboard);

// Set up the "Clear Data" button functionality.
document.getElementById("clearDataBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all child data?")) {
    localStorage.removeItem("attempts");
    loadDashboard();
  }
});

// Load the dashboard when the page loads.
window.onload = loadDashboard;
