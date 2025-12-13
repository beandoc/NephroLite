/**
 * One-time script to set up staff user in Firestore
 * Run with: node scripts/setup-staff-user.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses your service account)
const serviceAccount = require('../path/to/serviceAccountKey.json'); // Update this path

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function setupStaffUser() {
    const email = 'staff@nephrolite.com';

    try {
        console.log('🔍 Looking up user in Firebase Auth...');

        // Get the user from Firebase Auth
        const userRecord = await auth.getUserByEmail(email);
        console.log(`✅ Found user: ${userRecord.uid}`);

        // Check if Firestore document already exists
        const userDoc = await db.collection('users').doc(userRecord.uid).get();

        if (userDoc.exists) {
            console.log('⚠️  User document already exists in Firestore');
            console.log('Current data:', userDoc.data());
            return;
        }

        // Create Firestore document
        console.log('📝 Creating Firestore document...');
        await db.collection('users').doc(userRecord.uid).set({
            email: email,
            role: 'doctor',
            createdAt: new Date().toISOString(),
            staffId: userRecord.uid
        });

        console.log('✅ SUCCESS! Staff user is now set up correctly!');
        console.log('\nYou can now login at:');
        console.log('URL: http://localhost:3002/login/staff');
        console.log(`Email: ${email}`);
        console.log('Password: [the password you set in Firebase Console]');

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.error('❌ User not found in Firebase Auth');
            console.log('\nPlease create the user first in Firebase Console:');
            console.log('1. Go to Firebase Console → Authentication');
            console.log('2. Add user with email/password');
            console.log(`3. Email: ${email}`);
            console.log('4. Then run this script again');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        process.exit();
    }
}

setupStaffUser();
