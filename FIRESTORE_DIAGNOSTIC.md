// FIRESTORE DATA DIAGNOSTIC SCRIPT
// Paste this in browser console (F12) when logged in to check actual data structure

(async function checkFirestoreData() {
  console.log('🔍 FIRESTORE DIAGNOSTIC STARTING...\n');
  
  const { getFirestore, collection, getDocs, doc, getDoc } = await import('firebase/firestore');
  const { getAuth } = await import('firebase/auth');
  
  const db = getFirestore();
  const auth = getAuth();
  
  if (!auth.currentUser) {
    console.error('❌ Not logged in!');
    return;
  }
  
  console.log(`✓ Logged in as: ${auth.currentUser.email}\n`);
  
  // Check specific patient
  const patientId = 'ce0cf5c2-9d7b-4345-b3b6-19a1d45e49d7'; // Vikram Reddy
  
  console.log(`📊 Checking patient: ${patientId}\n`);
  
  // 1. Check if patient exists in root
  console.log('1️⃣ Checking root patients collection...');
  const rootPatientRef = doc(db, 'patients', patientId);
  const rootPatientSnap = await getDoc(rootPatientRef);
  
  if (rootPatientSnap.exists()) {
    console.log('  ✅ Patient found in root collection');
    console.log('  Data:', rootPatientSnap.data());
  } else {
    console.log('  ❌ Patient NOT found in root collection');
  }
  
  // 2. Check investigationRecords subcollection in root
  console.log('\n2️⃣ Checking investigationRecords in root...');
  const rootInvRef = collection(db, 'patients', patientId, 'investigationRecords');
  const rootInvSnap = await getDocs(rootInvRef);
  
  console.log(`  Found ${rootInvSnap.size} investigation records`);
  if (rootInvSnap.size > 0) {
    console.log('  ✅ Investigation data EXISTS in root');
    rootInvSnap.docs.forEach((doc, i) => {
      const data = doc.data();
      console.log(`    Record ${i + 1}:`, data);
      if (data.tests) {
        console.log(`      Tests:`, data.tests.map(t => `${t.name}: ${t.result}`));
      }
    });
  } else {
    console.log('  ❌ NO investigation data in root');
  }
  
  // 3. Check old location (admin user)
  console.log('\n3️⃣ Checking OLD location (users/*/patients/...)...');
  const usersSnap = await getDocs(collection(db, 'users'));
  
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const userData = userDoc.data();
    console.log(`\n  Checking user: ${userData.email || userId}`);
    
    // Check if patient exists in old location
    const oldPatientRef = doc(db, 'users', userId, 'patients', patientId);
    const oldPatientSnap = await getDoc(oldPatientRef);
    
    if (oldPatientSnap.exists()) {
      console.log(`    ✓ Patient found in old location for this user`);
    }
    
    // Check investigations in old location
    const oldInvRef = collection(db, 'users', userId, 'patients', patientId, 'investigationRecords');
    const oldInvSnap = await getDocs(oldInvRef);
    
    if (oldInvSnap.size > 0) {
      console.log(`    ⚠️  Found ${oldInvSnap.size} investigationRecords in OLD location!`);
      console.log(`    ⚠️  These need to be migrated!`);
      oldInvSnap.docs.forEach((doc, i) => {
        const data = doc.data();
        console.log(`      Old Record ${i + 1}:`, data);
      });
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Root patient: ${rootPatientSnap.exists() ? '✅' : '❌'}`);
  console.log(`Root investigations: ${rootInvSnap.size > 0 ? '✅ ' + rootInvSnap.size + ' records' : '❌ None'}`);
  console.log('\nIf investigations are in OLD location, run migration!');
  
})();
