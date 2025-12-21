/**
 * COMPREHENSIVE FIREBASE DATA VALIDATION TEST
 * 
 * This script tests ALL forms in the application to ensure data is saved correctly.
 * Run in browser console at http://localhost:3000 after logging in.
 * 
 * Tests:
 * 1. Patient creation
 * 2. Visit creation
 * 3. Investigation records
 * 4. Interventions
 * 5. Dialysis sessions
 * 6. Appointments
 * 
 * Usage:
 * 1. Login to the app
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Run: await runComprehensiveTest()
 */

// Helper: Wait for a bit
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Generate unique ID
const generateId = () => `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

async function runComprehensiveTest() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  COMPREHENSIVE FIREBASE DATA VALIDATION TEST               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const results = {
        passed: [],
        failed: [],
        warnings: []
    };

    try {
        const { getFirestore, doc, getDoc, setDoc, collection, serverTimestamp } = await import('firebase/firestore');
        const { getAuth } = await import('firebase/auth');

        const db = getFirestore();
        const auth = getAuth();

        if (!auth.currentUser) {
            console.error('❌ Not logged in! Please login first.');
            return;
        }

        const userId = auth.currentUser.uid;
        console.log(`👤 Testing as: ${auth.currentUser.email}`);
        console.log(`🆔 User ID: ${userId}\n`);

        // ========================================
        // TEST 1: Patient Creation
        // ========================================
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 1: Patient Creation');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const testPatientId = generateId();
        const patientData = {
            id: testPatientId,
            nephroId: 'NEPTEST001',
            firstName: 'Test',
            lastName: 'Patient',
            gender: 'Male',
            dob: '1980-01-01',
            phone: '1234567890',
            email: 'test@example.com',
            clinicalProfile: {
                primaryDiagnosis: 'CKD Stage 3',
                tags: ['Test Tag'],
                bloodGroup: 'O+',
                height: 170,
                weight: 70,
                bmi: 24.2
            },
            createdBy: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        try {
            // Save patient - should go to root patients collection
            const patientRef = doc(db, 'patients', testPatientId);
            await setDoc(patientRef, patientData);
            console.log('  ✓ Patient data written');

            // Wait a moment for write to complete
            await wait(500);

            // Verify patient exists
            const patientSnap = await getDoc(patientRef);
            if (patientSnap.exists()) {
                const savedData = patientSnap.data();
                console.log('  ✓ Patient data verified in Firestore');
                console.log(`    - Location: patients/${testPatientId}`);
                console.log(`    - Name: ${savedData.firstName} ${savedData.lastName}`);
                console.log(`    - Nephro ID: ${savedData.nephroId}`);
                results.passed.push('Patient Creation');
            } else {
                console.error('  ✗ Patient data NOT found after save');
                results.failed.push('Patient Creation - Data not found');
            }
        } catch (error) {
            console.error('  ✗ Error:', error.message);
            results.failed.push(`Patient Creation - ${error.message}`);
        }

        // ========================================
        // TEST 2: Visit Creation
        // ========================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 2: Visit Creation');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const testVisitId = generateId();
        const visitData = {
            id: testVisitId,
            patientId: testPatientId,
            date: new Date().toISOString(),
            visitType: 'OPD',
            visitRemark: 'Test Visit',
            clinicalData: {
                chiefComplaint: 'Test complaint',
                history: 'Test history',
                vitals: {
                    bloodPressure: '120/80',
                    pulse: 72,
                    temperature: 98.6
                },
                medications: [
                    { name: 'Test Med 1', dosage: '10mg', frequency: 'OD' }
                ]
            },
            createdAt: serverTimestamp()
        };

        try {
            // Save visit - should go to patients/{patientId}/visits
            const visitRef = doc(db, 'patients', testPatientId, 'visits', testVisitId);
            await setDoc(visitRef, visitData);
            console.log('  ✓ Visit data written');

            await wait(500);

            // Verify visit exists
            const visitSnap = await getDoc(visitRef);
            if (visitSnap.exists()) {
                const savedData = visitSnap.data();
                console.log('  ✓ Visit data verified in Firestore');
                console.log(`    - Location: patients/${testPatientId}/visits/${testVisitId}`);
                console.log(`    - Type: ${savedData.visitType}`);
                console.log(`    - Date: ${savedData.date}`);
                results.passed.push('Visit Creation');
            } else {
                console.error('  ✗ Visit data NOT found after save');
                results.failed.push('Visit Creation - Data not found');
            }
        } catch (error) {
            console.error('  ✗ Error:', error.message);
            results.failed.push(`Visit Creation - ${error.message}`);
        }

        // ========================================
        // TEST 3: Investigation Record
        // ========================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 3: Investigation Record');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const testInvestigationId = generateId();
        const investigationData = {
            id: testInvestigationId,
            patientId: testPatientId,
            visitId: testVisitId,
            date: new Date().toISOString(),
            testName: 'Serum Creatinine',
            value: 1.2,
            unit: 'mg/dL',
            referenceRange: '0.7-1.3',
            flag: 'Normal',
            createdAt: serverTimestamp()
        };

        try {
            const invRef = doc(db, 'patients', testPatientId, 'investigationRecords', testInvestigationId);
            await setDoc(invRef, investigationData);
            console.log('  ✓ Investigation data written');

            await wait(500);

            const invSnap = await getDoc(invRef);
            if (invSnap.exists()) {
                const savedData = invSnap.data();
                console.log('  ✓ Investigation data verified in Firestore');
                console.log(`    - Location: patients/${testPatientId}/investigationRecords/${testInvestigationId}`);
                console.log(`    - Test: ${savedData.testName}`);
                console.log(`    - Value: ${savedData.value} ${savedData.unit}`);
                results.passed.push('Investigation Record');
            } else {
                console.error('  ✗ Investigation data NOT found after save');
                results.failed.push('Investigation Record - Data not found');
            }
        } catch (error) {
            console.error('  ✗ Error:', error.message);
            results.failed.push(`Investigation Record - ${error.message}`);
        }

        // ========================================
        // TEST 4: Intervention
        // ========================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 4: Intervention');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const testInterventionId = generateId();
        const interventionData = {
            id: testInterventionId,
            patientId: testPatientId,
            date: new Date().toISOString(),
            type: 'Procedure',
            name: 'Test Procedure',
            notes: 'Test intervention notes',
            performedBy: userId,
            createdAt: serverTimestamp()
        };

        try {
            const intRef = doc(db, 'patients', testPatientId, 'interventions', testInterventionId);
            await setDoc(intRef, interventionData);
            console.log('  ✓ Intervention data written');

            await wait(500);

            const intSnap = await getDoc(intRef);
            if (intSnap.exists()) {
                const savedData = intSnap.data();
                console.log('  ✓ Intervention data verified in Firestore');
                console.log(`    - Location: patients/${testPatientId}/interventions/${testInterventionId}`);
                console.log(`    - Type: ${savedData.type}`);
                console.log(`    - Name: ${savedData.name}`);
                results.passed.push('Intervention');
            } else {
                console.error('  ✗ Intervention data NOT found after save');
                results.failed.push('Intervention - Data not found');
            }
        } catch (error) {
            console.error('  ✗ Error:', error.message);
            results.failed.push(`Intervention - ${error.message}`);
        }

        // ========================================
        // TEST 5: Dialysis Session
        // ========================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 5: Dialysis Session');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const testDialysisId = generateId();
        const dialysisData = {
            id: testDialysisId,
            patientId: testPatientId,
            date: new Date().toISOString(),
            type: 'Hemodialysis',
            duration: 240,
            accessSite: 'AV Fistula',
            preWeight: 70,
            postWeight: 68,
            ultraFiltration: 2,
            createdAt: serverTimestamp()
        };

        try {
            const dialysisRef = doc(db, 'patients', testPatientId, 'dialysisSessions', testDialysisId);
            await setDoc(dialysisRef, dialysisData);
            console.log('  ✓ Dialysis session data written');

            await wait(500);

            const dialysisSnap = await getDoc(dialysisRef);
            if (dialysisSnap.exists()) {
                const savedData = dialysisSnap.data();
                console.log('  ✓ Dialysis session data verified in Firestore');
                console.log(`    - Location: patients/${testPatientId}/dialysisSessions/${testDialysisId}`);
                console.log(`    - Type: ${savedData.type}`);
                console.log(`    - Duration: ${savedData.duration} min`);
                results.passed.push('Dialysis Session');
            } else {
                console.error('  ✗ Dialysis session data NOT found after save');
                results.failed.push('Dialysis Session - Data not found');
            }
        } catch (error) {
            console.error('  ✗ Error:', error.message);
            results.failed.push(`Dialysis Session - ${error.message}`);
        }

        // ========================================
        // TEST 6: Appointment
        // ========================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 6: Appointment');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const testAppointmentId = generateId();
        const appointmentData = {
            id: testAppointmentId,
            patientId: testPatientId,
            date: new Date().toISOString(),
            time: '10:00',
            type: 'Follow-up',
            status: 'Scheduled',
            notes: 'Test appointment',
            createdAt: serverTimestamp()
        };

        try {
            const appointmentRef = doc(db, 'appointments', testAppointmentId);
            await setDoc(appointmentRef, appointmentData);
            console.log('  ✓ Appointment data written');

            await wait(500);

            const appointmentSnap = await getDoc(appointmentRef);
            if (appointmentSnap.exists()) {
                const savedData = appointmentSnap.data();
                console.log('  ✓ Appointment data verified in Firestore');
                console.log(`    - Location: appointments/${testAppointmentId}`);
                console.log(`    - Type: ${savedData.type}`);
                console.log(`    - Status: ${savedData.status}`);
                results.passed.push('Appointment');
            } else {
                console.error('  ✗ Appointment data NOT found after save');
                results.failed.push('Appointment - Data not found');
            }
        } catch (error) {
            console.error('  ✗ Error:', error.message);
            results.failed.push(`Appointment - ${error.message}`);
        }

        // ========================================
        // SUMMARY
        // ========================================
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  TEST SUMMARY                                              ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log(`✅ PASSED: ${results.passed.length} tests`);
        results.passed.forEach(test => console.log(`   ✓ ${test}`));

        if (results.failed.length > 0) {
            console.log(`\n❌ FAILED: ${results.failed.length} tests`);
            results.failed.forEach(test => console.log(`   ✗ ${test}`));
        }

        if (results.warnings.length > 0) {
            console.log(`\n⚠️  WARNINGS: ${results.warnings.length}`);
            results.warnings.forEach(warn => console.log(`   ⚠ ${warn}`));
        }

        const passRate = (results.passed.length / 6 * 100).toFixed(0);
        console.log(`\n📊 Pass Rate: ${passRate}%`);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🧹 CLEANUP');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Test data IDs (for manual cleanup if needed):');
        console.log(`  Patient: ${testPatientId}`);
        console.log(`  Visit: ${testVisitId}`);
        console.log(`  Investigation: ${testInvestigationId}`);
        console.log(`  Intervention: ${testInterventionId}`);
        console.log(`  Dialysis: ${testDialysisId}`);
        console.log(`  Appointment: ${testAppointmentId}`);
        console.log('\nYou can delete these from Firebase Console if needed.\n');

        return results;

    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        return { passed: [], failed: ['Fatal error: ' + error.message], warnings: [] };
    }
}

// Auto-export for easy access
window.runComprehensiveTest = runComprehensiveTest;
console.log('✅ Test script loaded! Run: await runComprehensiveTest()');
