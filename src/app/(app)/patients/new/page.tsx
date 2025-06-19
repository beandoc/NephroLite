
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

  const handleSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const newPatient = addPatient(data);
      toast({
        title: "Patient Registered",
        description: `${newPatient.name} (ID: ${newPatient.nephroId}) has been successfully registered. Next, create their first visit.`,
      });
      router.push(`/patients/${newPatient.id}/create-visit`); // Redirect to create visit page
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
      <PageHeader title="Register New Patient" description="Fill in the details below to add a new patient. This form is part of the 'New Registration' flow." />
      <PatientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
