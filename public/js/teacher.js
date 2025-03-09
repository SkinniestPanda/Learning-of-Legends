// teacher.js

// Helper function to capitalize strings
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function loadDashboard() {
  try {
    // Fetch all attempts from the API
    const response = await fetch('/api/attempts');
    const attempts = await response.json();

    // --- Populate User Filter Dropdown for Per-User Charts ---
    const userChartDropdown = document.getElementById("userChartFilterDropdown");
    if (userChartDropdown) {
      // Extract unique user IDs (using userId or studentId)
      const uniqueUsers = [...new Set(attempts.map(a => a.userId || a.studentId || "unknown"))];
      userChartDropdown.innerHTML = '<option value="all">All Users</option>';
      uniqueUsers.forEach(userId => {
        const option = document.createElement("option");
        option.value = userId;
        option.textContent = `User ${userId}`;
        userChartDropdown.appendChild(option);
      });
    }
    // --- End Populate User Filter for Per-User Charts ---

    // --- Apply Top-Level Filters (Question Type) ---
    const filterDropdown = document.getElementById("filterDropdown");
    let filteredAttempts = attempts;
    if (filterDropdown && filterDropdown.value !== "all") {
      filteredAttempts = filteredAttempts.filter(a => {
        const op = a.operation ? a.operation.toLowerCase() : "unknown";
        return op === filterDropdown.value.toLowerCase();
      });
    }
    // --- End Apply Top-Level Filters ---

    // Compute overall stats
    const totalQuestions = filteredAttempts.length;
    const correctAnswers = filteredAttempts.filter(a => a.isCorrect).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentageCorrect = totalQuestions ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;
    
    // Update overall stats in the DOM
    document.getElementById("totalQuestions").textContent = totalQuestions;
    document.getElementById("correctAnswers").textContent = correctAnswers;
    document.getElementById("wrongAnswers").textContent = wrongAnswers;
    document.getElementById("percentageCorrect").textContent = percentageCorrect;
    
    // Overall analysis text
    let overallAnalysis = "";
    if (percentageCorrect >= 70) {
      overallAnalysis = "Overall, the students demonstrate an excellent understanding of the question types.";
    } else if (percentageCorrect >= 40) {
      overallAnalysis = "Overall, the students show a good understanding but have room for improvement.";
    } else if (percentageCorrect >= 10) {
      overallAnalysis = "Overall, the students exhibit a weak understanding and need additional practice.";
    } else {
      overallAnalysis = "Overall, the students show little understanding and should receive further help.";
    }
    
    // Group attempts by question type
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
    
    // Detailed type analysis summary
    let detailedTypeSummary = "";
    for (const op in typeResults) {
      const total = typeResults[op].total;
      const correct = typeResults[op].correct;
      const percent = total ? ((correct / total) * 100).toFixed(1) : 0;
      let opFeedback = "";
      if (percent >= 90) {
        opFeedback = "Excellent mastery!";
      } else if (percent >= 70) {
        opFeedback = "Very good performance, with minor areas to review.";
      } else if (percent >= 50) {
        opFeedback = "Fair understanding; additional practice is recommended.";
      } else if (percent >= 30) {
        opFeedback = "Below average; the student should revisit foundational concepts.";
      } else {
        opFeedback = "Poor performance; targeted help is needed.";
      }
      detailedTypeSummary += `<br><strong>${capitalize(op)}:</strong> ${correct} out of ${total} (${percent}%) – ${opFeedback}<br>`;
    }
    
    // Insert combined analysis into the analysisSummary element
    document.getElementById("analysisSummary").innerHTML = overallAnalysis + detailedTypeSummary;
    
    // Render overall performance pie chart
    renderOverallChart(correctAnswers, wrongAnswers);
    
    // Render type-specific charts
    renderTypeCharts(typeResults);
    
    // Populate Wrong Attempts list
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
          <strong>Attempted on:</strong> ${attemptDate.toLocaleString()}<br>
          <strong>User ID:</strong> ${attempt.userId || attempt.studentId || "unknown"}
        `;
        wrongAttemptsList.appendChild(li);
      });
    } else {
      wrongAttemptsList.innerHTML = "<li>No wrong attempts recorded.</li>";
    }
    
    // Populate Questions Answered list
    const questionsAnsweredList = document.getElementById("questionsAnsweredList");
    questionsAnsweredList.innerHTML = "";
    filteredAttempts.forEach(result => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>User:</strong> ${result.userId || result.studentId || "unknown"}<br>
        <strong>Question:</strong> ${result.question}<br>
        <strong>Student's Answer:</strong> ${result.studentAnswer}<br>
        <strong>Status:</strong> ${result.isCorrect ? "✅ Correct" : "❌ Wrong"}
      `;
      questionsAnsweredList.appendChild(li);
    });
    
    // --- Per-User Analysis and Chart Rendering ---
    // Group attempts by user
    const userResults = {};
    attempts.forEach(attempt => {
      const uid = attempt.userId || attempt.studentId || "unknown";
      if (!userResults[uid]) {
        userResults[uid] = { total: 0, correct: 0, wrong: 0 };
      }
      userResults[uid].total++;
      if (attempt.isCorrect) {
        userResults[uid].correct++;
      } else {
        userResults[uid].wrong++;
      }
    });
    
    // Populate per-user analysis text
    let userAnalysisHTML = "";
    for (const uid in userResults) {
      const res = userResults[uid];
      const percent = res.total ? ((res.correct / res.total) * 100).toFixed(1) : 0;
      userAnalysisHTML += `<p><strong>User ${uid}:</strong> ${res.correct} correct out of ${res.total} (${percent}%)</p>`;
    }
    document.getElementById("userAnalysisContent").innerHTML = userAnalysisHTML;
    
    // Populate and render per-user charts using the per-user filter dropdown
    const selectedChartUser = (document.getElementById("userChartFilterDropdown") && document.getElementById("userChartFilterDropdown").value) || "all";
    renderUserCharts(userResults, selectedChartUser);
    
  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
}

