
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PatientProfileView } from '@/components/patients/patient-profile-view';
import { PageHeader } from '@/components/shared/page-header';
import { usePatientData } from '@/hooks/use-patient-data';
import type { Patient } from '@/lib/types';
import { ArrowLeft, Edit, Printer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { getPatientById, isLoading: dataLoading } = usePatientData();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const patientId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (patientId && !dataLoading) {
      const fetchedPatient = getPatientById(patientId);
      if (fetchedPatient) {
        setPatient(fetchedPatient);
      } else {
        // Handle patient not found, maybe redirect or show error
        router.push('/patients?error=notfound');
      }
      setIsLoading(false);
    } else if (!dataLoading && !patientId) {
        router.push('/patients?error=invalid_id');
        setIsLoading(false);
    }
  }, [patientId, getPatientById, router, dataLoading]);

  if (isLoading || dataLoading) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Loading Patient Profile..." />
        <div className="space-y-6 mt-6">
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Patient Not Found" description="The requested patient could not be found." />
        <Button variant="outline" onClick={() => router.push('/patients')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients List
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title={`${patient.name} (${patient.nephroId})`}
        description={`Patient Profile Overview. Registered on ${new Date(patient.registrationDate).toLocaleDateString()}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button asChild variant="outline">
              <Link href={`/patients/${patient.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Link>
            </Button>
             <Button variant="default" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print Summary
            </Button>
          </div>
        }
      />
      <div className="mt-6">
        <PatientProfileView patient={patient} />
      </div>
    </div>
  );
}
