
"use client";

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePatientData } from '@/hooks/use-patient-data';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import type { Patient, DialysisSession } from '@/lib/types';
import { DialysisSessionForm } from '@/components/dialysis/dialysis-session-form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="text-sm">{value || 'N/A'}</p>
  </div>
);

export default function PatientHDPage() {
  const router = useRouter();
  const params = useParams();
  const { getPatientById, isLoading, deleteDialysisSession } = usePatientData(); // Correctly get delete function
  const { toast } = useToast();
  const patientId = typeof params.patientId === 'string' ? params.patientId : '';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<DialysisSession | null>(null);

  const patient = useMemo(() => {
    if (isLoading || !patientId) return null;
    return getPatientById(patientId);
  }, [patientId, getPatientById, isLoading]);

  const sortedSessions = useMemo(() => {
    if (!patient?.dialysisSessions) return [];
    return [...patient.dialysisSessions].sort((a, b) => parseISO(b.dateOfSession).getTime() - parseISO(a.dateOfSession).getTime());
  }, [patient?.dialysisSessions]);

  const handleOpenForm = (session: DialysisSession | null = null) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };
  
  const handleDeleteSession = (sessionId: string) => {
    if(!patient) return;
    deleteDialysisSession(patient.id, sessionId);
    toast({
        title: "Dialysis Session Deleted",
        description: "The session has been removed from the patient's record.",
        variant: "destructive"
    });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Loading Patient Data..." backHref="/hd-registry" />
        <Skeleton className="mt-6 h-96 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Patient Not Found" backHref="/hd-registry" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-2">
        <PageHeader
          title={`Hemodialysis Log for ${patient.firstName} ${patient.lastName}`}
          description={`Patient ID: ${patient.nephroId}`}
          backHref="/hd-registry"
          actions={
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Log New HD Session
            </Button>
          }
        />

        <div className="mt-6 space-y-4">
          {sortedSessions.length === 0 ? (
            <Card>
              <CardContent className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No dialysis sessions recorded for this patient.</p>
              </CardContent>
            </Card>
          ) : (
            sortedSessions.map(session => (
              <Card key={session.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="font-headline text-lg">
                      Session on: {format(parseISO(session.dateOfSession), 'PPP')}
                    </CardTitle>
                    <CardDescription>
                      Duration: {session.duration.hours}h {session.duration.minutes}m &bull; Modality: {session.dialysisModality}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenForm(session)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {/* Add delete confirmation later */}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteSession(session.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <DetailItem label="Ultrafiltration" value={`${session.ultrafiltration || 0} mL`} />
                  <DetailItem label="Blood Flow Rate" value={`${session.bloodFlowRate || 0} mL/min`} />
                  <DetailItem label="Access Type" value={session.accessType} />
                  <DetailItem label="Anticoagulation" value={session.anticoagulation || 'N/A'} />
                  <DetailItem label="Pre-Session BP" value={`${session.bpBefore?.systolic}/${session.bpBefore?.diastolic} mmHg`}/>
                  <DetailItem label="Post-Session BP" value={`${session.bpAfter?.systolic}/${session.bpAfter?.diastolic} mmHg`}/>
                   <div className="col-span-full">
                     {session.complicationsFlag && (
                        <div className="text-destructive text-sm">
                            <span className="font-bold">Complications: </span>
                            {(session.complicationsDesc || []).map(c => <Badge key={c} variant="destructive" className="mr-1">{c}</Badge>)}
                        </div>
                     )}
                   </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      <DialysisSessionForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        patient={patient}
        session={editingSession}
      />
    </>
  );
}