function renderOverallChart(correct, wrong) {
  const ctx = document.getElementById('resultsChart').getContext('2d');
  if (window.resultsChartInstance) window.resultsChartInstance.destroy();
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
  chartsContainer.innerHTML = "";
  for (const op in typeResults) {
    const chartDiv = document.createElement("div");
    chartDiv.style.width = "180px";
    chartDiv.style.height = "180px";
    
    const heading = document.createElement("h4");
    heading.textContent = capitalize(op);
    chartDiv.appendChild(heading);
    
    const canvas = document.createElement("canvas");
    canvas.id = `chart-${op}`;
    canvas.width = 180;
    canvas.height = 180;
    chartDiv.appendChild(canvas);
    
    chartsContainer.appendChild(chartDiv);
    
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
        layout: { padding: { bottom: 20 } },
        plugins: {
          legend: { position: 'bottom', labels: { padding: 10 } },
          title: { display: true, text: `${capitalize(op)} Performance` }
        }
      }
    });
  }
}

// Render per-user performance charts into the grid based on the selected filter
function renderUserCharts(userResults, selectedChartUser) {
  const container = document.querySelector("#userChartsContainer .user-charts-grid");
  if (!container) return;
  container.innerHTML = "";
  for (const uid in userResults) {
    if (selectedChartUser !== "all" && uid !== selectedChartUser) continue;
    
    const res = userResults[uid];
    const percent = res.total ? ((res.correct / res.total) * 100).toFixed(1) : 0;
    
    const userChartDiv = document.createElement("div");
    userChartDiv.style.width = "220px";
    userChartDiv.style.height = "220px";
    userChartDiv.style.margin = "10px";
    
    const heading = document.createElement("h4");
    heading.textContent = `User ${uid} (${percent}%)`;
    userChartDiv.appendChild(heading);
    
    const canvas = document.createElement("canvas");
    canvas.id = `userChart-${uid}`;
    canvas.width = 220;
    canvas.height = 220;
    userChartDiv.appendChild(canvas);
    
    container.appendChild(userChartDiv);
    
    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Correct', 'Wrong'],
        datasets: [{
          data: [res.correct, res.wrong],
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
        layout: { padding: { bottom: 20 } },
        plugins: {
          legend: { position: 'bottom', labels: { padding: 10 } },
          title: { display: true, text: `User ${uid} Performance` }
        }
      }
    });
  }
}

// Toggle functionality for expandable sections
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

document.getElementById("toggleWrongAttempts").addEventListener("click", function() {
  toggleSection("wrongAttemptsContainer", "toggleWrongAttempts");
});

document.getElementById("toggleQuestionsAnswered").addEventListener("click", function() {
  toggleSection("questionsAnsweredContainer", "toggleQuestionsAnswered");
});

if (document.getElementById("filterDropdown")) {
  document.getElementById("filterDropdown").addEventListener("change", loadDashboard);
}

if (document.getElementById("userFilterDropdown")) {
  document.getElementById("userFilterDropdown").addEventListener("change", loadDashboard);
}

if (document.getElementById("userChartFilterDropdown")) {
  document.getElementById("userChartFilterDropdown").addEventListener("change", () => {
    // When the per-user chart filter changes, re-render the per-user charts
    const userResults = {};
    // Fetch all attempts again for per-user charts (using full attempts, not filtered by question type)
    fetch('/api/attempts')
      .then(res => res.json())
      .then(attempts => {
        attempts.forEach(attempt => {
          const uid = attempt.userId || attempt.studentId || "unknown";
          if (!userResults[uid]) {
            userResults[uid] = { total: 0, correct: 0, wrong: 0 };
          }
          userResults[uid].total++;
          if (attempt.isCorrect) userResults[uid].correct++;
          else userResults[uid].wrong++;
        });
        renderUserCharts(userResults, document.getElementById("userChartFilterDropdown").value);
      });
  });
}

window.addEventListener("load", loadDashboard);
