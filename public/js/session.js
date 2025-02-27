document.addEventListener('DOMContentLoaded', async () => {
    const userDisplay = document.getElementById('userDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    
    if (token && username) {
        try {
            // Verify token is still valid
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Invalid token');
            }

            // Token is valid, update display
            userDisplay.textContent = `${username} (${role})`;
            logoutBtn.style.display = 'inline-block';
        } catch (error) {
            console.error('Token verification failed:', error);
            // Only clear storage and redirect if it's not a network error
            if (error.message !== 'Failed to fetch') {
                localStorage.clear();
                window.location.href = '/login.html';
            }
        }
    } else {
        userDisplay.textContent = 'Not logged in';
        logoutBtn.style.display = 'none';
    }
    
    // Handle logout
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });
}); 