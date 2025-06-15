// Firebase configuration
const firebaseConfig = {
    // Replace with your Firebase config
    apiKey: "YOUR_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const forgotPasswordLink = document.getElementById('forgot-password');

    // Check if user is already logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            window.location.href = 'admin.html';
        }
    });

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.querySelector('.login-btn');
        
        try {
            // Disable login button and show loading state
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            
            // Sign in with Firebase
            await firebase.auth().signInWithEmailAndPassword(email, password);
            
            // Redirect to admin dashboard
            window.location.href = 'admin.html';
        } catch (error) {
            showNotification(error.message, 'error');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    });

    // Handle forgot password
    forgotPasswordLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        
        if (!email) {
            showNotification('Please enter your email address', 'error');
            return;
        }

        try {
            await firebase.auth().sendPasswordResetEmail(email);
            showNotification('Password reset email sent! Check your inbox.', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

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