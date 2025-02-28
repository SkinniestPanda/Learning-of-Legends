document.addEventListener('DOMContentLoaded', () => {
    // Sample data; replace with real API data when available
    const childrenData = [
      { name: 'Alice', total: 20, correct: 15, wrong: 5 },
      { name: 'Bob', total: 25, correct: 20, wrong: 5 }
    ];
    
    const container = document.getElementById('children-results');
    
    childrenData.forEach(child => {
      // Create a container for each child's result
      const childDiv = document.createElement('div');
      childDiv.className = 'child-result';
      childDiv.innerHTML = `
        <h3>${child.name}</h3>
        <p>Total Questions Attempted: ${child.total}</p>
        <p>Correct Answers: ${child.correct}</p>
        <p>Wrong Answers: ${child.wrong}</p>
        <p>Percentage Correct: ${Math.round((child.correct / child.total) * 100)}%</p>
      `;
      container.appendChild(childDiv);
    });
  });
  