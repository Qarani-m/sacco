// Profile Page JavaScript

// Document Upload
const uploadForm = document.getElementById('documentUploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData();
        const idFront = document.getElementById('idFront').files[0];
        const idBack = document.getElementById('idBack').files[0];

        if (!idFront || !idBack) {
            alert('Please select both ID front and back images');
            return;
        }

        formData.append('id_front', idFront);
        formData.append('id_back', idBack);

        try {
            const response = await fetch('/members/profile/upload-documents', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('Documents uploaded successfully! Awaiting admin verification.');
                window.location.reload();
            } else {
                alert('Error: ' + (data.error || 'Failed to upload documents'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to upload documents. Please try again.');
        }
    });
}

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
            next_of_kin_phone: document.getElementById('nextOfKinPhone').value
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
