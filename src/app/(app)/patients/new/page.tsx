
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
      // Here, you would typically send data to your backend API
      // For now, we use the local storage hook
      const newPatient = addPatient(data);
      toast({
        title: "Patient Registered",
        description: `${newPatient.name} (ID: ${newPatient.nephroId}) has been successfully registered.`,
      });
      router.push(`/patients/${newPatient.id}`); // Redirect to patient profile page
    } catch (error) {
      console.error("Failed to register patient:", error);
      toast({
        title: "Registration Failed",
        description: "An error occurred while registering the patient. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
    // setIsSubmitting(false); // Only set to false on error, success causes redirect
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Register New Patient" description="Fill in the details below to add a new patient." />
      <PatientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
