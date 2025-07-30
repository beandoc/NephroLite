
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PatientForm, type PatientFormData } from '@/components/patients/patient-form';
import { PageHeader } from '@/components/shared/page-header';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { CreateVisitDialog } from '@/components/visits/create-visit-dialog';
import type { Patient } from '@/lib/types';

export default function NewPatientPage() {
  const router = useRouter();
  const { addPatient } = usePatientData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [newlyCreatedPatient, setNewlyCreatedPatient] = useState<Patient | null>(null);

  const handleSubmit = (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const newPatient = addPatient(data);
      setNewlyCreatedPatient(newPatient);

      toast({
        title: "Patient Registered",
        description: `${newPatient.name} (${newPatient.nephroId}) has been added.`,
        action: (
          <Button onClick={() => setIsVisitDialogOpen(true)}>
            Create Visit
          </Button>
        ),
        duration: 10000, // Keep toast open longer
      });
      
      // The form will be reset via the onFormClear prop in PatientForm.
      setIsSubmitting(false);

    } catch (error) {
      console.error("Failed to register patient:", error);
      toast({
        title: "Registration Failed",
        description: "An error occurred while registering the patient. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleVisitCreated = (patientId: string) => {
    setIsVisitDialogOpen(false);
    setNewlyCreatedPatient(null);
    toast({
      title: "Initial Visit Created",
      description: "Redirecting to patient profile...",
    });
    router.push(`/patients/${patientId}`);
  };

  const handleClearForm = () => {
    // This function is passed to PatientForm to signal that it should clear itself.
    // The actual reset logic is within the PatientForm component itself.
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title="New Patient Registration" 
        description="Fill in the demographic and contact details for the new patient." 
      />
      <div className="mt-6">
        <PatientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} onFormClear={handleClearForm} />
      </div>

      {newlyCreatedPatient && (
        <CreateVisitDialog
          isOpen={isVisitDialogOpen}
          onOpenChange={setIsVisitDialogOpen}
          patient={newlyCreatedPatient}
          onVisitCreated={handleVisitCreated}
          onDialogClose={() => setNewlyCreatedPatient(null)}
        />
      )}
    </div>
  );
}
