
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
import { useAuth } from '@/context/auth-provider';
import { getPDBaseline, getPDExchanges, getPeritonitisEpisodes } from '@/lib/pd-firestore-helpers';
import { PDDataFormDialog } from '@/components/pd/pd-data-form';
import { PeritonitisFormDialog } from '@/components/pd/peritonitis-form';
import { PatientPDLogsDisplay } from '@/components/pd/patient-pd-logs-display';


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
  const { user } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [pdData, setPdData] = useState<any | null>(null);
  const [pdExchanges, setPdExchanges] = useState<any[]>([]);
  const [peritonitisEpisodes, setPeritonitisEpisodes] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPeritonitisFormOpen, setIsPeritonitisFormOpen] = useState(false);
  const [isLoadingPD, setIsLoadingPD] = useState(false);

  const patientId = typeof params.patientId === 'string' ? params.patientId : undefined;

  // Load patient data
  useEffect(() => {
    if (patientId && !patientDataLoading) {
      const generalPatientData = getPatientById(patientId);
      setPatient(generalPatientData || null);
    }
  }, [patientId, getPatientById, patientDataLoading]);

  // Load PD data from Firestore
  useEffect(() => {
    if (!user || !patientId) return;

    const loadPDData = async () => {
      try {
        setIsLoadingPD(true);
        const [baseline, exchanges, episodes] = await Promise.all([
          getPDBaseline(user.uid, patientId),
          getPDExchanges(user.uid, patientId),
          getPeritonitisEpisodes(user.uid, patientId)
        ]);

        setPdData(baseline);
        setPdExchanges(exchanges);
        setPeritonitisEpisodes(episodes);
      } catch (error) {
        console.error('Error loading PD data:', error);
      } finally {
        setIsLoadingPD(false);
      }
    };

    loadPDData();
  }, [user, patientId]);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    // Reload PD data
    if (user && patientId) {
      Promise.all([
        getPDBaseline(user.uid, patientId),
        getPDExchanges(user.uid, patientId),
        getPeritonitisEpisodes(user.uid, patientId)
      ]).then(([baseline, exchanges, episodes]) => {
        setPdData(baseline);
        setPdExchanges(exchanges);
        setPeritonitisEpisodes(episodes);
      });
    }
  };

  const handleMockAction = (action: string) => {
    toast({
      title: "Feature Under Development",
      description: `${action} functionality is a work-in-progress.`,
    })
  }

  if (patientDataLoading || !patientId || isLoadingPD) {
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
  const patientFullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ');

  // Show form dialog if no PD data
  if (!pdData && !isLoadingPD) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title={`PD Details for ${patientFullName}`} description="No specific Peritoneal Dialysis data found for this patient." />
        <Button variant="outline" onClick={() => router.push('/analytics/pd-module')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to PD Roster
        </Button>
        <Card className="mt-6">
          <CardContent className="p-6 text-center text-muted-foreground">
            This patient does not have detailed PD data recorded yet.
            <br />
            <Button variant="default" className="mt-4" onClick={handleOpenForm}>
              Add PD Data
            </Button>
          </CardContent>
        </Card>

        <PDDataFormDialog
          isOpen={isFormOpen}
          onOpenChange={handleFormClose}
          patientId={patientId!}
          patientName={patientFullName}
        />
      </div>
    );
  }


  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title={`PD Details for ${patientFullName}`}
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
            <CardTitle className="font-headline flex items-center"><Calendar className="mr-2 h-5 w-5 text-primary" />PD Overview & Catheter</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <DetailItem label="PD Start Date" value={pdData.pdStartDate ? format(parseISO(pdData.pdStartDate), 'PPP') : 'N/A'} />
            <DetailItem label="Transfer Set Date" value={pdData.transferSetDate ? format(parseISO(pdData.transferSetDate), 'PPP') : 'N/A'} />
            <div className="md:col-span-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleOpenForm}><Edit3 className="mr-2 h-4 w-4" />Edit PD Baseline</Button>
              <p className="text-xs text-muted-foreground mt-1">Log catheter insertion, exit site care, and transfer set changes.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Droplet className="mr-2 h-5 w-5 text-primary" />PD Prescription & Exchange Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-4">
              <DetailItem label="No. of Exchange Cycles" value={pdData.numberOfCycles} />
              <DetailItem label="General Dwell Volume" value={pdData.generalDwellVolume} />
            </div>
            {pdExchanges && pdExchanges.length > 0 ? (
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
                  {pdExchanges.map((ex: any) => (
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
              <Button variant="outline" size="sm" onClick={handleOpenForm}><Edit3 className="mr-2 h-4 w-4" />Manage PD Prescriptions</Button>
              <p className="text-xs text-muted-foreground mt-1">Enter and track PD solution types, cycles, concentrations, and dwell details.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Gauge className="mr-2 h-5 w-5 text-primary" />PD Baseline & Adequacy</CardTitle>
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
            <CardTitle className="font-headline flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-primary" />Peritonitis History</CardTitle>
          </CardHeader>
          <CardContent>
            {peritonitisEpisodes && peritonitisEpisodes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Organism</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peritonitisEpisodes.map((episode: any) => (
                    <TableRow key={episode.id}>
                      <TableCell>{episode.date ? format(parseISO(episode.date), 'PPP') : 'N/A'}</TableCell>
                      <TableCell>{episode.organism || 'N/A'}</TableCell>
                      <TableCell>{episode.outcome || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No peritonitis episodes recorded.</p>
            )}
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => setIsPeritonitisFormOpen(true)}><Edit3 className="mr-2 h-4 w-4" />Log New Peritonitis Episode</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary" />Daily Monitoring & Notes</CardTitle>
            <CardDescription>Log patient symptoms, ultrafiltration, vitals, and urine output.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Daily monitoring input area placeholder (WIP)</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Record patient symptoms, ultrafiltration, pulse, BP, and daily urine output here.</p>
          </CardContent>
        </Card>

        {/* Patient PD Daily Monitoring Logs */}
        <PatientPDLogsDisplay patientId={patientId!} />
      </div>

      {/* Dialogs */}
      <PDDataFormDialog
        isOpen={isFormOpen}
        onOpenChange={handleFormClose}
        patientId={patientId!}
        patientName={patientFullName}
        existingData={pdData}
      />

      <PeritonitisFormDialog
        isOpen={isPeritonitisFormOpen}
        onOpenChange={setIsPeritonitisFormOpen}
        patientId={patientId!}
        patientName={patientFullName}
        onSuccess={() => {
          if (user && patientId) {
            getPeritonitisEpisodes(user.uid, patientId).then(setPeritonitisEpisodes);
          }
        }}
      />
    </div>
  );
}
