// Initialize Firebase (using the same config as login.js)
firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', () => {
    const submissionsList = document.getElementById('submissions-list');
    const reviewModal = document.getElementById('review-modal');
    const closeModal = document.querySelector('.close-modal');
    const reviewForm = document.getElementById('review-form');
    const logoutBtn = document.getElementById('logout-btn');
    let currentSubmission = null;

    // Check authentication state
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
        }
    });

    // Load submissions
    loadSubmissions();

    // Handle logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await firebase.auth().signOut();
            window.location.href = 'login.html';
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        reviewModal.style.display = 'none';
        currentSubmission = null;
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === reviewModal) {
            reviewModal.style.display = 'none';
            currentSubmission = null;
        }
    });

    // Handle review form submission
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentSubmission) return;

        const status = document.getElementById('status').value;
        const feedback = document.getElementById('feedback').value;
        const loginBtn = document.querySelector('.review-btn');
        
        try {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            // Update submission in Firestore
            await firebase.firestore().collection('submissions').doc(currentSubmission.id).update({
                status,
                feedback,
                reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                reviewedBy: firebase.auth().currentUser.email
            });

            // Send email notification to author
            if (currentSubmission.authorEmail) {
                const emailData = {
                    to: currentSubmission.authorEmail,
                    subject: `Your submission has been ${status}`,
                    text: `Your submission "${currentSubmission.title}" has been ${status}.\n\nFeedback: ${feedback}`
                };
                
                // Call your email sending function/API here
                // await sendEmail(emailData);
            }

            showNotification('Review submitted successfully', 'success');
            reviewModal.style.display = 'none';
            loadSubmissions(); // Refresh the list
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Submit Review';
        }
    });

    // Load submissions from Firestore
    async function loadSubmissions() {
        try {
            const snapshot = await firebase.firestore()
                .collection('submissions')
                .orderBy('submittedAt', 'desc')
                .get();

            submissionsList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const submission = { id: doc.id, ...doc.data() };
                const submissionElement = createSubmissionElement(submission);
                submissionsList.appendChild(submissionElement);
            });
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    // Create submission element
    function createSubmissionElement(submission) {
        const div = document.createElement('div');
        div.className = 'submission-item';
        div.innerHTML = `
            <div class="submission-header">
                <h3>${submission.title}</h3>
                <span class="status ${submission.status}">${submission.status}</span>
            </div>
            <div class="submission-meta">
                <p><i class="fas fa-user"></i> ${submission.authorName}</p>
                <p><i class="fas fa-envelope"></i> ${submission.authorEmail}</p>
                <p><i class="fas fa-clock"></i> ${formatDate(submission.submittedAt)}</p>
            </div>
            <div class="submission-content">
                <p>${submission.content.substring(0, 200)}...</p>
            </div>
            <div class="submission-actions">
                <button class="review-btn" onclick="openReviewModal('${submission.id}')">
                    <i class="fas fa-eye"></i> Review
                </button>
            </div>
        `;
        return div;
    }

    // Open review modal
    window.openReviewModal = async (submissionId) => {
        try {
            const doc = await firebase.firestore()
                .collection('submissions')
                .doc(submissionId)
                .get();

            if (!doc.exists) {
                showNotification('Submission not found', 'error');
                return;
            }

            currentSubmission = { id: doc.id, ...doc.data() };
            
            // Populate modal with submission details
            document.getElementById('submission-title').textContent = currentSubmission.title;
            document.getElementById('submission-author').textContent = currentSubmission.authorName;
            document.getElementById('submission-content').textContent = currentSubmission.content;
            
            // Show modal
            reviewModal.style.display = 'block';
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    // Format date
    function formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Show notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <p>${message}</p>
        `;
        document.body.appendChild(notification);

        // Style notification
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '1rem 2rem';
        notification.style.borderRadius = '5px';
        notification.style.backgroundColor = type === 'success' ? '#2ecc71' : '#e74c3c';
        notification.style.color = 'white';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '0.5rem';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        notification.style.animation = 'slideIn 0.3s ease-out';

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}); 