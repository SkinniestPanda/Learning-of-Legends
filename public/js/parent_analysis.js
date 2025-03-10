// parent_analysis.js

// Helper function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Main function to load and process student attempt data
async function loadDashboard() {
  try {
    // Fetch all attempts from the API endpoint
    const response = await fetch('/api/attempts');
    const attempts = await response.json();

    // Apply filtering based on dropdown selection (if any)
    const filterDropdown = document.getElementById("filterDropdown");
    let filteredAttempts = attempts;
    if (filterDropdown && filterDropdown.value !== "all") {
      filteredAttempts = attempts.filter(a => {
        const op = a.operation ? a.operation.toLowerCase() : "unknown";
        return op === filterDropdown.value.toLowerCase();
      });
    }

    // Compute overall statistics
    const totalQuestions = filteredAttempts.length;
    const correctAnswers = filteredAttempts.filter(a => a.isCorrect).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentageCorrect = totalQuestions ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;

    // Update overall stats in the DOM
    document.getElementById("totalQuestions").textContent = totalQuestions;
    document.getElementById("correctAnswers").textContent = correctAnswers;
    document.getElementById("wrongAnswers").textContent = wrongAnswers;
    document.getElementById("percentageCorrect").textContent = percentageCorrect;

    // Build overall performance analysis summary (parent perspective)
    let overallAnalysis = "";
    if (percentageCorrect >= 70) {
      overallAnalysis = "Overall, your child has an excellent understanding of the question types.";
    } else if (percentageCorrect >= 40) {
      overallAnalysis = "Overall, your child has a good understanding but could improve in some areas.";
    } else if (percentageCorrect >= 10) {
      overallAnalysis = "Overall, your child shows a weak understanding and may need more practice.";
    } else {
      overallAnalysis = "Overall, your child shows little understanding and should seek additional help.";
    }

    // Group attempts by question type (using 'unknown' if operation is missing)
    const typeResults = {};
    filteredAttempts.forEach(attempt => {
      const op = attempt.operation ? attempt.operation.toLowerCase() : "unknown";
      if (!typeResults[op]) {
        typeResults[op] = { correct: 0, wrong: 0, total: 0 };
      }
      typeResults[op].total++;
      if (attempt.isCorrect) typeResults[op].correct++;
      else typeResults[op].wrong++;
    });

    // Build detailed type-specific analysis with extensive feedback
    let detailedTypeSummary = "";
    for (const op in typeResults) {
      const total = typeResults[op].total;
      const correct = typeResults[op].correct;
      const percent = total ? ((correct / total) * 100).toFixed(1) : 0;
      let opFeedback = "";
      if (percent >= 90) {
        opFeedback = "Excellent mastery! Your child has a strong command of this topic—challenge them with more complex problems.";
      } else if (percent >= 70) {
        opFeedback = "Very good performance. Your child understands most concepts well but could benefit from reviewing a few minor details.";
      } else if (percent >= 50) {
        opFeedback = "Fair understanding. Key concepts are grasped, yet some areas need focused review and additional practice.";
      } else if (percent >= 30) {
        opFeedback = "Below average performance. It is recommended that your child revisits foundational concepts and practices more problems in this area.";
      } else {
        opFeedback = "Poor performance. Your child is struggling with this topic and should receive targeted help and extensive practice.";
      }
      detailedTypeSummary += `<br><strong>${capitalize(op)}:</strong> ${correct} out of ${total} (${percent}%) – ${opFeedback} <br>`;
    }

    // Combine overall analysis and detailed breakdown, and update the analysis container
    document.getElementById("analysisSummary").innerHTML = overallAnalysis + detailedTypeSummary;

    // Render the overall performance pie chart
    renderOverallChart(correctAnswers, wrongAnswers);

    // Render pie charts for each question type
    renderTypeCharts(typeResults);

    // Populate wrong attempts list
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
    filteredAttempts.forEach(result => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>Question:</strong> ${result.question} - <strong>Your Child's Answer:</strong> ${result.studentAnswer} - <strong>Status:</strong> ${result.isCorrect ? "Correct" : "Wrong"}`;
      questionsAnsweredList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
}

// Render overall performance pie chart using Chart.js
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

// Render doughnut charts for each question type
function renderTypeCharts(typeResults) {
  const chartsContainer = document.getElementById("chartsContainer");
  chartsContainer.innerHTML = ""; // Clear previous charts
  for (const op in typeResults) {
    // Create a container for this type's chart
    const chartDiv = document.createElement("div");
    chartDiv.style.width = "180px";
    chartDiv.style.height = "180px";
    
    // Add a heading for the type
    const heading = document.createElement("h4");
    heading.textContent = capitalize(op);
    chartDiv.appendChild(heading);
    
    // Create a canvas for the chart
    const canvas = document.createElement("canvas");
    canvas.id = `chart-${op}`;
    canvas.width = 180;
    canvas.height = 180;
    chartDiv.appendChild(canvas);
    
    chartsContainer.appendChild(chartDiv);
    
    // Render a doughnut chart for this question type
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

// Expand/Minimize functionality for wrong attempts and questions answered
function toggleSection(containerId, buttonId) {
  const container = document.getElementById(containerId);
  const button = document.getElementById(buttonId);
  if (container.style.display === "none" || container.style.display === "") {
    container.style.display = "block";
    button.textContent = "Minimize";
  } else {
    container.style.display = "none";
    button.textContent = "Expand";
  }
}

// Add event listeners for the expand/minimize buttons if they exist
const toggleWrongBtn = document.getElementById("toggleWrongAttempts");
if (toggleWrongBtn) {
  toggleWrongBtn.addEventListener("click", () => {
    toggleSection("wrongAttemptsContainer", "toggleWrongAttempts");
  });
}
const toggleQABtn = document.getElementById("toggleQuestionsAnswered");
if (toggleQABtn) {
  toggleQABtn.addEventListener("click", () => {
    toggleSection("questionsAnsweredContainer", "toggleQuestionsAnswered");
  });
}

// Listen for filter dropdown changes
const filterDropdown = document.getElementById("filterDropdown");
if (filterDropdown) {
  filterDropdown.addEventListener("change", loadDashboard);
}

// Load the dashboard on page load
window.addEventListener("load", loadDashboard);
