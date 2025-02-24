async function checkSession() {
    const token = localStorage.getItem('token');
    console.log('Checking session, token:', token ? 'exists' : 'missing');
    
    if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/login.html';
        return false;
    }

    try {
        console.log('Verifying token with server...');
        const response = await fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Server response:', response.status);
        if (!response.ok) {
            console.log('Token verification failed');
            localStorage.clear();
            window.location.href = '/login.html';
            return false;
        }

        console.log('Token verified successfully');
        return true;
    } catch (error) {
        console.error('Session check failed:', error);
        // Only redirect on actual auth failures, not network errors
        if (error.message !== 'Failed to fetch') {
            localStorage.clear();
            window.location.href = '/login.html';
        }
        return false;
    }
}

// Check session when page loads
document.addEventListener('DOMContentLoaded', checkSession); 