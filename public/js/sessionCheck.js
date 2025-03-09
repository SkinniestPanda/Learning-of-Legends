async function checkSession() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
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

        const data = await response.json();
        
        // Redirect if on wrong page for role, but allow admins to access all pages
        const currentPath = window.location.pathname;
        
        // Admins can access all pages, no redirection needed
        if (data.role === 'admin') {
            // No redirection for admins
        } else if (data.role === 'student' && !currentPath.includes('student') && !currentPath.includes('guild') && !currentPath.includes('pve') && !currentPath.includes('pvp')) {
            window.location.href = '/student.html';
            return false;
        } else if (data.role === 'parent' && !currentPath.includes('parent')) {
            window.location.href = '/parent_home.html';
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