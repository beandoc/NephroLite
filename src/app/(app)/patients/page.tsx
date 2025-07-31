
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PatientsTable } from '@/components/patients/patients-table';
import { PageHeader } from '@/components/shared/page-header';
import { usePatientData } from '@/hooks/use-patient-data';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientsPage() {
  const { patients, isLoading } = usePatientData();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');

  const filteredPatients = useMemo(() => {
    if (!statusFilter) {
      return patients;
    }
    return patients.filter(p => p.patientStatus === statusFilter);
  }, [patients, statusFilter]);

  const getPageTitle = () => {
    if (statusFilter === 'IPD') return 'IPD Patient Records';
    if (statusFilter === 'OPD') return 'OPD Patient Records';
    return 'Patient Records';
  };

  const getPageDescription = () => {
    if (statusFilter === 'IPD') return 'Showing all currently admitted patients.';
    if (statusFilter === 'OPD') return 'Showing all outpatient department patients.';
    return 'Manage all patient information and history.';
  };


  if (isLoading) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader 
          title="Patient Records" 
          description="Manage all patient information and history."
          actions={<Button disabled><PlusCircle className="mr-2 h-4 w-4" /> Add New Patient</Button>}
          backHref="/dashboard"
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
        title={getPageTitle()}
        description={getPageDescription()}
        actions={
          <Button asChild>
            <Link href="/patients/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient
            </Link>
          </Button>
        }
        backHref="/dashboard"
      />
      <div className="mt-6">
        <PatientsTable patients={filteredPatients} />
      </div>
    </div>
  );
}

