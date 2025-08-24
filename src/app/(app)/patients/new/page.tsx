
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PatientForm, type PatientFormData } from '@/components/patients/patient-form';
import { PageHeader } from '@/components/shared/page-header';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from "@/hooks/use-toast";
import { CreateVisitDialog } from '@/components/visits/create-visit-dialog';
import type { Patient } from '@/lib/types';

export default function NewPatientPage() {
  const router = useRouter();
  const { addPatient } = usePatientData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [newlyCreatedPatient, setNewlyCreatedPatient] = useState<Patient | null>(null);

  // This is a key to force re-mounting and thus clearing the form
  const [patientFormKey, setPatientFormKey] = useState(0);

  const handleSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const newPatient = await addPatient(data);
      setNewlyCreatedPatient(newPatient);
      
      toast({
        title: "Patient Registered",
        description: `${[newPatient.firstName, newPatient.lastName].join(' ')} (${newPatient.nephroId}) has been added.`,
      });

      // Programmatically open the dialog after successful registration
      setIsVisitDialogOpen(true);
      // Reset the form for the next entry by changing its key
      setPatientFormKey(prevKey => prevKey + 1);

    } catch (error) {
      console.error("Failed to register patient:", error);
      toast({
        title: "Registration Failed",
        description: "An error occurred while registering the patient. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false); // Also set submitting to false on error
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleVisitCreated = (patientId: string) => {
    setIsVisitDialogOpen(false);
    toast({
      title: "Initial Visit Created",
      description: "Redirecting to patient profile...",
    });
    router.push(`/patients/${patientId}?tab=visits`);
  };

  const handleDialogClose = () => {
    setNewlyCreatedPatient(null);
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title="New Patient Registration" 
        description="Fill in the demographic and contact details for the new patient." 
      />
      <div className="mt-6">
        <PatientForm key={patientFormKey} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>

      {newlyCreatedPatient && (
        <CreateVisitDialog
          isOpen={isVisitDialogOpen}
          onOpenChange={setIsVisitDialogOpen}
          patient={newlyCreatedPatient}
          onVisitCreated={handleVisitCreated}
          onDialogClose={handleDialogClose}
        />
      )}
    </div>
  );
}
