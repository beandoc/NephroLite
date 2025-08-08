
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Calendar, Droplet, Edit3, Gauge, Syringe, UserCircle, Weight, ListChecks, FileText, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePatientData } from '@/hooks/use-patient-data';
import type { Patient, Visit } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';


// Mock data structure for a single PD patient's detailed data
// This is now an illustrative type, not a data source.
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

interface PdPatientDetail {
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
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [pdData, setPdData] = useState<PdPatientDetail | null>(null);
  
  const patientId = typeof params.patientId === 'string' ? params.patientId : undefined;

  useEffect(() => {
    if (patientId && !patientDataLoading) {
      const generalPatientData = getPatientById(patientId);
      setPatient(generalPatientData || null);
      
      // In a real app, this data would come from the patient object.
      // For now, we simulate this by checking a non-existent property.
      const detailedData = (generalPatientData as any)?.pdData;
      setPdData(detailedData || null);
    }
  }, [patientId, getPatientById, patientDataLoading]);

  const handleMockAction = (action: string) => {
    toast({
        title: "Feature Under Development",
        description: `${action} functionality is a work-in-progress.`,
    })
  }

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
                <Button variant="link" className="mt-2" onClick={() => handleMockAction('Adding PD Data')}>Add PD Data</Button>
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
                <Button variant="outline" size="sm" onClick={() => handleMockAction('Managing PD Catheter Data')}><Edit3 className="mr-2 h-4 w-4" />Manage PD Catheter Data</Button>
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
                 <Button variant="outline" size="sm" onClick={() => handleMockAction('Managing PD Prescriptions')}><Edit3 className="mr-2 h-4 w-4" />Manage PD Prescriptions</Button>
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
                <Button variant="outline" size="sm" onClick={() => handleMockAction('Logging Peritonitis Episode')}><Edit3 className="mr-2 h-4 w-4" />Log New Peritonitis Episode</Button>
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
