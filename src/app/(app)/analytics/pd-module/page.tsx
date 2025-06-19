
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, Activity, ListChecks, Edit, FileBarChart, Zap, TrendingUp, Droplets, Syringe, BookOpen, Thermometer, Weight, BarChartHorizontalBig, Users } from 'lucide-react';

const pdExchangeData = [
  { exchange: 1, strength: '1.5%D', time: 'Day', dwellTime: '4 hours', dwellVol: '2L' },
  { exchange: 2, strength: '2.5%D', time: 'Day', dwellTime: '4 hours', dwellVol: '2L' },
  { exchange: 3, strength: '2.5%D', time: 'Day', dwellTime: '4 hours', dwellVol: '2L' },
  { exchange: 4, strength: '7.5%D', time: 'Night', dwellTime: '10 hours', dwellVol: '2L' },
];

export default function PDModulePage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Peritoneal Dialysis (PD) Management Module"
        description="Oversee and manage patients undergoing peritoneal dialysis."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary"/>PD Overview & Catheter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">PD Start Date:</span>
              <span className="text-muted-foreground">03-06-2025</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Transfer Set Date:</span>
              <span className="text-muted-foreground">19-06-2025</span>
            </div>
            <Button variant="link" className="p-0 h-auto text-base mt-2" disabled>
                <Syringe className="mr-2 h-4 w-4"/>Manage PD Catheter Data
            </Button>
            <p className="text-xs text-muted-foreground ml-6">Log catheter insertion, exit site care, and transfer set changes.</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>PD Prescription & Exchange Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">No. of Exchange Cycles:</span>
                <p className="text-2xl font-bold">4</p>
              </div>
              <div>
                <span className="font-medium">General Dwell Volume:</span>
                <p className="text-2xl font-bold">2L</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exchange #</TableHead>
                    <TableHead>PD Strength</TableHead>
                    <TableHead>Exchange Time</TableHead>
                    <TableHead>Dwell Time</TableHead>
                    <TableHead>Dwell Vol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pdExchangeData.map((item) => (
                    <TableRow key={item.exchange}>
                      <TableCell>{item.exchange}</TableCell>
                      <TableCell>{item.strength}</TableCell>
                      <TableCell>{item.time}</TableCell>
                      <TableCell>{item.dwellTime}</TableCell>
                      <TableCell>{item.dwellVol}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button variant="link" className="p-0 h-auto text-base mt-2" disabled>
                <Droplets className="mr-2 h-4 w-4"/>Manage PD Prescriptions
            </Button>
            <p className="text-xs text-muted-foreground ml-6">Enter and track PD solution types, cycles, concentrations, and dwell details.</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>PD Baseline & Adequacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Transporter Status:</span>
              <span className="text-muted-foreground">Average</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Kt/V Value:</span>
              <span className="text-muted-foreground">1.2</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Baseline Weight:</span>
              <span className="text-muted-foreground">89 kg</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Baseline BP:</span>
              <span className="text-muted-foreground">(Placeholder)</span>
            </div>
             <div className="flex justify-between">
              <span className="font-medium">Baseline Urine Output:</span>
              <span className="text-muted-foreground">(Placeholder)</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary"/>Daily Monitoring & Notes</CardTitle>
            <CardDescription>Log patient symptoms, ultrafiltration, vitals, and urine output.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
                 <p className="text-muted-foreground">Daily monitoring input area placeholder</p>
            </div>
            <p className="text-xs text-muted-foreground">Record patient symptoms, ultrafiltration, pulse, BP, and daily urine output.</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>PD Patient Roster & Program Stats</CardTitle>
            <CardDescription>Overview of PD patients and key program metrics.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-md font-semibold mb-2">PD Patient List</h3>
                <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
                     <p className="text-muted-foreground">Patient list placeholder</p>
                </div>
                <Button variant="outline" className="w-full mt-3" disabled>View Full PD Roster</Button>
            </div>
            <div>
                 <h3 className="text-md font-semibold mb-2">Program Metrics</h3>
                <div className="space-y-1 text-sm">
                    <p><strong>Total Active PD Patients:</strong> <span className="text-muted-foreground">(Placeholder)</span></p>
                    <p><strong>Average Duration on PD:</strong> <span className="text-muted-foreground">(Placeholder)</span></p>
                    <p><strong>Catheter Infection Rate:</strong> <span className="text-muted-foreground">(Placeholder)</span></p>
                    <p><strong>Peritonitis Rate:</strong> <span className="text-muted-foreground">(Placeholder)</span></p>
                </div>
                <div className="h-20 flex items-center justify-center border-2 border-dashed rounded-lg mt-2">
                     <p className="text-muted-foreground">Program stats chart placeholder</p>
                </div>
            </div>
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


    