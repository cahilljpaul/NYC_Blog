import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDzkEuwpcCEFsUHVxTcDtJ7HJoEEePb84E",
  authDomain: "music-9157f.firebaseapp.com",
  projectId: "music-9157f",
  storageBucket: "music-9157f.appspot.com",
  messagingSenderId: "790378206648",
  appId: "1:790378206648:web:8f741599cbf41b3b696b4d",
  measurementId: "G-FRTJB7PHY7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Form submission handling
document.addEventListener('DOMContentLoaded', () => {
    const contributionForm = document.getElementById('contribution-form');
    
    if (contributionForm) {
        contributionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contributionForm.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            const formData = {
                authorName: document.getElementById('author-name').value,
                authorEmail: document.getElementById('author-email').value,
                title: document.getElementById('title').value,
                category: document.getElementById('category').value,
                content: document.getElementById('content').value,
                imageUrl: document.getElementById('image-url').value || '',
                submittedAt: serverTimestamp(),
                status: 'pending',
                feedback: '',
                reviewedAt: null,
                reviewedBy: null
            };

            console.log("Form submitted, preparing to send to Firestore...", formData);
            try {
                await addDoc(collection(db, 'submissions'), formData);
                console.log("Successfully added to Firestore!");
                showNotification('Thank you for your submission! Your article will be reviewed by our editorial team.', 'success');
                contributionForm.reset();
            } catch (error) {
                console.error('Error submitting form:', error);
                showNotification('There was an error submitting your article. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit for Review';
            }
        });
    }

    // Notification system
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <p>${message}</p>
        `;
        document.body.appendChild(notification);

        // Add styles for the notification
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

        // Add keyframe animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            style.textContent += `
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 5000);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Dynamic content loading for reviews
    const loadReviews = async () => {
        const reviewsGrid = document.querySelector('.reviews-grid');
        if (!reviewsGrid) return;

        try {
            // Fetch approved submissions from Firestore
            const snapshot = await db.collection('submissions')
                .where('status', '==', 'approved')
                .orderBy('submittedAt', 'desc')
                .limit(6)
                .get();

            if (snapshot.empty) {
                reviewsGrid.innerHTML = '<p class="no-reviews">No reviews available yet.</p>';
                return;
            }

            // Create review cards
            snapshot.forEach(doc => {
                const review = doc.data();
                const reviewCard = document.createElement('article');
                reviewCard.className = 'review-card';
                reviewCard.innerHTML = `
                    <h3>${review.title}</h3>
                    <p class="author">By ${review.authorName}</p>
                    <p class="category">${review.category}</p>
                    <p class="excerpt">${review.content.substring(0, 150)}...</p>
                    <a href="#" class="read-more" data-id="${doc.id}">Read Full Review</a>
                `;
                reviewsGrid.appendChild(reviewCard);
            });
        } catch (error) {
            console.error('Error loading reviews:', error);
            reviewsGrid.innerHTML = '<p class="error">Error loading reviews. Please try again later.</p>';
        }
    };

    // Load reviews when the page loads
    loadReviews();
}); 