/**
 * Diagnostic script to check why staff can't see patients
 * Run with: node scripts/diagnose-staff-access.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// Try to use service account or application default credentials
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

async function diagnoseStaffAccess() {
  const staffEmail = 'staff@nephrolite.com';
  
  console.log('🔍 DIAGNOSTIC REPORT: Staff Patient Access\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Check Firebase Auth
    console.log('\n1️⃣  Checking Firebase Authentication...');
    const userRecord = await auth.getUserByEmail(staffEmail);
    console.log(`   ✅ Staff user exists in Auth`);
    console.log(`   📧 Email: ${userRecord.email}`);
    console.log(`   🆔 UID: ${userRecord.uid}`);
    
    // 2. Check Firestore users collection
    console.log('\n2️⃣  Checking Firestore users collection...');
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists()) {
      console.log(`   ✅ User document exists`);
      console.log(`   📄 Data:`, JSON.stringify(userDoc.data(), null, 2));
    } else {
      console.log(`   ❌ User document NOT FOUND in users/${userRecord.uid}`);
      console.log(`   ⚠️  This is likely the problem! Staff user needs a Firestore document.`);
    }
    
    // 3. Check staff-siloed patients
    console.log('\n3️⃣  Checking staff-siloed patients...');
    const staffPatientsRef = db.collection('users').doc(userRecord.uid).collection('patients');
    const staffPatients = await staffPatientsRef.get();
    console.log(`   📊 Patients in users/${userRecord.uid}/patients: ${staffPatients.size}`);
    
    if (staffPatients.size > 0) {
      console.log(`   ✅ Found ${staffPatients.size} patients:`);
      staffPatients.forEach(doc => {
        const data = doc.data();
        console.log(`      - ${data.firstName} ${data.lastName} (${data.nephroId})`);
      });
    } else {
      console.log(`   ⚠️  No patients found in staff-siloed location`);
    }
    
    // 4. Check root patients collection
    console.log('\n4️⃣  Checking root patients collection...');
    const rootPatientsRef = db.collection('patients');
    const rootPatients = await rootPatientsRef.get();
    console.log(`   📊 Patients in root collection: ${rootPatients.size}`);
    
    if (rootPatients.size > 0) {
      console.log(`   ✅ Found ${rootPatients.size} patients in root:`);
      rootPatients.forEach(doc => {
        const data = doc.data();
        console.log(`      - ${data.firstName} ${data.lastName} (${data.nephroId}) [createdBy: ${data.createdBy || 'unknown'}]`);
      });
    }
    
    // 5. Check all users
    console.log('\n5️⃣  Checking all users in Firestore...');
    const allUsers = await db.collection('users').get();
    console.log(`   📊 Total users: ${allUsers.size}`);
    
    for (const userDoc of allUsers.docs) {
      const userData = userDoc.data();
      const patientsCount = await db.collection('users').doc(userDoc.id).collection('patients').get();
      console.log(`   👤 User: ${userDoc.id} (${userData.email || 'no email'}) - Role: ${userData.role || 'no role'} - Patients: ${patientsCount.size}`);
    }
    
    // 6. Diagnosis Summary
    console.log('\n📋 DIAGNOSIS SUMMARY');
    console.log('='.repeat(60));
    
    if (!userDoc.exists()) {
      console.log('❌ ISSUE FOUND: Staff user document missing in Firestore');
      console.log('   Solution: Run the fix script to create the user document');
    } else if (staffPatients.size === 0 && rootPatients.size > 0) {
      console.log('❌ ISSUE FOUND: Patients exist in root but not linked to staff user');
      console.log('   Solution: Copy/link patients to staff user subcollection');
    } else if (staffPatients.size === 0 && rootPatients.size === 0) {
      console.log('⚠️  No patients exist in the database at all');
      console.log('   Solution: Create patients using the application');
    } else {
      console.log('✅ Everything looks correct!');
      console.log('   The issue might be elsewhere (permissions, frontend, etc.)');
    }
    
  } catch (error) {
    console.error('\n❌ Error during diagnosis:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.log('\n⚠️  Staff user not found in Firebase Auth');
      console.log('   Please create the user first in Firebase Console');
    }
  } finally {
    process.exit();
  }
}

diagnoseStaffAccess();
