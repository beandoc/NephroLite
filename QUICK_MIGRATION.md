# Quick Patient Data Migration - Copy/Paste into Browser Console

Open browser console (F12) and paste this entire script:

```javascript
// SIMPLE PATIENT DATA MIGRATION
// Copy and paste this entire block into browser console

(async function quickMigration() {
  console.log('🔄 Starting Quick Migration...\n');
  
  const { getFirestore, collection, getDocs, doc, setDoc } = await import('firebase/firestore');
  const db = getFirestore();
  
  // Step 1: Get all users
  const usersSnap = await getDocs(collection(db, 'users'));
  console.log(`Found ${usersSnap.size} users\n`);
  
  let migrated = 0;
  
  // Step 2: For each user, get their patients
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`Checking: ${userData.email || userId}`);
    
    try {
      const oldPatientsSnap = await getDocs(
        collection(db, 'users', userId, 'patients')
      );
      
      if (oldPatientsSnap.empty) {
        console.log('  No patients in old location');
        continue;
      }
      
      console.log(`  Found ${oldPatientsSnap.size} patient(s)`);
      
      // Step 3: Copy each patient to root collection
      for (const patientDoc of oldPatientsSnap.docs) {
        const patientData = patientDoc.data();
        const patientId = patientDoc.id;
        
        await setDoc(doc(db, 'patients', patientId), {
          ...patientData,
          createdBy: patientData.createdBy || userId,
        });
        
        migrated++;
        console.log(`  ✓ Migrated: ${patientData.firstName} ${patientData.lastName}`);
      }
    } catch (error) {
      console.error(`  Error for ${userId}:`, error.message);
    }
  }
  
  console.log(`\n✅ Migration Complete!`);
  console.log(`📊 Migrated ${migrated} patients to root collection`);
  console.log(`\n🔄 REFRESH YOUR BROWSER NOW!`);
})();
```

**Just copy the entire code block above and paste it into your browser console, then press Enter.**

It will:
1. ✅ Find all users
2. ✅ Get their patients from old location
3. ✅ Copy to root `patients/` collection
4. ✅ Show progress in console

**After it finishes, refresh your browser (F5) to see all patients!**
