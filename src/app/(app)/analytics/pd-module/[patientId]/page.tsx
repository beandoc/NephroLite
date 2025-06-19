
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Calendar, Droplet, Edit3, Gauge, Syringe, UserCircle, Weight, ListChecks, FileText, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePatientData } from '@/hooks/use-patient-data';
import type { Patient } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data structure for a single PD patient's detailed data
interface PdExchange {
  id: string;
  exchangeNo: number;
  strength: string;
  exchangeTime: string;
  dwellTime: string;
  dwellVolume: string;
}

interface PeritonitisEpisode {
    id: string;
    date: string; // YYYY-MM-DD
    organism: string;
    outcome: 'Cured' | 'Catheter Removed' | 'Shifted to HD' | 'Death' | 'Ongoing';
}

interface MockPdPatientDetail {
  id: string; // Corresponds to patientId
  pdStartDate?: string;
  transferSetDate?: string;
  transporterStatus?: string;
  ktVValue?: string;
  baselineWeight?: string;
  baselineBP?: string;
  baselineUrineOutput?: string;
  numberOfCycles?: number;
  generalDwellVolume?: string;
  exchangeSchedule: PdExchange[];
  peritonitisHistory: PeritonitisEpisode[];
}

// Sample data for one patient for demonstration
// Keys should match actual patient IDs from usePatientData
const samplePdDataForPatient: Record<string, MockPdPatientDetail> = {
    "fixed-pd-patient-id-1": { // Matches Rajesh Kumar's fixed ID
        id: "fixed-pd-patient-id-1",
        pdStartDate: "2025-06-03",
        transferSetDate: "2025-06-19",
        transporterStatus: "Average",
        ktVValue: "1.2",
        baselineWeight: "89 kg",
        baselineBP: "130/80 mmHg",
        baselineUrineOutput: "1500 mL/24hr",
        numberOfCycles: 4,
        generalDwellVolume: "2L",
        exchangeSchedule: [
            { id: 'ex1', exchangeNo: 1, strength: "1.5%D", exchangeTime: "Day", dwellTime: "4 hours", dwellVolume: "2L" },
            { id: 'ex2', exchangeNo: 2, strength: "2.5%D", exchangeTime: "Day", dwellTime: "4 hours", dwellVolume: "2L" },
            { id: 'ex3', exchangeNo: 3, strength: "2.5%D", exchangeTime: "Day", dwellTime: "4 hours", dwellVolume: "2L" },
            { id: 'ex4', exchangeNo: 4, strength: "7.5%D", exchangeTime: "Night", dwellTime: "10 hours", dwellVolume: "2L" },
        ],
        peritonitisHistory: [
             { id: 'p1', date: '2025-07-15', organism: 'Staphylococcus aureus', outcome: 'Cured' },
        ],
    },
    "fixed-pd-patient-id-2": { // Matches Priya Sharma's fixed ID
        id: "fixed-pd-patient-id-2",
        pdStartDate: "2024-11-10",
        transferSetDate: "2024-11-25",
        transporterStatus: "High-Average",
        ktVValue: "1.5",
        baselineWeight: "75 kg",
        baselineBP: "120/70 mmHg",
        baselineUrineOutput: "1200 mL/24hr",
        numberOfCycles: 3,
        generalDwellVolume: "2.5L",
        exchangeSchedule: [
            { id: 'ex1', exchangeNo: 1, strength: "1.5%D", exchangeTime: "Day", dwellTime: "5 hours", dwellVolume: "2.5L" },
            { id: 'ex2', exchangeNo: 2, strength: "2.5%D", exchangeTime: "Day", dwellTime: "5 hours", dwellVolume: "2.5L" },
            { id: 'ex3', exchangeNo: 3, strength: "4.25%D", exchangeTime: "Night", dwellTime: "9 hours", dwellVolume: "2.5L" },
        ],
        peritonitisHistory: [],
    }
};


const DetailItem = ({ label, value, icon: Icon, className }: { label: string; value?: string | number | null; icon?: React.ElementType, className?: string }) => (
  <div className={className || "mb-3"}>
    <h3 className="text-sm font-medium text-muted-foreground flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-1.5 text-primary" />}
      {label}
    </h3>
    <p className="text-md text-foreground">{value || 'N/A'}</p>
  </div>
);

