
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using Anon key for RLS, usually need Service Role for DDL

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env variables');
    process.exit(1);
}

// NOTE: Running DDL (CREATE TABLE) usually requires the SERVICE_ROLE_KEY or running via Dashboard SQL Editor.
// However, if RLS is not strict or specific permissions are set, anon *might* work, but usually not.
// Let's check if we have a SERVICE_ROLE_KEY in env, otherwise warn user.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

console.log(`Using key: ${serviceKey === process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role' : 'Anon (May fail for DDL)'}`);

const supabase = createClient(supabaseUrl, serviceKey);

async function runSql() {
    const sqlPath = process.argv[2];
    if (!sqlPath) {
        console.error('Please provide SQL file path');
        process.exit(1);
    }

    try {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`Executing SQL from ${sqlPath}...`);

        // Supabase-js client doesn't support raw SQL execution directly via PostgREST easily without an admin function.
        // BUT, we can use the `rpc` call if we have a `exec_sql` function, OR simply log that we need to run this manually.
        // Wait, standard Supabase client only does data operations. DDL must be done via SQL Editor or specialized tools.
        // Unless we have a stored procedure `exec`... which we probably don't.

        console.error('❌ AUTOMATED SQL EXECUTION NOT SUPPORTED VIA JS CLIENT WITHOUT RPC');
        console.error('-------------------------------------------------------------');
        console.error(`Please open Supabase Dashboard -> SQL Editor and run contents of: ${sqlPath}`);
        console.error('-------------------------------------------------------------');
        console.log('SQL CONTENT:');
        console.log(sql);

    } catch (err) {
        console.error('Error reading script:', err);
    }
}

runSql();
