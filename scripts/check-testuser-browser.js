// Quick check script - paste in browser console at localhost:3000
// This checks if testuser exists in Firestore

(async function checkTestUser() {
    try {
        console.log('🔍 Checking for testuser...\n');

        // Get Firebase app
        const { getFirestore, doc, getDoc, collection, getDocs } = await import('firebase/firestore');
        const { getAuth } = await import('firebase/auth');

        const db = getFirestore();
        const auth = getAuth();

        // Check current user
        console.log('Current Auth User:', auth.currentUser?.email || 'Not logged in');

        // Check testuser document
        const testUserRef = doc(db, 'users', '5hFmiM312TgRveVrcN2jcTClmHm1');
        const testUserSnap = await getDoc(testUserRef);

        console.log('\n📋 testuser Document Check:');
        if (testUserSnap.exists()) {
            console.log('✅ FOUND in Firestore');
            console.log('Data:', testUserSnap.data());
        } else {
            console.log('❌ NOT FOUND in Firestore');
            console.log('⚠️  You need to create this document in Firebase Console');
        }

        // List all users in Firestore
        console.log('\n👥 All Users in Firestore:');
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        if (usersSnap.empty) {
            console.log('❌ No users found');
        } else {
            usersSnap.forEach(doc => {
                const data = doc.data();
                console.log(`  - ${doc.id}: ${data.email} (${data.role})`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
        console.log('💡 Make sure you run this on http://localhost:3000');
    }
})();
