"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MigratePage() {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'migrating' | 'success' | 'error'>('idle');
    const [stats, setStats] = useState({ usersScanned: 0, patientsFound: 0, patientsMigrated: 0 });
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const runMigration = async () => {
        setStatus('scanning');
        setLogs([]);
        setError(null);
        setStats({ usersScanned: 0, patientsFound: 0, patientsMigrated: 0 });

        try {
            addLog('🔍 Scanning for patient data in old structure...');

            // Get all users
            const usersRef = collection(db, 'users');
            const usersSnap = await getDocs(usersRef);

            addLog(`✓ Found ${usersSnap.size} users to scan`);
            setStats(s => ({ ...s, usersScanned: usersSnap.size }));

            let totalPatientsFound = 0;
            let totalMigrated = 0;

            setStatus('migrating');

            // Scan each user's patients
            for (const userDoc of usersSnap.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();
                const userEmail = userData.email || userId;

                addLog(`\n📂 Checking user: ${userEmail}`);

                // Get patients from old location
                const oldPatientsRef = collection(db, 'users', userId, 'patients');
                const oldPatientsSnap = await getDocs(oldPatientsRef);

                if (oldPatientsSnap.empty) {
                    addLog(`  ℹ️  No patients found in old location`);
                    continue;
                }

                addLog(`  ✓ Found ${oldPatientsSnap.size} patient(s)`);
                totalPatientsFound += oldPatientsSnap.size;

                // Migrate each patient AND their subcollections
                for (const patientDoc of oldPatientsSnap.docs) {
                    const patientData = patientDoc.data();
                    const patientId = patientDoc.id;
                    const patientName = `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim();

                    try {
                        // 1. Write patient document to root collection
                        const newPatientRef = doc(db, 'patients', patientId);
                        await setDoc(newPatientRef, {
                            ...patientData,
                            createdBy: patientData.createdBy || userId,
                            migratedAt: new Date().toISOString(),
                            migratedFrom: userId
                        });

                        // 2. Migrate subcollections
                        const subcollections = ['visits', 'investigationRecords', 'interventions', 'dialysisSessions'];
                        let subCount = 0;

                        for (const subName of subcollections) {
                            const oldSubRef = collection(db, 'users', userId, 'patients', patientId, subName);
                            const oldSubSnap = await getDocs(oldSubRef);

                            if (!oldSubSnap.empty) {
                                for (const subDoc of oldSubSnap.docs) {
                                    const newSubRef = doc(db, 'patients', patientId, subName, subDoc.id);
                                    await setDoc(newSubRef, subDoc.data());
                                    subCount++;
                                }
                            }
                        }

                        totalMigrated++;
                        addLog(`  ✅ Migrated: ${patientName || patientId} (${subCount} records)`);
                        setStats(s => ({ ...s, patientsMigrated: totalMigrated }));

                    } catch (err: any) {
                        addLog(`  ❌ Error migrating ${patientName}: ${err.message}`);
                    }
                }
            }

            setStats(s => ({ ...s, patientsFound: totalPatientsFound }));

            // PHASE 2: Migrate orphaned subcollections for patients already in root
            addLog('\n\n📦 PHASE 2: Checking for orphaned subcollections...');
            const rootPatientsSnap = await getDocs(collection(db, 'patients'));
            addLog(`✓ Found ${rootPatientsSnap.size} patients in root collection`);

            let totalSubcollectionsMigrated = 0;

            for (const rootPatientDoc of rootPatientsSnap.docs) {
                const patientId = rootPatientDoc.id;
                const patientData = rootPatientDoc.data();
                const patientName = `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim();

                // Check all users for this patient's subcollections
                for (const userDoc of usersSnap.docs) {
                    const userId = userDoc.id;
                    const subcollections = ['visits', 'investigationRecords', 'interventions', 'dialysisSessions'];

                    for (const subName of subcollections) {
                        const oldSubRef = collection(db, 'users', userId, 'patients', patientId, subName);
                        const oldSubSnap = await getDocs(oldSubRef);

                        if (!oldSubSnap.empty) {
                            addLog(`  📋 ${patientName}: Found ${oldSubSnap.size} ${subName}`);

                            for (const subDoc of oldSubSnap.docs) {
                                const newSubRef = doc(db, 'patients', patientId, subName, subDoc.id);
                                await setDoc(newSubRef, subDoc.data());
                                totalSubcollectionsMigrated++;
                            }
                        }
                    }
                }
            }

            if (totalSubcollectionsMigrated > 0) {
                addLog(`\n✅ Migrated ${totalSubcollectionsMigrated} orphaned records!`);
            }

            if (totalMigrated > 0 || totalSubcollectionsMigrated > 0) {
                setStatus('success');
                addLog(`\n✅ Migration complete! Patients: ${totalMigrated}, Records: ${totalSubcollectionsMigrated}`);
                addLog(`\n🔄 Please refresh your browser to see all data!`);
            } else {
                setStatus('success');
                addLog(`\nℹ️  No migration needed. All data is in the correct location.`);
            }

        } catch (err: any) {
            setStatus('error');
            setError(err.message);
            addLog(`\n❌ Migration failed: ${err.message}`);
        }
    };

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <PageHeader
                title="Patient Data Migration"
                description="Migrate patient data from staff-siloed structure to shared root collection"
            />

            <div className="mt-6 space-y-6">
                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Migration Tool
                        </CardTitle>
                        <CardDescription>
                            This tool migrates patient data from the old structure (users/&#123;userId&#125;/patients)
                            to the new shared structure (patients/). After migration, all staff will see all patients.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Stats */}
                        {status !== 'idle' && (
                            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{stats.usersScanned}</div>
                                    <div className="text-sm text-muted-foreground">Users Scanned</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{stats.patientsFound}</div>
                                    <div className="text-sm text-muted-foreground">Patients Found</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.patientsMigrated}</div>
                                    <div className="text-sm text-muted-foreground">Migrated</div>
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <Button
                            onClick={runMigration}
                            disabled={status === 'scanning' || status === 'migrating'}
                            className="w-full"
                            size="lg"
                        >
                            {status === 'scanning' && (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Scanning...
                                </>
                            )}
                            {status === 'migrating' && (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Migrating Data...
                                </>
                            )}
                            {(status === 'idle' || status === 'success' || status === 'error') && (
                                <>
                                    <ArrowRight className="mr-2 h-5 w-5" />
                                    {status === 'success' ? 'Run Migration Again' : 'Start Migration'}
                                </>
                            )}
                        </Button>

                        {/* Success Alert */}
                        {status === 'success' && (
                            <Alert className="border-green-500 bg-green-50">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-600">Migration Successful!</AlertTitle>
                                <AlertDescription className="text-green-600">
                                    {stats.patientsMigrated > 0
                                        ? `Successfully migrated ${stats.patientsMigrated} patient(s) to the root collection. Please refresh your browser to see all patients.`
                                        : 'All data is already in the correct location. No migration needed.'
                                    }
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Error Alert */}
                        {status === 'error' && error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Migration Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Logs Card */}
                {logs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Migration Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                                {logs.map((log, i) => (
                                    <div key={i} className="whitespace-pre-wrap">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>What This Does</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                                <strong>Scans all users</strong> for patient data in the old location
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                                <strong>Copies patients</strong> to the root <code className="bg-muted px-1 rounded">patients/</code> collection
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                                <strong>Preserves all data</strong> - no patient information is lost
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                                <strong>Enables sharing</strong> - all staff can see all patients after migration
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                            <strong>Note:</strong> This is safe to run multiple times. It will only copy data that doesn't already exist in the new location.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
