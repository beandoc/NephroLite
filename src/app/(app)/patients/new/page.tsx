
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PatientForm, type PatientFormData } from '@/components/patients/patient-form';
import { PageHeader } from '@/components/shared/page-header';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from "@/hooks/use-toast";

export default function NewPatientPage() {
  const router = useRouter();
  const { addPatient } = usePatientData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const newPatient = addPatient(data);
      toast({
        title: "Patient Registered Successfully",
        description: `Patient ${newPatient.name} (${newPatient.nephroId}) has been added to the records.`,
      });
      router.push('/patients');
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

  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title="New Patient Registration" 
        description="Fill in the demographic and contact details for the new patient." 
      />
      <div className="mt-6">
        <PatientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
