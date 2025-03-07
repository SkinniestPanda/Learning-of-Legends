// Handle login and registration forms
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                if (response.ok) {
                    // Store token and user info
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('username', username);
                    localStorage.setItem('lastLogin', new Date().toISOString());

                    // Redirect based on role
                    if (data.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else if (data.role === 'student') {
                        window.location.href = '/student.html';
                    } else if (data.role === 'parent') {
                        window.location.href = '/parent_home.html';
                    } else {
                        window.location.href = '/';
                    }
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                alert('Error logging in: ' + error);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const role = document.getElementById('role').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            try {
                let endpoint = '/api/auth/register';
                if (role === 'parent') {
                    endpoint = '/api/auth/register-parent';
                } else if (role === 'admin') {
                    endpoint = '/api/auth/setup-admin';
                }

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('role', role);
                    localStorage.setItem('username', username);
                    
                    if (role === 'admin') {
                        window.location.href = '/admin.html';
                    } else if (role === 'student') {
                        window.location.href = '/student.html';
                    } else if (role === 'parent') {
                        window.location.href = '/parent_home.html';
                    }
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                alert('Error registering: ' + error);
            }
        });
    }
    
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            try {
                const response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, newPassword })
                });
                
                // Check if response is OK before trying to parse JSON
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server responded with status ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                alert('Password reset successful! Please login with your new password.');
                window.location.href = '/login.html';
            } catch (error) {
                alert('Error resetting password: ' + error);
            }
        });
    }
    
    // Global logout function
    window.logout = function() {
        localStorage.clear();
        window.location.href = '/login.html';
    };
    
    // Check if logout button exists and attach event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}); 