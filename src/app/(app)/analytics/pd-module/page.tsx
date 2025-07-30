
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ListChecks, FileBarChart, Edit, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePatientData } from '@/hooks/use-patient-data';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PDModulePage() {
  const { patients, isLoading: patientsLoading } = usePatientData();

  const pdPatients = useMemo(() => {
    if (patientsLoading) return [];
    return patients.filter(p => p.clinicalProfile.tags.includes('PD'));
  }, [patients, patientsLoading]);

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Peritoneal Dialysis (PD) Management Module"
        description="Oversee and manage patients undergoing peritoneal dialysis, track program statistics, and access PD-specific tools."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              PD Patient Roster & Program Stats
            </CardTitle>
            <CardDescription>Overview of PD patients and key program metrics.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-semibold mb-2">PD Patient List ({pdPatients.length})</h3>
              {patientsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : pdPatients.length > 0 ? (
                <ScrollArea className="h-40 border rounded-md p-2">
                  <ul className="space-y-2">
                    {pdPatients.map(patient => (
                      <li key={patient.id} className="p-2 border rounded-md hover:bg-muted/50 text-sm">
                        <Link href={`/analytics/pd-module/${patient.id}`} className="text-primary hover:underline">
                          {patient.name} ({patient.nephroId})
                        </Link>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">No PD patients found.</p>
                </div>
              )}
              <Button variant="outline" className="w-full mt-3">
                View Full PD Roster
              </Button>
            </div>
            <div>
              <h3 className="text-md font-semibold mb-2">Program Metrics</h3>
              <div className="space-y-2 text-sm p-3 border rounded-md bg-card">
                <div className="flex justify-between">
                  <span className="font-medium">Total Active PD Patients:</span>
                  {patientsLoading ? <Skeleton className="h-4 w-10 inline-block" /> : <span className="text-muted-foreground">{pdPatients.length}</span>}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Average Duration on PD:</span>
                  <span className="text-muted-foreground">(Placeholder)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Catheter Infection Rate:</span>
                  <span className="text-muted-foreground">(Placeholder)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Peritonitis Rate:</span>
                  <span className="text-muted-foreground">(Placeholder)</span>
                </div>
              </div>
              <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-lg mt-3">
                <p className="text-muted-foreground">Program stats chart placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary" />
              General PD Management & Data Tools
            </CardTitle>
            <CardDescription>
              Access tools for managing PD prescriptions, catheter data, and daily monitoring templates.
              Specific data entry occurs within individual patient PD profiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="link" className="p-0 h-auto text-base" disabled>
                Manage PD Catheter Data Templates
            </Button>
            <p className="text-xs text-muted-foreground ml-6">Setup templates for logging catheter insertion, exit site care, and transfer set changes.</p>
            
            <Button variant="link" className="p-0 h-auto text-base mt-2" disabled>
                Manage PD Prescription Templates
            </Button>
            <p className="text-xs text-muted-foreground ml-6">Define standard PD solution types, cycles, concentrations, and dwell details for quick use.</p>

            <Button variant="link" className="p-0 h-auto text-base mt-2" disabled>
                View Daily Monitoring Log Templates
            </Button>
            <p className="text-xs text-muted-foreground ml-6">Access and manage templates for daily patient symptom logging, ultrafiltration, vitals, etc.</p>
          </CardContent>
        </Card>
        

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <FileBarChart className="mr-2 h-5 w-5 text-primary" />
              Actions & Reports
            </CardTitle>
            <CardDescription>Quick actions and reporting tools for the PD program.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button disabled className="w-full">
              <Edit className="mr-2 h-4 w-4" /> Log New PD Incident (Program Level)
            </Button>
            <Button disabled className="w-full">
              <FileBarChart className="mr-2 h-4 w-4" /> PD Program Summary Report
            </Button>
            <Button disabled className="w-full">
              <Zap className="mr-2 h-4 w-4" /> Bulk Adequacy Assessment (WIP)
            </Button>
            <Button disabled className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" /> Program Trend Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
