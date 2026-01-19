
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkGranularMetrics() {
    console.log('--- Checking Granular Metrics Support ---');

    // 1. Create a dummy visit with specific vitals
    const { data: visit, error } = await supabase
        .from('visits')
        .insert({
            patient_id: (await supabase.from('patients').select('id').limit(1).single()).data?.id,
            date: new Date().toISOString(),
            visit_type: 'Test',
            clinical_data: { systolicBP: '123', diastolicBP: '80', weight: '75.5' },
            systolic_bp: 123,
            diastolic_bp: 80,
            weight_kg: 75.5
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Failed to insert visit. Error:', error.message);
        if (error.message.includes('column "systolic_bp" of relation "visits" does not exist')) {
            console.log('\n⚠️  Migration MISSING: The granular metrics columns do not exist yet.');
            console.log('   Please run the SQL in: scripts/add_granular_metrics.sql');
        }
        return;
    }

    // 2. Read it back
    if (visit.systolic_bp === 123 && visit.weight_kg === 75.5) {
        console.log('✅ SUCCESS: Granular metrics (systolic_bp, weight_kg) are working!');
    } else {
        console.log('⚠️  PARTIAL: Visit created but columns might be null?');
        console.log('   Stored:', { sys: visit.systolic_bp, weight: visit.weight_kg });
    }
}

checkGranularMetrics();
