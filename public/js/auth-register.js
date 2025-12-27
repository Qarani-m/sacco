// auth-register.js
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission

            // Get form data
            const formData = new FormData(registerForm);
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirm_password');
            const fullName = formData.get('full_name');
            const phoneNumber = formData.get('phone_number');
            const csrfToken = formData.get('_csrf');

            // Client-side validation: Check if passwords match
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }

            // Disable submit button to prevent double submission
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Registering...';

            try {
                const response = await fetch('/admin/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        full_name: fullName,
                        phone_number: phoneNumber,
                        _csrf: csrfToken
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Success - show success toast
                    showToast(data.message || 'Member registered successfully! Verification email sent.', 'success');

                    // Reset form after successful registration
                    registerForm.reset();

                } else {
                    // Error - show error toast
                    showToast(data.message || 'Registration failed. Please check your input.', 'error');
                }

                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = originalText;

            } catch (error) {
                console.error('Registration error:', error);
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
