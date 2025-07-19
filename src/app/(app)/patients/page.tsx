
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PatientsTable } from '@/components/patients/patients-table';
import { PageHeader } from '@/components/shared/page-header';
import { usePatientData } from '@/hooks/use-patient-data';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientsPage() {
  const { patients, isLoading, deletePatient } = usePatientData();

  if (isLoading) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader 
          title="Patient Records" 
          description="Manage all patient information and history."
          actions={<Button disabled><PlusCircle className="mr-2 h-4 w-4" /> Add New Patient</Button>}
        />
        <div className="space-y-4 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title="Patient Records" 
        description="Manage all patient information and history."
        actions={
          <Button disabled>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient (Disabled)
          </Button>
        }
      />
      <div className="mt-6">
        <PatientsTable patients={patients} onDeletePatient={deletePatient} />
      </div>
    </div>
  );
}
