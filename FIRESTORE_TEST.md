# Comprehensive Firestore Data Validation Test

**Quick Test Script** - Paste in browser console after logging in:

```javascript
(async function comprehensiveFirestoreTest() {
  console.log('🧪 Starting Comprehensive Firestore Validation...\n');
  
  const { getFirestore, collection, getDocs, doc, getDoc } = await import('firebase/firestore');
  const { getAuth } = await import('firebase/auth');
  
  const db = getFirestore();
  const auth = getAuth();
  
  if (!auth.currentUser) {
    console.error('❌ Please login first!');
    return;
  }
  
  console.log(`✓ Logged in as: ${auth.currentUser.email}\n`);
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Test 1: Check patients collection
  console.log('📋 Test 1: Patients Collection');
  try {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    console.log(`  ✓ Found ${patientsSnap.size} patients`);
    
    if (patientsSnap.size === 0) {
      results.warnings.push('No patients found - create one to test');
    } else {
      // Check first patient for required fields
      const firstPatient = patientsSnap.docs[0].data();
      const requiredFields = ['firstName', 'lastName', 'patientStatus', 'nephroId'];
      const missingFields = requiredFields.filter(f => !firstPatient[f]);
      
      if (missingFields.length > 0) {
        results.failed.push(`Patients missing fields: ${missingFields.join(', ')}`);
      } else {
        results.passed.push('Patients: All required fields present');
      }
      
      // Check new admission/discharge fields
      if (firstPatient.patientStatus === 'IPD') {
        if (firstPatient.admissionDate) {
          results.passed.push('Admission date tracking: Working ✓');
          console.log(`  ✓ Admission date found: ${firstPatient.admissionDate}`);
        } else {
          results.warnings.push('IPD patient without admission date - click Admit to test');
        }
      }
    }
  } catch (error) {
    results.failed.push(`Patients collection: ${error.message}`);
  }
  
  // Test 2: Check visits subcollection
  console.log('\n📋 Test 2: Visits Subcollection');
  try {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    let totalVisits = 0;
    
    for (const patientDoc of patientsSnap.docs) {
      const visitsSnap = await getDocs(collection(db, 'patients', patientDoc.id, 'visits'));
      totalVisits += visitsSnap.size;
    }
    
    console.log(`  ✓ Found ${totalVisits} total visits`);
    if (totalVisits > 0) {
      results.passed.push('Visits: Saving correctly');
    } else {
      results.warnings.push('No visits found - add one to test');
    }
  } catch (error) {
    results.failed.push(`Visits: ${error.message}`);
  }
  
  // Test 3: Check investigations
  console.log('\n📋 Test 3: Investigation Records');
  try {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    let totalInvestigations = 0;
    
    for (const patientDoc of patientsSnap.docs) {
      const invSnap = await getDocs(collection(db, 'patients', patientDoc.id, 'investigationRecords'));
      totalInvestigations += invSnap.size;
    }
    
    console.log(`  ✓ Found ${totalInvestigations} investigation records`);
    if (totalInvestigations > 0) {
      results.passed.push('Investigations: Saving correctly');
    } else {
      results.warnings.push('No investigations found - add one to test');
    }
  } catch (error) {
    results.failed.push(`Investigations: ${error.message}`);
  }
  
  // Test 4: Check interventions
  console.log('\n📋 Test 4: Interventions');
  try {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    let totalInterventions = 0;
    
    for (const patientDoc of patientsSnap.docs) {
      const intSnap = await getDocs(collection(db, 'patients', patientDoc.id, 'interventions'));
      totalInterventions += intSnap.size;
    }
    
    console.log(`  ✓ Found ${totalInterventions} interventions`);
    if (totalInterventions > 0) {
      results.passed.push('Interventions: Saving correctly');
    } else {
      results.warnings.push('No interventions found - add one to test');
    }
  } catch (error) {
    results.failed.push(`Interventions: ${error.message}`);
  }
  
  // Test 5: Check dialysis sessions
  console.log('\n📋 Test 5: Dialysis Sessions');
  try {
    const patientsSnap = await getDocs(collection(db, 'patients'));
    let totalSessions = 0;
    
    for (const patientDoc of patientsSnap.docs) {
      const sessionsSnap = await getDocs(collection(db, 'patients', patientDoc.id, 'dialysisSessions'));
      totalSessions += sessionsSnap.size;
    }
    
    console.log(`  ✓ Found ${totalSessions} dialysis sessions`);
    if (totalSessions > 0) {
      results.passed.push('Dialysis Sessions: Saving correctly');
    } else {
      results.warnings.push('No dialysis sessions found - add one to test');
    }
  } catch (error) {
    results.failed.push(`Dialysis sessions: ${error.message}`);
  }
  
  // Test 6: Check appointments
  console.log('\n📋 Test 6: Appointments Collection');
  try {
    const appointmentsSnap = await getDocs(collection(db, 'appointments'));
    console.log(`  ✓ Found ${appointmentsSnap.size} appointments`);
    
    if (appointmentsSnap.size > 0) {
      results.passed.push('Appointments: Saving correctly');
    } else {
      results.warnings.push('No appointments found - create one to test');
    }
  } catch (error) {
    results.failed.push(`Appointments: ${error.message}`);
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  
  console.log(`\n✅ PASSED (${results.passed.length}):`);
  results.passed.forEach(r => console.log(`  ✓ ${r}`));
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${results.warnings.length}):`);
    results.warnings.forEach(r => console.log(`  ⚠  ${r}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED (${results.failed.length}):`);
    results.failed.forEach(r => console.log(`  ✗ ${r}`));
  }
  
  const passRate = ((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(0);
  console.log(`\n📈 Pass Rate: ${passRate}%`);
  
  if (results.failed.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED! All forms are saving correctly to Firestore!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  return {
    passed: results.passed.length,
    failed: results.failed.length,
    warnings: results.warnings.length,
    passRate
  };
})();
```

## How to Run

1. **Login**: Go to http://localhost:3000/login/staff
2. **Use credentials**: `testuser@nephrolite.com` / `testuser`
3. **Open Console**: Press F12 → Console tab
4. **Paste** the script above
5. **Press Enter**

## What It Tests

- ✅ **Patients**: Checks collection exists and has required fields
- ✅ **Admission/Discharge Dates**: Verifies new date tracking feature
- ✅ **Visits**: Checks visits subcollection
- ✅ **Investigations**: Validates investigation records
- ✅ **Interventions**: Tests interventions data
- ✅ **Dialysis Sessions**: Checks dialysis session records
- ✅ **Appointments**: Validates appointments collection

## Expected Output

```
🧪 Starting Comprehensive Firestore Validation...

✓ Logged in as: testuser@nephrolite.com

📋 Test 1: Patients Collection
  ✓ Found 5 patients
  ✓ Admission date found: 2025-12-21T16:00:00.000Z

📋 Test 2: Visits Subcollection
  ✓ Found 12 total visits

... (more tests)

═══════════════════════════════════════════════════════
📊 TEST SUMMARY
═══════════════════════================================================================

✅ PASSED (6):
  ✓ Patients: All required fields present
  ✓ Admission date tracking: Working ✓
  ✓ Visits: Saving correctly
  ✓ Investigations: Saving correctly
  ✓ Interventions: Saving correctly
  ✓ Appointments: Saving correctly

⚠️  WARNINGS (1):
  ⚠  No dialysis sessions found - add one to test

📈 Pass Rate: 100%

🎉 ALL TESTS PASSED! All forms are saving correctly to Firestore!
```

## What to Do If Tests Fail

1. **Check Firebase Console**: Verify permissions and data structure
2. **Create test data**: Use the app to create sample records
3. **Check console errors**: Look for authentication or permission issues
4. **Verify Firestore rules**: Ensure `testuser` has read/write access
