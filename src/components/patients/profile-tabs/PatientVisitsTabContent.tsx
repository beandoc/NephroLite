
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { MockVisitHistory } from './MockVisitHistory';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { CreateVisitDialog } from '@/components/visits/create-visit-dialog';


interface PatientVisitsTabContentProps {
  patient: Patient;
}

export function PatientVisitsTabContent({ patient }: PatientVisitsTabContentProps) {
  const { toast } = useToast();
  const { addVisitToPatient, getPatientById } = usePatientData();
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);

  // We need to get the latest patient data from the hook in case it was updated
  const currentPatientData = getPatientById(patient.id);
  const visits = currentPatientData?.visits || [];

  const handleVisitCreated = (patientId: string) => {
    setIsVisitDialogOpen(false);
    toast({
      title: "New Visit Created",
      description: `A new visit has been added for ${patient.name}.`,
    });
    // The data hook already triggers a re-render, so no need to force one here.
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Visit History</CardTitle>
          <CardDescription>Chronological record of patient consultations and visits. Click on a visit to see details.</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 md:px-6">
           <MockVisitHistory visits={visits} onAddNewVisit={() => setIsVisitDialogOpen(true)} />
        </CardContent>
      </Card>
      
      {patient && (
        <CreateVisitDialog
          isOpen={isVisitDialogOpen}
          onOpenChange={setIsVisitDialogOpen}
          patient={patient}
          onVisitCreated={handleVisitCreated}
        />
      )}
    </>
  );
}
