
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PatientForm, type PatientFormData } from '@/components/patients/patient-form';
import { PageHeader } from '@/components/shared/page-header';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from "@/hooks/use-toast";
import type { Patient, ClinicalProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ClinicalProfileForm } from '@/components/patients/clinical-profile-form';

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const { getPatientById, updatePatient, updateClinicalProfile, isLoading: isPatientDataLoading } = usePatientData();
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

  const handleDemographicsSubmit = (data: PatientFormData) => {
    if (!patient) return;
    updatePatient(patient.id, data);
    toast({
      title: "Patient Demographics Updated",
      description: `${data.name}'s profile has been successfully updated.`,
    });
    router.push(`/patients/${patient.id}`);
  };
  
  const handleClinicalSubmit = (data: ClinicalProfile) => {
      if(!patient) return;
      updateClinicalProfile(patient.id, data);
      toast({
        title: "Clinical Profile Updated",
        description: `${patient.name}'s clinical profile has been successfully updated.`,
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
        description="Update the patient's demographic and clinical details."
        backHref={`/patients/${patient.id}`}
      />
      <div className="mt-6 space-y-8">
        <PatientForm
          onSubmit={handleDemographicsSubmit}
          isSubmitting={false}
          existingPatientData={patient}
        />
        <ClinicalProfileForm 
          onSubmit={handleClinicalSubmit}
          isSubmitting={false}
          existingProfileData={patient.clinicalProfile}
        />
      </div>
    </div>
  );
}
