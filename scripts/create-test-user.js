/**
 * Script to create a test admin user
 * Run with: node scripts/create-test-user.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
try {
    const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.log('⚠️  No service account found. Please follow manual instructions below.\n');
    console.log('━'.repeat(60));
    console.log('MANUAL SETUP INSTRUCTIONS');
    console.log('━'.repeat(60));
    console.log('\n1. Go to Firebase Console → Authentication → Users');
    console.log('2. Click "Add user"');
    console.log('3. Email: testuser@nephrolite.com');
    console.log('4. Password: testuser');
    console.log('5. Copy the UID that appears');
    console.log('\n6. Go to Firestore Database → users collection');
    console.log('7. Add document with:');
    console.log('   - Document ID: [paste UID from step 5]');
    console.log('   - email (string): testuser@nephrolite.com');
    console.log('   - role (string): admin');
    console.log('   - staffId (string): [paste same UID]');
    console.log('   - createdAt (timestamp): [current time]');
    console.log('\n8. Test login at: http://localhost:3000/login/staff');
    console.log('   Email: testuser@nephrolite.com');
    console.log('   Password: testuser\n');
    console.log('━'.repeat(60));
    process.exit(0);
}

const db = admin.firestore();
const auth = admin.auth();

async function createTestUser() {
    const email = 'testuser@nephrolite.com';
    const password = 'testuser';

    console.log('🔧 Creating Test Admin User...\n');
    console.log('═'.repeat(60));

    try {
        // Step 1: Check if user exists in Auth
        console.log('\n1️⃣  Checking Firebase Authentication...');
        let userRecord;

        try {
            userRecord = await auth.getUserByEmail(email);
            console.log(`   ✅ User already exists: ${userRecord.uid}`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log('   Creating new user in Authentication...');
                userRecord = await auth.createUser({
                    email: email,
                    password: password,
                    emailVerified: true,
                    displayName: 'Test User'
                });
                console.log(`   ✅ Created user: ${userRecord.uid}`);
            } else {
                throw error;
            }
        }

        // Step 2: Create/Update Firestore document
        console.log('\n2️⃣  Setting up Firestore user document...');
        const userDocRef = db.collection('users').doc(userRecord.uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists()) {
            await userDocRef.set({
                email: email,
                role: 'admin',
                staffId: userRecord.uid,
                displayName: 'Test User',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('   ✅ Created Firestore user document');
        } else {
            await userDocRef.update({
                role: 'admin',
                staffId: userRecord.uid,
                displayName: 'Test User'
            });
            console.log('   ✅ Updated Firestore user document');
        }

        // Step 3: Summary
        console.log('\n═'.repeat(60));
        console.log('✅ SUCCESS! Test user is ready!');
        console.log('═'.repeat(60));
        console.log('\n📋 Login Credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Role: admin`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log('\n🌐 Login URL:');
        console.log('   http://localhost:3000/login/staff');
        console.log('\n💡 Note:');
        console.log('   - This user can access all features');
        console.log('   - Create patients to test the system');
        console.log('   - Patients will be saved under this user\'s account');
        console.log('\n═'.repeat(60));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.code === 'auth/email-already-exists') {
            console.log('\n💡 User already exists. Try logging in with:');
            console.log(`   Email: ${email}`);
            console.log(`   Password: ${password}`);
        }
    } finally {
        process.exit();
    }
}

createTestUser();
