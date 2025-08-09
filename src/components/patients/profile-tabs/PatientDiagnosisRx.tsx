
"use client";

import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Pill, PlusCircle } from "lucide-react";
import type { Patient, Visit } from "@/lib/types";
import { useState } from "react";
import { CreateVisitDialog } from "@/components/visits/create-visit-dialog";
import { usePatientData } from "@/hooks/use-patient-data";

interface PatientDiagnosisRxProps {
    patient: Patient;
}

export const PatientDiagnosisRx = ({ patient: initialPatient }: PatientDiagnosisRxProps) => {
  const { toast } = useToast();
  const { currentPatient } = usePatientData();
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  
  // Get the most up-to-date patient data
  const patient = currentPatient(initialPatient.id) || initialPatient;
  
  const handleAddNew = () => {
    setIsVisitDialogOpen(true);
  };
  
  const handleVisitCreated = () => {
    setIsVisitDialogOpen(false);
    toast({ title: "New Visit Logged", description: "The new visit has been added to the patient's record." });
  }

  // Flatten and sort the history from all visits
  const history = (patient.visits || [])
    .filter(visit => (visit.diagnoses && visit.diagnoses.length > 0) || (visit.clinicalData?.medications && visit.clinicalData.medications.length > 0))
    .map(visit => ({
      id: visit.id,
      date: visit.date,
      diagnosis: visit.diagnoses && visit.diagnoses.length > 0 ? visit.diagnoses[0].name : "N/A", // Display first diagnosis
      medication: visit.clinicalData?.medications?.map(m => `${m.name} ${m.dosage || ''} ${m.frequency || ''}`.trim()).join(', ') || "No medication prescribed",
      doctor: 'Dr. Sachin' // Placeholder
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={handleAddNew} variant="outline"><PlusCircle className="mr-2 h-4 w-4"/>Log New Visit/Diagnosis</Button>
      </div>
      <div className="space-y-4">
        {history.map(item => (
          <Card key={item.id} className="shadow-sm">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-md font-semibold flex items-center"><Stethoscope className="w-5 h-5 mr-2 text-primary"/>{item.diagnosis}</CardTitle>
              <CardDescription>{format(new Date(item.date), 'PPP')} - Visit with {item.doctor}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm font-medium flex items-center text-muted-foreground"><Pill className="w-4 h-4 mr-2 text-primary"/>Medication:</p>
              <p className="text-sm text-foreground pl-6">{item.medication}</p>
            </CardContent>
          </Card>
        ))}
        {history.length === 0 && (
         <Card className="flex items-center justify-center h-32 border-dashed">
            <p className="text-muted-foreground text-center py-4">No diagnosis or medication history found.</p>
          </Card>
        )}
      </div>

       <CreateVisitDialog
          isOpen={isVisitDialogOpen}
          onOpenChange={setIsVisitDialogOpen}
          patient={patient}
          onVisitCreated={handleVisitCreated}
        />
    </>
  );
};