export default function IndividualPDPage() {
  const router = useRouter();
  const params = useParams();
  const { getPatientById, isLoading: patientDataLoading } = usePatientData();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [pdData, setPdData] = useState<MockPdPatientDetail | null>(null);
  
  const patientId = typeof params.patientId === 'string' ? params.patientId : undefined;

  useEffect(() => {
    if (patientId && !patientDataLoading) {
      const generalPatientData = getPatientById(patientId);
      setPatient(generalPatientData || null);
      setPdData(samplePdDataForPatient[patientId] || null);
    }
  }, [patientId, getPatientById, patientDataLoading]);

  if (patientDataLoading || !patientId) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Loading Patient PD Details..." />
        <Card className="mt-6">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Patient Not Found" description="Could not find details for the specified patient in the main patient roster." />
        <Button variant="outline" onClick={() => router.push('/analytics/pd-module')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to PD Roster
        </Button>
      </div>
    );
  }
  
  if (!pdData) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title={`PD Details for ${patient.name}`} description="No specific Peritoneal Dialysis data found for this patient." />
         <Button variant="outline" onClick={() => router.push('/analytics/pd-module')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to PD Roster
        </Button>
        <Card className="mt-6">
            <CardContent className="p-6 text-center text-muted-foreground">
                This patient does not have detailed PD data recorded yet.
                <br/>
                <Button variant="link" className="mt-2" disabled>Add PD Data (WIP)</Button>
            </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title={`PD Details for ${patient.name}`}
        description={`Nephro ID: ${patient.nephroId}`}
        actions={
          <Button variant="outline" onClick={() => router.push('/analytics/pd-module')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to PD Roster
          </Button>
        }
      />

      <div className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Calendar className="mr-2 h-5 w-5 text-primary"/>PD Overview & Catheter</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <DetailItem label="PD Start Date" value={pdData.pdStartDate ? format(parseISO(pdData.pdStartDate), 'PPP') : 'N/A'} />
            <DetailItem label="Transfer Set Date" value={pdData.transferSetDate ? format(parseISO(pdData.transferSetDate), 'PPP') : 'N/A'} />
            <div className="md:col-span-2 mt-2">
                <Button variant="outline" size="sm" disabled><Edit3 className="mr-2 h-4 w-4" />Manage PD Catheter Data (WIP)</Button>
                <p className="text-xs text-muted-foreground mt-1">Log catheter insertion, exit site care, and transfer set changes.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Droplet className="mr-2 h-5 w-5 text-primary"/>PD Prescription & Exchange Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-4">
                <DetailItem label="No. of Exchange Cycles" value={pdData.numberOfCycles} />
                <DetailItem label="General Dwell Volume" value={pdData.generalDwellVolume} />
            </div>
            {pdData.exchangeSchedule && pdData.exchangeSchedule.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exchange #</TableHead>
                    <TableHead>PD Strength</TableHead>
                    <TableHead>Exchange Time</TableHead>
                    <TableHead>Dwell Time</TableHead>
                    <TableHead>Dwell Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pdData.exchangeSchedule.map((ex) => (
                    <TableRow key={ex.id}>
                      <TableCell>{ex.exchangeNo}</TableCell>
                      <TableCell>{ex.strength}</TableCell>
                      <TableCell>{ex.exchangeTime}</TableCell>
                      <TableCell>{ex.dwellTime}</TableCell>
                      <TableCell>{ex.dwellVolume}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No exchange schedule defined.</p>
            )}
            <div className="mt-4">
                 <Button variant="outline" size="sm" disabled><Edit3 className="mr-2 h-4 w-4" />Manage PD Prescriptions (WIP)</Button>
                 <p className="text-xs text-muted-foreground mt-1">Enter and track PD solution types, cycles, concentrations, and dwell details.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Gauge className="mr-2 h-5 w-5 text-primary"/>PD Baseline & Adequacy</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <DetailItem label="Transporter Status" value={pdData.transporterStatus} />
            <DetailItem label="Kt/V Value" value={pdData.ktVValue} />
            <DetailItem label="Baseline Weight" value={pdData.baselineWeight} />
            <DetailItem label="Baseline BP" value={pdData.baselineBP || "(Placeholder)"} />
            <DetailItem label="Baseline Urine Output" value={pdData.baselineUrineOutput || "(Placeholder)"} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-primary"/>Peritonitis History</CardTitle>
          </CardHeader>
          <CardContent>
            {pdData.peritonitisHistory && pdData.peritonitisHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Organism</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pdData.peritonitisHistory.map((episode) => (
                    <TableRow key={episode.id}>
                      <TableCell>{format(parseISO(episode.date), 'PPP')}</TableCell>
                      <TableCell>{episode.organism}</TableCell>
                      <TableCell>{episode.outcome}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No peritonitis episodes recorded.</p>
            )}
             <div className="mt-4">
                <Button variant="outline" size="sm" disabled><Edit3 className="mr-2 h-4 w-4" />Log New Peritonitis Episode (WIP)</Button>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Daily Monitoring & Notes</CardTitle>
            <CardDescription>Log patient symptoms, ultrafiltration, vitals, and urine output.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Daily monitoring input area placeholder (WIP)</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Record patient symptoms, ultrafiltration, pulse, BP, and daily urine output here.</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
