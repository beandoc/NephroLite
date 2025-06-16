
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PatientForm, type PatientFormData } from '@/components/patients/patient-form';
import { PageHeader } from '@/components/shared/page-header';
import { usePatientData } from '@/hooks/use-patient-data';
import type { Patient } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const { getPatientById, updatePatient, isLoading: dataLoading } = usePatientData();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const patientId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (patientId && !dataLoading) {
      const fetchedPatient = getPatientById(patientId);
      if (fetchedPatient) {
        setPatient(fetchedPatient);
      } else {
        toast({ title: "Patient Not Found", variant: "destructive" });
        router.push('/patients');
      }
      setIsLoading(false);
    } else if (!dataLoading && !patientId) {
        toast({ title: "Invalid Patient ID", variant: "destructive" });
        router.push('/patients');
        setIsLoading(false);
    }
  }, [patientId, getPatientById, router, toast, dataLoading]);

  const handleSubmit = async (data: PatientFormData) => {
    if (!patient) return;
    setIsSubmitting(true);
    try {
      const updatedPatientData: Patient = {
        ...patient, // Retain existing id, nephroId, registrationDate
        ...data, // Apply form data
      };
      updatePatient(updatedPatientData);
      toast({
        title: "Patient Updated",
        description: `${updatedPatientData.name}'s profile has been successfully updated.`,
      });
      router.push(`/patients/${patient.id}`);
    } catch (error) {
      console.error("Failed to update patient:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the patient. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading || dataLoading) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Loading Patient Data..." />
        <div className="space-y-6 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!patient) {
    // This case should ideally be handled by the useEffect redirect, but as a fallback:
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Patient Not Found" description="Cannot edit non-existent patient." />
         <Button variant="outline" onClick={() => router.push('/patients')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients List
          </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title={`Edit Patient: ${patient.name}`}
        description={`Updating profile for Nephro ID: ${patient.nephroId}`}
        actions={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
            </Button>
        }
      />
      <PatientForm patient={patient} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
