// teacher.js

// Helper: Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function loadDashboard() {
  try {
    // Fetch attempts from API
    const response = await fetch('/api/attempts');
    const attempts = await response.json();

    // Filter if a dropdown is selected
    const filterDropdown = document.getElementById("filterDropdown");
    let filteredAttempts = attempts;
    if (filterDropdown && filterDropdown.value !== "all") {
      filteredAttempts = attempts.filter(a => {
        const op = a.operation ? a.operation.toLowerCase() : "unknown";
        return op === filterDropdown.value.toLowerCase();
      });
    }

    // Compute overall stats
    const totalQuestions = filteredAttempts.length;
    const correctAnswers = filteredAttempts.filter(a => a.isCorrect).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentageCorrect = totalQuestions ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;

    // Update DOM stats
    document.getElementById("totalQuestions").textContent = totalQuestions;
    document.getElementById("correctAnswers").textContent = correctAnswers;
    document.getElementById("wrongAnswers").textContent = wrongAnswers;
    document.getElementById("percentageCorrect").textContent = percentageCorrect;

    // Overall analysis text
    let overallAnalysis = "";
    if (percentageCorrect >= 70) {
      overallAnalysis = "Overall, the student demonstrates an excellent understanding of the question types.";
    } else if (percentageCorrect >= 40) {
      overallAnalysis = "Overall, the student shows a good understanding but has room for improvement.";
    } else if (percentageCorrect >= 10) {
      overallAnalysis = "Overall, the student exhibits a weak understanding and needs additional practice.";
    } else {
      overallAnalysis = "Overall, the student shows little understanding and should receive further help.";
    }

    // Group by question type
    const typeResults = {};
    filteredAttempts.forEach(attempt => {
      const op = attempt.operation ? attempt.operation.toLowerCase() : "unknown";
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

    // Detailed type analysis
    let detailedTypeSummary = "";
    for (const op in typeResults) {
      const total = typeResults[op].total;
      const correct = typeResults[op].correct;
      const percent = total ? ((correct / total) * 100).toFixed(1) : 0;
      let opFeedback = "";
      if (percent >= 90) {
        opFeedback = "Excellent mastery! The student has a strong command of this topic—challenge them further with more complex problems.";
      } else if (percent >= 70) {
        opFeedback = "Very good performance. The student understands most concepts well but could benefit from reviewing a few minor areas.";
      } else if (percent >= 50) {
        opFeedback = "Fair understanding. Key concepts are grasped, yet some areas need focused review and additional practice.";
      } else if (percent >= 30) {
        opFeedback = "Below average performance. The student should revisit foundational concepts and practice more problems in this area.";
      } else {
        opFeedback = "Poor performance. The student is struggling significantly with this topic and needs targeted help and extensive practice.";
      }
      detailedTypeSummary += `<br><strong>${capitalize(op)}:</strong> ${correct}/${total} (${percent}%) – ${opFeedback} <br>`;
    }

    // Insert the combined text into #analysisSummary
    document.getElementById("analysisSummary").innerHTML = overallAnalysis + detailedTypeSummary;

    // Render overall pie chart
    renderOverallChart(correctAnswers, wrongAnswers);

    // Render type-specific charts
    renderTypeCharts(typeResults);

    // Wrong attempts
    const wrongAttempts = filteredAttempts.filter(a => !a.isCorrect);
    const wrongAttemptsList = document.getElementById("wrongAttemptsList");
    wrongAttemptsList.innerHTML = "";
    if (wrongAttempts.length > 0) {
      wrongAttempts.forEach(attempt => {
        const li = document.createElement("li");
        const attemptDate = new Date(attempt.timestamp);
        li.innerHTML = `
          <strong>Question:</strong> "${attempt.question}"<br>
          <strong>Type:</strong> ${attempt.operation || "unknown"}<br>
          <strong>Student's Answer:</strong> ${attempt.studentAnswer}<br>
          <strong>Correct Answer:</strong> ${attempt.correctAnswer}<br>
          <strong>Attempted on:</strong> ${attemptDate.toLocaleString()}
        `;
        wrongAttemptsList.appendChild(li);
      });
    } else {
      wrongAttemptsList.innerHTML = "<li>No wrong attempts recorded.</li>";
    }

    // Questions answered
    const questionsAnsweredList = document.getElementById("questionsAnsweredList");
    questionsAnsweredList.innerHTML = "";
    filteredAttempts.forEach(result => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>Question:</strong> ${result.question} - <strong>Student's Answer:</strong> ${result.studentAnswer} - <strong>Status:</strong> ${result.isCorrect ? "Correct" : "Wrong"}`;
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
        title: { display: true, text: 'Overall Student Performance' }
      }
    }
  });
}

function renderTypeCharts(typeResults) {
  const chartsContainer = document.getElementById("chartsContainer");
  chartsContainer.innerHTML = ""; // Clear previous charts
  for (const op in typeResults) {
    const chartDiv = document.createElement("div");

    // Title
    const heading = document.createElement("h4");
    heading.textContent = capitalize(op);
    chartDiv.appendChild(heading);

    // Canvas for chart
    const canvas = document.createElement("canvas");
    canvas.id = `chart-${op}`;
    canvas.width = 180;
    canvas.height = 180;
    chartDiv.appendChild(canvas);

    chartsContainer.appendChild(chartDiv);

    // Render a doughnut chart for each question type
    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: 'doughnut',
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
          legend: { position: 'bottom' },
          title: { display: true, text: `${capitalize(op)} Performance` }
        }
      }
    });
  }
}

// Function to toggle a section's visibility and update the button text
function toggleSection(containerId, buttonId) {
  const container = document.getElementById(containerId);
  const button = document.getElementById(buttonId);
  if (container.style.display === "none") {
    container.style.display = "block";
    button.textContent = "Minimize";
  } else {
    container.style.display = "none";
    button.textContent = "Expand";
  }
}

// Add event listeners for the expand/minimize buttons
document.getElementById("toggleWrongAttempts").addEventListener("click", function() {
  toggleSection("wrongAttemptsContainer", "toggleWrongAttempts");
});

document.getElementById("toggleQuestionsAnswered").addEventListener("click", function() {
  toggleSection("questionsAnsweredContainer", "toggleQuestionsAnswered");
});

// Listen for filter changes
const filterDropdown = document.getElementById("filterDropdown");
if (filterDropdown) {
  filterDropdown.addEventListener("change", loadDashboard);
}

// Load the dashboard
window.addEventListener("load", loadDashboard);
