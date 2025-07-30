
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PatientForm, type PatientFormData } from '@/components/patients/patient-form';
import { PageHeader } from '@/components/shared/page-header';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from "@/hooks/use-toast";
import type { Patient } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const { getPatientById, updatePatient, isLoading: isPatientDataLoading } = usePatientData();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const patientId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (patientId && !isPatientDataLoading) {
      const fetchedPatient = getPatientById(patientId);
      if (fetchedPatient) {
        setPatient(fetchedPatient);
      } else {
        toast({ title: "Patient not found", variant: "destructive" });
        router.push('/patients');
      }
      setIsLoading(false);
    }
  }, [patientId, getPatientById, router, toast, isPatientDataLoading]);

  const handleSubmit = (data: PatientFormData) => {
    if (!patient) return;
    updatePatient(patient.id, data);
    toast({
      title: "Patient Updated",
      description: `${data.name}'s profile has been successfully updated.`,
    });
    router.push(`/patients/${patient.id}`);
  };

  if (isLoading || isPatientDataLoading) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Loading Patient for Editing..." />
        <Skeleton className="h-96 w-full mt-6" />
      </div>
    );
  }

  if (!patient) {
     return (
      <div className="container mx-auto py-2">
        <PageHeader title="Could not load patient data." />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title={`Edit Profile: ${patient.name}`}
        description="Update the patient's demographic and contact details."
        backHref={`/patients/${patient.id}`}
      />
      <div className="mt-6">
        <PatientForm
          onSubmit={handleSubmit}
          isSubmitting={false} // You can add submitting state if needed
          existingPatientData={patient}
        />
      </div>
    </div>
  );
}
