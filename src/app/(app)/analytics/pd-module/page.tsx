
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Users, ListChecks, Activity, FileBarChart, Syringe, Edit, BookOpen, Thermometer, Zap, TrendingUp } from 'lucide-react';

export default function PDModulePage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Peritoneal Dialysis (PD) Management Module"
        description="Oversee and manage patients undergoing peritoneal dialysis."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>PD Patient Roster</CardTitle>
            <CardDescription>Access and manage the list of PD patients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
                 <p className="text-muted-foreground">Patient list placeholder</p>
            </div>
            <Button variant="outline" className="w-full" disabled>View Full PD Roster</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>PD Program Overview</CardTitle>
            <CardDescription>Key metrics and statistics for the PD program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm"><strong>Total Active PD Patients:</strong> <span className="text-muted-foreground">(Placeholder)</span></p>
            <p className="text-sm"><strong>Average Duration on PD:</strong> <span className="text-muted-foreground">(Placeholder)</span></p>
            <p className="text-sm"><strong>Catheter Infection Rate:</strong> <span className="text-muted-foreground">(Placeholder)</span></p>
            <p className="text-sm"><strong>Peritonitis Rate:</strong> <span className="text-muted-foreground">(Placeholder)</span></p>
             <div className="h-20 flex items-center justify-center border-2 border-dashed rounded-lg mt-2">
                 <p className="text-muted-foreground">Program stats placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>PD Data Management Features</CardTitle>
            <CardDescription>Links to manage detailed PD patient data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="link" className="p-0 h-auto text-base" disabled>
                <Syringe className="mr-2 h-4 w-4"/>Manage PD Catheter Data
            </Button>
            <p className="text-xs text-muted-foreground ml-6">Log catheter insertion, exit site care, and transfer set changes.</p>
            
            <Button variant="link" className="p-0 h-auto text-base" disabled>
                <Droplets className="mr-2 h-4 w-4"/>Manage PD Prescriptions
            </Button>
            <p className="text-xs text-muted-foreground ml-6">Enter and track PD solution types, cycles, concentrations (1.5%, 2.5%, 7.5%), and night dwell details.</p>

            <Button variant="link" className="p-0 h-auto text-base" disabled>
                <BookOpen className="mr-2 h-4 w-4"/>Record Daily Monitoring
            </Button>
            <p className="text-xs text-muted-foreground ml-6">Log patient symptoms, ultrafiltration, pulse, BP, and daily urine output.</p>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><FileBarChart className="mr-2 h-5 w-5 text-primary"/>Actions & Reports</CardTitle>
            <CardDescription>Quick actions and reporting tools for the PD program.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button disabled className="w-full">
              <Edit className="mr-2 h-4 w-4" /> Log New PD Data
            </Button>
            <Button disabled className="w-full">
              <FileBarChart className="mr-2 h-4 w-4" /> PD Summary Report
            </Button>
             <Button disabled className="w-full">
              <Zap className="mr-2 h-4 w-4" /> Adequacy Assessment
            </Button>
             <Button disabled className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" /> Trend Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
