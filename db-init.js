// Initialize Firestore collections and indexes
const initializeDatabase = async () => {
    try {
        // Create submissions collection
        const submissionsRef = db.collection('submissions');
        
        // Create a sample submission
        await submissionsRef.add({
            title: 'Sample Submission',
            content: 'This is a sample submission to initialize the database.',
            authorName: 'Admin',
            authorEmail: 'admin@example.com',
            status: 'pending',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
            category: 'Music Review',
            imageUrl: '',
            feedback: '',
            reviewedAt: null,
            reviewedBy: null
        });

        // Create users collection
        const usersRef = db.collection('users');
        
        // Create a sample admin user
        await usersRef.add({
            email: 'admin@example.com',
            role: 'admin',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Create posts collection
        const postsRef = db.collection('posts');
        
        // Create a sample post
        await postsRef.add({
            title: 'Welcome to NYC Music Blog',
            content: 'Welcome to our music blog! Here you can find the latest music reviews, news, and more.',
            author: 'Admin',
            publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'published',
            category: 'Announcement',
            imageUrl: '',
            views: 0,
            likes: 0
        });

        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Call the initialization function
initializeDatabase(); 