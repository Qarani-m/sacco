// Profile Page JavaScript

// Get CSRF token from meta tag
function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

// Document Upload - Handle multiple forms
const uploadForms = document.querySelectorAll('.document-upload-form');
uploadForms.forEach(form => {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const documentType = this.getAttribute('data-document-type');
        const fileInput = this.querySelector('input[type="file"]');
        const submitBtn = this.querySelector('button[type="submit"]');

        if (!fileInput.files[0]) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('document', fileInput.files[0]);
        formData.append('documentType', documentType);
        formData.append('_csrf', getCsrfToken());

        // Disable button during upload
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        try {
            const response = await fetch('/members/profile/upload-documents', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('Document uploaded successfully! Awaiting admin review.');
                window.location.reload();
            } else {
                alert('Error: ' + (data.error || 'Failed to upload document'));
                submitBtn.disabled = false;
                submitBtn.textContent = 'Upload ' + documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to upload document. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Upload ' + documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    });
});

// Profile Form Submit
const profileForm = document.getElementById('profileFormSubmit');
if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            national_id: document.getElementById('nationalId').value,
            date_of_birth: document.getElementById('dateOfBirth').value,
            address: document.getElementById('address').value,
            occupation: document.getElementById('occupation').value,
            next_of_kin_name: document.getElementById('nextOfKinName').value,
            next_of_kin_phone: document.getElementById('nextOfKinPhone').value,
            _csrf: getCsrfToken()
        };

        if (!confirm('This form can only be submitted once. Are you sure all information is correct?')) {
            return;
        }

        try {
            const response = await fetch('/members/profile/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Profile form submitted successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (data.error || 'Failed to submit form'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit form. Please try again.');
        }
    });
}

// Edit Profile Button
const editBtn = document.getElementById('editProfileBtn');
if (editBtn) {
    editBtn.addEventListener('click', function() {
        alert('Profile editing feature coming soon. Contact admin for changes.');
    });
}
