/**
 * PATIENT DATA MIGRATION SCRIPT
 * 
 * This script migrates patient data from staff-siloed structure to root collection
 * Run this ONCE in browser console to move all existing patients
 * 
 * OLD: users/{userId}/patients/{patientId}
 * NEW: patients/{patientId}
 * 
 * Usage:
 * 1. Login to your app as ANY user
 * 2. Open browser console (F12)
 * 3. Copy and paste this script
 * 4. Run: await migratePatientData()
 */

async function migratePatientData() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  PATIENT DATA MIGRATION                                    ║');
    console.log('║  From: users/{userId}/patients → To: patients/             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        const { getFirestore, collection, getDocs, doc, setDoc, writeBatch } = await import('firebase/firestore');
        const { getAuth } = await import('firebase/auth');

        const db = getFirestore();
        const auth = getAuth();

        if (!auth.currentUser) {
            console.error('❌ Not logged in! Please login first.');
            return;
        }

        console.log('🔍 Scanning for patient data in old structure...\n');

        // Get all users to find their patients
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        let totalPatientsMigrated = 0;
        let allPatients = new Map(); // Use Map to deduplicate by patient ID

        // Scan each user's patients
        for (const userDoc of usersSnap.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();

            console.log(`\n📂 Checking user: ${userData.email || userId}`);

            const oldPatientsRef = collection(db, 'users', userId, 'patients');
            const patientsSnap = await getDocs(oldPatientsRef);

            if (patientsSnap.empty) {
                console.log('   No patients found');
                continue;
            }

            console.log(`   Found ${patientsSnap.size} patient(s)`);

            patientsSnap.forEach(patientDoc => {
                const patientData = patientDoc.data();
                const patientId = patientDoc.id;

                // Store patient data, keeping track of who created it
                if (!allPatients.has(patientId)) {
                    allPatients.set(patientId, {
                        ...patientData,
                        id: patientId,
                        createdBy: patientData.createdBy || userId,
                        migratedFrom: userId
                    });
                }
            });
        }

        if (allPatients.size === 0) {
            console.log('\n✅ No patient data found in old structure.');
            console.log('💡 Either migration already done, or no patients exist yet.');
            return;
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 Found ${allPatients.size} unique patient(s) to migrate`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Migrate to root collection using batch writes
        const batchSize = 500; // Firestore batch limit
        let currentBatch = writeBatch(db);
        let operationsInBatch = 0;

        for (const [patientId, patientData] of allPatients) {
            const newPatientRef = doc(db, 'patients', patientId);

            // Check if already exists in root
            const existingDoc = await getDocs(collection(db, 'patients'));
            const alreadyExists = existingDoc.docs.some(d => d.id === patientId);

            if (alreadyExists) {
                console.log(`  ⏭️  Skipping ${patientData.firstName} ${patientData.lastName} - already in root collection`);
                continue;
            }

            currentBatch.set(newPatientRef, patientData);
            operationsInBatch++;
            totalPatientsMigrated++;

            console.log(`  ✓ Queued: ${patientData.firstName} ${patientData.lastName} (${patientData.nephroId || patientId})`);

            // Commit batch if we hit the limit
            if (operationsInBatch >= batchSize) {
                console.log('\n  💾 Committing batch...');
                await currentBatch.commit();
                currentBatch = writeBatch(db);
                operationsInBatch = 0;
            }
        }

        // Commit remaining operations
        if (operationsInBatch > 0) {
            console.log('\n  💾 Committing final batch...');
            await currentBatch.commit();
        }

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  MIGRATION COMPLETE ✅                                     ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log(`📊 Summary:`);
        console.log(`   Total patients migrated: ${totalPatientsMigrated}`);
        console.log(`   New location: patients/ collection (root)`);
        console.log('\n✨ All staff users can now see all patients!');
        console.log('\n🔄 Refresh your browser to see the changes.');

        return {
            success: true,
            migrated: totalPatientsMigrated,
            total: allPatients.size
        };

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        console.error('Error details:', error.message);
        return { success: false, error: error.message };
    }
}

// Make function available globally
window.migratePatientData = migratePatientData;
console.log('✅ Migration script loaded!');
console.log('📝 Run: await migratePatientData()');
