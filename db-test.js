// Test database functionality
const testDatabase = async () => {
    try {
        console.log('Starting database tests...\n');

        // Test 1: Check if we can read submissions
        console.log('Test 1: Reading submissions...');
        const submissionsSnapshot = await db.collection('submissions').get();
        console.log(`Found ${submissionsSnapshot.size} submissions`);
        submissionsSnapshot.forEach(doc => {
            console.log(`- ${doc.data().title} (${doc.data().status})`);
        });
        console.log('✓ Submissions read successfully\n');

        // Test 2: Check if we can read users
        console.log('Test 2: Reading users...');
        const usersSnapshot = await db.collection('users').get();
        console.log(`Found ${usersSnapshot.size} users`);
        usersSnapshot.forEach(doc => {
            console.log(`- ${doc.data().email} (${doc.data().role})`);
        });
        console.log('✓ Users read successfully\n');

        // Test 3: Check if we can read posts
        console.log('Test 3: Reading posts...');
        const postsSnapshot = await db.collection('posts').get();
        console.log(`Found ${postsSnapshot.size} posts`);
        postsSnapshot.forEach(doc => {
            console.log(`- ${doc.data().title} (${doc.data().status})`);
        });
        console.log('✓ Posts read successfully\n');

        // Test 4: Try to create a new submission
        console.log('Test 4: Creating a new submission...');
        const newSubmission = {
            title: 'Test Submission',
            content: 'This is a test submission to verify database functionality.',
            authorName: 'Test User',
            authorEmail: 'test@example.com',
            status: 'pending',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
            category: 'Test',
            imageUrl: '',
            feedback: '',
            reviewedAt: null,
            reviewedBy: null
        };
        
        const submissionRef = await db.collection('submissions').add(newSubmission);
        console.log(`Created submission with ID: ${submissionRef.id}`);
        console.log('✓ Submission created successfully\n');

        // Test 5: Try to update the submission
        console.log('Test 5: Updating the submission...');
        await submissionRef.update({
            status: 'approved',
            feedback: 'Test feedback',
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
            reviewedBy: 'admin@example.com'
        });
        console.log('✓ Submission updated successfully\n');

        // Test 6: Try to delete the test submission
        console.log('Test 6: Deleting the test submission...');
        await submissionRef.delete();
        console.log('✓ Submission deleted successfully\n');

        console.log('All tests completed successfully! 🎉');
    } catch (error) {
        console.error('Error during database tests:', error);
    }
};

// Run the tests
testDatabase(); 