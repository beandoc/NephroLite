
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_PATIENT = {
    nephro_id: 'TEST/0126',
    first_name: 'Test',
    last_name: 'Patient',
    dob: '1980-01-15',
    gender: 'Male',
    phone: '9876543210',
    email: 'test@nephrolite.com',
    address: { state: 'Delhi', city: 'New Delhi', street: '123 Test Lane', pincode: '110001' },
    guardian: { name: 'Test Guardian', relation: 'Spouse', contact: '9876543211' },
    clinical_profile: {
        primaryDiagnosis: 'Chronic Kidney Disease',
        bloodGroup: 'B+',
        hasDiabetes: true,
        nutritionalStatus: 'Normal'
    },
    is_tracked: true
};

async function runTest() {
    try {
        console.log('--- STARTING TEST ---');

        // 1. Check if patient exists, cleanup if so
        const { data: existing } = await supabase.from('patients').select('id').eq('nephro_id', TEST_PATIENT.nephro_id).single();
        if (existing) {
            console.log(`Cleaning up existing test patient: ${existing.id}`);
            await supabase.from('patients').delete().eq('id', existing.id);
        }

        // 2. Create Patient
        console.log('Creating Patient...');
        const { data: patient, error: pError } = await supabase
            .from('patients')
            .insert(TEST_PATIENT)
            .select()
            .single();

        if (pError) throw pError;
        console.log(`✅ Patient Created: ${patient.id} (${patient.nephro_id})`);

        // 3. Create Visit
        console.log('Creating Visit...');
        const visitData = {
            patient_id: patient.id,
            date: new Date().toISOString(),
            visit_type: 'OPD',
            visit_remark: 'Routine Follow-up',
            group_name: 'CKD',
            clinical_data: { height: '175', weight: '72', systolicBP: '130', diastolicBP: '85' },
            diagnoses: [{ id: 'ckd-1', name: 'CKD Stage 3', icdCode: 'N18.3' }]
        };
        const { data: visit, error: vError } = await supabase.from('visits').insert(visitData).select().single();
        if (vError) throw vError;
        console.log(`✅ Visit Created: ${visit.id}`);

        // 4. Create Appointments
        console.log('Creating Appointment...');
        const aptData = {
            patient_id: patient.id,
            date: '2026-01-25',
            time: '10:00',
            status: 'Scheduled',
            type: 'Follow-up',
            doctor_name: 'Dr. Test',
            notes: 'Bring previous reports'
        };
        const { data: apt, error: aError } = await supabase.from('appointments').insert(aptData).select().single();
        if (aError) throw aError;
        console.log(`✅ Appointment Created: ${apt.id}`);

        // 5. Create Investigation
        console.log('Creating Investigation Record...');
        const invData = {
            patient_id: patient.id,
            date: new Date().toISOString(),
            tests: [
                { id: 'hb-1', name: 'Hemoglobin', group: 'Hematological', result: '12.5', unit: 'g/dL' },
                { id: 'cr-1', name: 'Serum Creatinine', group: 'Biochemistry', result: '2.1', unit: 'mg/dL' }
            ]
        };
        const { data: inv, error: iError } = await supabase.from('investigation_records').insert(invData).select().single();
        if (iError) throw iError;
        console.log(`✅ Investigation Recorded: ${inv.id}`);

        // 6. Create Intervention
        console.log('Creating Intervention...');
        const intData = {
            patient_id: patient.id,
            date: new Date().toISOString(),
            type: 'Temporary Catheter',
            details: { catheterSite: 'Right IJV' },
            notes: 'Uneventful insertion'
        };
        const { data: intr, error: iError2 } = await supabase.from('interventions').insert(intData).select().single();
        if (iError2) throw iError2;
        console.log(`✅ Intervention Recorded: ${intr.id}`);

        // VERIFICATION
        console.log('\n--- VERIFICATION STEP ---');
        console.log(`Patient ID for App: ${patient.id}`);
        console.log(`Navigate to /patients/${patient.id} to verify.`);

        // Final Counts
        const { count: vCount } = await supabase.from('visits').select('*', { count: 'exact', head: true }).eq('patient_id', patient.id);
        const { count: aCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('patient_id', patient.id);
        const { count: iCount } = await supabase.from('investigation_records').select('*', { count: 'exact', head: true }).eq('patient_id', patient.id);

        console.log(`\nStats for Patient:`);
        console.log(`- Visits: ${vCount}`);
        console.log(`- Appointments: ${aCount}`);
        console.log(`- Investigations: ${iCount}`);

        console.log('\n--- TEST SUCCESSFUL ---');

    } catch (err) {
        console.error('TEST FAILED:', err);
        process.exit(1);
    }
}

runTest();
