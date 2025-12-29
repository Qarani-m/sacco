// auth-login.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission
            
            // Get form data
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');
            const csrfToken = formData.get('_csrf');
            
            // Disable submit button to prevent double submission
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';
            
            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        _csrf: csrfToken
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Success - show success toast and redirect
                    showToast('Login successful! Redirecting...', 'success');
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = data.redirectUrl || '/dashboard';
                    }, 1000);
                    
                } else {
                    // Error - show error toast
                    showToast(data.message || 'Login failed. Please check your credentials.', 'error');
                    
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
                
            } catch (error) {
                console.error('Login error:', error);
                showToast('An error occurred. Please try again.', 'error');
                
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
});

// Toast notification function
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}