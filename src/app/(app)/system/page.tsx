
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users, BellDot, ShieldCheck, Upload, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from '@/context/auth-provider';
import * as firestoreHelpers from '@/lib/firestore-helpers';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS } from '@/lib/mock-data';
import { INVESTIGATION_MASTER_LIST, INVESTIGATION_PANELS } from '@/lib/constants';
import type { Patient, Appointment } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

export default function SystemSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleAction = (feature: string) => {
    toast({
      title: "Feature Under Development",
      description: `The ${feature} feature is a work in progress.`
    })
  }

  const migrateLocalStorageData = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to migrate data.",
        variant: "destructive"
      });
      return;
    }

    setIsMigrating(true);
    setMigrationProgress(0);
    setMigrationStatus('idle');

    try {
      // Step 1: Get data from localStorage
      const storedPatients = localStorage.getItem('patients');
      const storedAppointments = localStorage.getItem('appointments');
      const storedInvestigations = localStorage.getItem('investigationMasterList');
      const storedPanels = localStorage.getItem('investigationPanels');

      const patients: Patient[] = storedPatients ? JSON.parse(storedPatients) : MOCK_PATIENTS;
      const appointments: Appointment[] = storedAppointments ? JSON.parse(storedAppointments) : MOCK_APPOINTMENTS;
      const investigationMasterList = storedInvestigations ? JSON.parse(storedInvestigations) : INVESTIGATION_MASTER_LIST;
      const investigationPanels = storedPanels ? JSON.parse(storedPanels) : INVESTIGATION_PANELS;

      const totalSteps = patients.length + appointments.length + 2; // +2 for investigation master data
      let completed = 0;

      // Step 2: Migrate patients (with subcollections)
      for (const patient of patients) {
        const { visits, investigationRecords, interventions, dialysisSessions, ...patientData } = patient;

        // Create patient
        await firestoreHelpers.createPatient(user.uid, patientData as Patient);

        // Add subcollections
        if (visits && visits.length > 0) {
          for (const visit of visits) {
            await firestoreHelpers.addVisit(user.uid, patient.id, visit);
          }
        }

        if (investigationRecords && investigationRecords.length > 0) {
          for (const record of investigationRecords) {
            await firestoreHelpers.addInvestigationRecord(user.uid, patient.id, record);
          }
        }

        if (interventions && interventions.length > 0) {
          for (const intervention of interventions) {
            await firestoreHelpers.addIntervention(user.uid, patient.id, intervention);
          }
        }

        if (dialysisSessions && dialysisSessions.length > 0) {
          for (const session of dialysisSessions) {
            await firestoreHelpers.addDialysisSession(user.uid, patient.id, session);
          }
        }

        completed++;
        setMigrationProgress(Math.round((completed / totalSteps) * 100));
      }

      // Step 3: Migrate appointments
      for (const appointment of appointments) {
        await firestoreHelpers.createAppointment(user.uid, appointment);
        completed++;
        setMigrationProgress(Math.round((completed / totalSteps) * 100));
      }

      // Step 4: Migrate investigation master data
      await firestoreHelpers.updateInvestigationMaster(user.uid, {
        investigationMasterList,
        investigationPanels
      });
      completed++;
      setMigrationProgress(100);

      setMigrationStatus('success');
      toast({
        title: "Migration Successful!",
        description: `Migrated ${patients.length} patients and ${appointments.length} appointments to Firestore.`
      });

    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "An error occurred during migration.",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="System Settings" description="Configure application settings and preferences." />
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card className="md:col-span-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="font-headline flex items-center text-xl">
              <Database className="mr-2 h-6 w-6 text-primary" />
              Data Migration Tool
            </CardTitle>
            <CardDescription>
              Transfer your existing localStorage data to Firebase Firestore. This is a one-time operation.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {migrationStatus === 'idle' && (
              <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Before you migrate:</p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                    <li>Ensure you're logged in with the correct account</li>
                    <li>This will copy all patients, appointments, and settings to Firestore</li>
                    <li>Existing Firestore data will be merged (duplicates may occur)</li>
                  </ul>
                </div>
              </div>
            )}

            {migrationStatus === 'success' && (
              <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Migration Completed Successfully!</p>
                  <p className="text-sm text-green-800 mt-1">
                    All your data has been transferred to Firestore. You can now use the app with cloud sync.
                  </p>
                </div>
              </div>
            )}

            {migrationStatus === 'error' && (
              <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Migration Failed</p>
                  <p className="text-sm text-red-800 mt-1">
                    Please check the console for error details and try again.
                  </p>
                </div>
              </div>
            )}

            {isMigrating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Migration Progress</span>
                  <span className="font-medium">{migrationProgress}%</span>
                </div>
                <Progress value={migrationProgress} className="h-2" />
              </div>
            )}

            <Button
              onClick={migrateLocalStorageData}
              disabled={isMigrating || !user}
              className="w-full"
              size="lg"
            >
              <Upload className="mr-2 h-5 w-5" />
              {isMigrating ? 'Migrating Data...' : 'Start Migration'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">User role and permission settings.</p>
            <Button onClick={() => handleAction('User Management')}>Manage Users</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><BellDot className="mr-2 h-5 w-5 text-primary" />Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive email updates for critical alerts.
                </span>
              </Label>
              <Switch id="email-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="whatsapp-notifications" className="flex flex-col space-y-1">
                <span>WhatsApp Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive WhatsApp messages for urgent appointment changes from +91 9665183839
                </span>
              </Label>
              <Switch id="whatsapp-notifications" />
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary" />Security & Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Access audit logs and security settings.</p>
            <Button onClick={() => handleAction('Audit Logs')}>View Audit Logs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
