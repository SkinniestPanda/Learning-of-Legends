document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in as a parent
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'parent') {
        window.location.href = '/parent_login.html';
        return;
    }
    
    try {
        // Verify token with server
        const response = await fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid session');
        }
        
        // Sample data; replace with real API data when available
        const childrenData = [
            { name: 'Alice', total: 20, correct: 15, wrong: 5 },
            { name: 'Bob', total: 25, correct: 20, wrong: 5 }
        ];
        
        const container = document.getElementById('children-results');
        
        if (container) {
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
        }
    } catch (error) {
        console.error('Error:', error);
        localStorage.clear();
        window.location.href = '/parent_login.html';
    }
});
  