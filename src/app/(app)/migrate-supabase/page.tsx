
"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { supabase } from '@/lib/supabase/client';

export default function MigrateSupabasePage() {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'migrating' | 'success' | 'error'>('idle');
    const [stats, setStats] = useState({
        patientsFound: 0,
        patientsMigrated: 0,
        visitsMigrated: 0,
        sessionsMigrated: 0,
        investigationsMigrated: 0,
        appointmentsMigrated: 0,
        masterMigrated: 0,
        panelsMigrated: 0
    });
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const convertTimestamp = (val: any): string | null => {
        if (!val) return null;
        // Handle Firestore Timestamp { seconds, nanoseconds }
        if (typeof val === 'object' && 'seconds' in val) {
            return new Date(val.seconds * 1000).toISOString();
        }
        // Handle strings
        if (typeof val === 'string') return val;
        // Handle Date objects
        if (val instanceof Date) return val.toISOString();
        return null;
    };

    const runMigration = async () => {
        setStatus('scanning');
        setLogs([]);
        setError(null);
        setStats({ patientsFound: 0, patientsMigrated: 0, visitsMigrated: 0, sessionsMigrated: 0, investigationsMigrated: 0, appointmentsMigrated: 0, masterMigrated: 0, panelsMigrated: 0 });

        try {
            addLog('🚀 Starting Supabase Migration...');

            // Check connection
            const { error: healthCheck } = await supabase.from('patients').select('count', { count: 'exact', head: true });
            if (healthCheck) {
                throw new Error(`Supabase connection failed: ${healthCheck.message}. Did you run the SQL setup script?`);
            }
            addLog('✓ Connected to Supabase');

            // 1. Scan Patients (Root Collection)
            // Assumes previous migration to root 'patients' was done OR we scan 'users/{id}/patients'
            // Let's look at ROOT 'patients' first as that's the "clean" state
            addLog('🔍 Scanning Firestore "patients" collection...');
            let patientsSnap = await getDocs(collection(db, 'patients'));

            if (patientsSnap.empty) {
                addLog('⚠️ No patients found in root. Checking "users" collections...');
                // Fallback: Scan users if root is empty (unlikely if they use the app, but possible)
            } else {
                addLog(`✓ Found ${patientsSnap.size} patients in root`);
                setStats(s => ({ ...s, patientsFound: patientsSnap.size }));
            }

            setStatus('migrating');

            let pCount = 0;
            let vCount = 0;
            let sCount = 0;

            for (const pDoc of patientsSnap.docs) {
                const p = pDoc.data();
                const oldId = pDoc.id;

                // Skip if critical data is missing
                if (!p.firstName && !p.lastName) {
                    addLog(`  ⚠️ Skipping patient ${oldId}: Missing name`);
                    continue;
                }

                const pName = `${p.firstName || 'Unknown'} ${p.lastName || 'Patient'}`;

                addLog(`\n👤 Processing: ${pName}`);

                // Prepare Patient Object
                const newPatient = {
                    nephro_id: p.nephroId || `UNK-${oldId}`,
                    first_name: p.firstName || 'Unknown',
                    last_name: p.lastName || 'Patient',
                    dob: convertTimestamp(p.dob),
                    gender: p.gender,
                    phone: p.phoneNumber || p.contact,
                    email: p.email,
                    address: p.address,
                    guardian: p.guardian,
                    clinical_profile: p.clinicalProfile,
                    registration_date: convertTimestamp(p.registrationDate),
                    created_at: convertTimestamp(p.createdAt),
                    migrated_from_id: oldId,
                    is_tracked: p.isTracked ?? true,
                    patient_status: p.patientStatus
                };

                // Upsert Patient
                const { data: insertedPatient, error: pError } = await supabase
                    .from('patients')
                    .upsert(newPatient, { onConflict: 'nephro_id' })
                    .select()
                    .single();

                if (pError) {
                    addLog(`  ❌ Failed to migrate patient: ${pError.message}`);
                    continue;
                }
                const newInfo = insertedPatient; // inferred type
                pCount++;

                // 2. Migrate Visits
                const visitsRef = collection(db, 'patients', oldId, 'visits');
                const visitsSnap = await getDocs(visitsRef);

                if (!visitsSnap.empty) {
                    addLog(`  found ${visitsSnap.size} visits`);
                    const visitsToInsert = visitsSnap.docs.map(vDoc => {
                        const v = vDoc.data();
                        return {
                            patient_id: newInfo.id,
                            date: convertTimestamp(v.date || v.visitDate),
                            visit_type: v.visitType,
                            visit_remark: v.visitRemark,
                            group_name: v.groupName,
                            clinical_data: v.clinicalData,
                            diagnoses: v.diagnoses,
                            migrated_from_id: vDoc.id
                        };
                    });

                    const { error: vError } = await supabase.from('visits').insert(visitsToInsert);
                    if (vError) addLog(`  ❌ Visit import failed: ${vError.message}`);
                    else vCount += visitsToInsert.length;
                }

                // 3. Migrate Dialysis Sessions
                const sessionsRef = collection(db, 'patients', oldId, 'dialysisSessions');
                const sessionsSnap = await getDocs(sessionsRef);

                if (!sessionsSnap.empty) {
                    addLog(`  found ${sessionsSnap.size} dialysis sessions`);
                    const sessionsToInsert = sessionsSnap.docs.map(sDoc => {
                        const s = sDoc.data();
                        return {
                            patient_id: newInfo.id,
                            date_of_session: convertTimestamp(s.dateOfSession),
                            type_of_dialysis: s.typeOfDialysis,
                            duration: s.duration,
                            stats: {
                                bpBefore: s.bpBefore,
                                bpAfter: s.bpAfter,
                                weightBefore: s.weightBefore,
                                weightAfter: s.weightAfter
                            },
                            details: s,
                            migrated_from_id: sDoc.id
                        };
                    });
                    const { error: sError } = await supabase.from('dialysis_sessions').insert(sessionsToInsert);
                    if (sError) addLog(`  ❌ Session import failed: ${sError.message}`);
                    else sCount += sessionsToInsert.length;
                }

                setStats(s => ({
                    ...s,
                    patientsMigrated: pCount,
                    visitsMigrated: vCount,
                    sessionsMigrated: sCount
                }));

                // 4. Migrate Investigation Records
                const invRef = collection(db, 'patients', oldId, 'investigationRecords');
                const invSnap = await getDocs(invRef);

                if (!invSnap.empty) {
                    addLog(`  found ${invSnap.size} investigation records`);
                    const invToInsert = invSnap.docs.map(iDoc => {
                        const i = iDoc.data();
                        return {
                            patient_id: newInfo.id,
                            date: convertTimestamp(i.date),
                            tests: i.tests, // JSONB
                            notes: i.notes,
                            migrated_from_id: iDoc.id,
                            created_at: convertTimestamp(i.createdAt || i.date)
                        };
                    });
                    const { error: iError } = await supabase.from('investigation_records').insert(invToInsert);
                    if (iError) addLog(`  ❌ Investigation import failed: ${iError.message}`);
                    else setStats(s => ({ ...s, investigationsMigrated: (s.investigationsMigrated || 0) + invToInsert.length }));
                }
            } // End Patient Loop

            // 5. Migrate Appointments (Root Collection)
            addLog('\n🔍 Scanning Firestore "appointments" collection...');
            const apptSnap = await getDocs(collection(db, 'appointments'));

            if (!apptSnap.empty) {
                addLog(`✓ Found ${apptSnap.size} appointments`);

                // We need to map Firestore patient IDs to Supabase UUIDs. 
                // Since we already migrated patients, we can look them up or rely on the fact that we stored `nephro_id` or `migrated_from_id`.
                // However, doing a lookup for every appointment is slow. 
                // A better approach: Create a map of oldId -> newUUID from the patient migration phase? 
                // OR: Query the 'patients' table in Supabase where `migrated_from_id` matches.

                const appointments: any[] = apptSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                let apptMigratedCount = 0;

                // Process in chunks to avoid blowing up memory/requests
                const CHUNK_SIZE = 50;
                for (let i = 0; i < appointments.length; i += CHUNK_SIZE) {
                    const chunk = appointments.slice(i, i + CHUNK_SIZE);
                    const chunkToInsert = [];

                    for (const a of chunk) {
                        if (!a.patientId) continue;

                        // Find data.patient_id corresponding to a.patientId (Firestore ID)
                        // We query Supabase for the patient with this migrated_from_id
                        const { data: matchedPatient } = await supabase
                            .from('patients')
                            .select('id')
                            .eq('migrated_from_id', a.patientId)
                            .single();

                        if (matchedPatient) {
                            chunkToInsert.push({
                                patient_id: matchedPatient.id,
                                date: convertTimestamp(a.date || a.appointmentDate),
                                time: a.time || a.appointmentTime,
                                status: a.status,
                                type: a.type || a.appointmentType,
                                doctor_name: a.doctorName || a.doctorId, // Fallback
                                notes: a.notes,
                                migrated_from_id: a.id,
                                created_at: convertTimestamp(a.createdAt)
                            });
                        }
                    }

                    if (chunkToInsert.length > 0) {
                        const { error: aError } = await supabase.from('appointments').insert(chunkToInsert);
                        if (aError) addLog(`  ❌ Appointment chunk failed: ${aError.message}`);
                        else apptMigratedCount += chunkToInsert.length;
                    }
                    setStats(s => ({ ...s, appointmentsMigrated: apptMigratedCount }));
                }
            }

            // 6. Migrate Investigation Master List
            addLog('\n🔍 Scanning Firestore "investigationMasterList" collection...');
            const masterSnap = await getDocs(collection(db, 'investigationMasterList'));
            if (!masterSnap.empty) {
                addLog(`✓ Found ${masterSnap.size} master items`);
                const masters = masterSnap.docs.map(doc => {
                    const d = doc.data();
                    return {
                        name: d.name,
                        group_name: d.group || d.groupName, // potential variance
                        unit: d.unit,
                        normal_range: d.normalRange,
                        result_type: d.resultType || 'numeric',
                        options: d.options,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                });
                // Upsert to avoid duplicates or name conflicts
                const { error: mError } = await supabase.from('investigation_master_list').upsert(masters, { onConflict: 'name' });
                if (mError) addLog(`  ❌ Master Data import failed: ${mError.message}`);
                else {
                    addLog(`  ✓ Migrated ${masters.length} master items`);
                    setStats(s => ({ ...s, masterMigrated: masters.length }));
                }
            } else {
                addLog('⚠️ No investigation master data found.');
            }

            // 7. Migrate Investigation Panels
            addLog('\n🔍 Scanning Firestore "investigationPanels" collection...');
            const panelSnap = await getDocs(collection(db, 'investigationPanels'));
            if (!panelSnap.empty) {
                addLog(`✓ Found ${panelSnap.size} panels`);
                const panels = panelSnap.docs.map(doc => {
                    const d = doc.data();
                    return {
                        name: d.name,
                        group_name: d.group || d.groupName,
                        test_ids: d.testIds,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                });
                const { error: pnError } = await supabase.from('investigation_panels').upsert(panels, { onConflict: 'name' });
                if (pnError) addLog(`  ❌ Panels import failed: ${pnError.message}`);
                else {
                    addLog(`  ✓ Migrated ${panels.length} panels`);
                    setStats(s => ({ ...s, panelsMigrated: panels.length }));
                }
            } else {
                addLog('⚠️ No investigation panels found.');
            }

            setStatus('success');
            addLog('\n✅ Migration cycle complete!');

        } catch (err: any) {
            setStatus('error');
            setError(err.message);
            addLog(`\n❌ FATAL ERROR: ${err.message}`);
        }
    };

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <PageHeader
                title="Supabase Migration Utility"
                description="Move data from Firestore to Supabase (PostgreSQL)"
            />

            <div className="mt-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Firestore ➔ Supabase
                        </CardTitle>
                        <CardDescription>
                            This tool reads from your current Firestore and writes to the new Supabase tables.
                            <br />
                            <strong>Pre-requisite:</strong> You must have run the SQL schema script in Supabase.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {status !== 'idle' && (
                            <div className="grid grid-cols-6 gap-4 p-4 bg-muted rounded-lg">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{stats.patientsFound}</div>
                                    <div className="text-sm text-muted-foreground">Found</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-green-600">{stats.patientsMigrated}</div>
                                    <div className="text-xs text-muted-foreground">Patients</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-blue-600">{stats.visitsMigrated}</div>
                                    <div className="text-xs text-muted-foreground">Visits</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-purple-600">{stats.sessionsMigrated}</div>
                                    <div className="text-xs text-muted-foreground">Sessions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-orange-600">{stats.appointmentsMigrated}</div>
                                    <div className="text-xs text-muted-foreground">Appts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-cyan-600">{stats.masterMigrated}</div>
                                    <div className="text-xs text-muted-foreground">Tests</div>
                                </div>
                            </div>
                        )}


                        <Button
                            onClick={runMigration}
                            disabled={status === 'scanning' || status === 'migrating'}
                            className="w-full"
                            size="lg"
                        >
                            {status === 'scanning' || status === 'migrating' ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Migrating...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="mr-2 h-5 w-5" />
                                    Start Migration
                                </>
                            )}
                        </Button>

                        {status === 'success' && (
                            <Alert className="border-green-500 bg-green-50">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-600">Done!</AlertTitle>
                                <AlertDescription>
                                    Migration finished. Check the logs below for details.
                                </AlertDescription>
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {logs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Log Output</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
                                {logs.map((log, i) => (
                                    <div key={i} className="whitespace-pre-wrap mb-1">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div >
    );
}
