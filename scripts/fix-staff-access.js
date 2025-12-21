/**
 * Fix script for staff patient access issues
 * Run with: node scripts/fix-staff-access.js
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
    console.log('⚠️  No service account found, trying application default credentials...');
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();
const auth = admin.auth();

async function fixStaffAccess() {
    const staffEmail = 'staff@nephrolite.com';

    console.log('🔧 FIXING STAFF ACCESS ISSUES\n');
    console.log('='.repeat(60));

    try {
        // Step 1: Get or create staff user in Auth
        console.log('\n1️⃣  Checking Firebase Authentication...');
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(staffEmail);
            console.log(`   ✅ Staff user exists: ${userRecord.uid}`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`   ⚠️  Staff user not found in Auth, creating...`);
                userRecord = await auth.createUser({
                    email: staffEmail,
                    password: 'staff@1234',
                    emailVerified: true
                });
                console.log(`   ✅ Created staff user: ${userRecord.uid}`);
            } else {
                throw error;
            }
        }

        // Step 2: Create/Update Firestore user document
        console.log('\n2️⃣  Setting up Firestore user document...');
        const userDocRef = db.collection('users').doc(userRecord.uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists()) {
            await userDocRef.set({
                email: staffEmail,
                role: 'doctor',
                staffId: userRecord.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`   ✅ Created user document in Firestore`);
        } else {
            console.log(`   ✅ User document already exists`);
            // Update to ensure it has the correct structure
            await userDocRef.update({
                role: 'doctor',
                staffId: userRecord.uid
            });
            console.log(`   ✅ Updated user document`);
        }

        // Step 3: Link existing root patients to staff user
        console.log('\n3️⃣  Linking patients to staff user...');
        const rootPatients = await db.collection('patients').get();
        console.log(`   📊 Found ${rootPatients.size} patients in root collection`);

        if (rootPatients.size > 0) {
            const batch = db.batch();
            let count = 0;

            for (const patientDoc of rootPatients.docs) {
                const patientData = patientDoc.data();
                const staffPatientRef = db.collection('users')
                    .doc(userRecord.uid)
                    .collection('patients')
                    .doc(patientDoc.id);

                // Check if already exists
                const exists = await staffPatientRef.get();
                if (!exists.exists()) {
                    // Remove subcollections from the data (they're stored separately)
                    const { visits, investigationRecords, interventions, dialysisSessions, ...cleanPatientData } = patientData;

                    batch.set(staffPatientRef, {
                        ...cleanPatientData,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    count++;
                }
            }

            if (count > 0) {
                await batch.commit();
                console.log(`   ✅ Linked ${count} patients to staff user`);
            } else {
                console.log(`   ℹ️  All patients already linked`);
            }
        } else {
            console.log(`   ℹ️  No patients to link`);
        }

        // Step 4: Verify setup
        console.log('\n4️⃣  Verifying setup...');
        const staffPatients = await db.collection('users')
            .doc(userRecord.uid)
            .collection('patients')
            .get();

        console.log(`   ✅ Staff can now access ${staffPatients.size} patients`);

        console.log('\n✅ SUCCESS! Staff access has been fixed!');
        console.log('\nYou can now login with:');
        console.log(`   Email: ${staffEmail}`);
        console.log(`   Password: staff@1234`);
        console.log(`   Accessible patients: ${staffPatients.size}`);

    } catch (error) {
        console.error('\n❌ Error during fix:', error.message);
        console.error(error);
    } finally {
        process.exit();
    }
}

fixStaffAccess();
