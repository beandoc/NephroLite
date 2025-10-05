
"use client";

import Link from 'next/link';
import { useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePatientData } from '@/hooks/use-patient-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Droplets, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HdRegistryPage() {
  const { patients, isLoading } = usePatientData();

  const hdPatients = useMemo(() => {
    return patients.filter(p => p.clinicalProfile.tags?.includes('HD'));
  }, [patients]);

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Hemodialysis Registry"
        description="Manage and review hemodialysis sessions for patients."
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            HD Patient Roster
          </CardTitle>
          <CardDescription>
            Showing {hdPatients.length} patient(s) tagged for Hemodialysis. Click on a patient to view their session history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : hdPatients.length > 0 ? (
            <div className="space-y-3">
              {hdPatients.map(patient => (
                <Link key={patient.id} href={`/hd-registry/${patient.id}`} passHref>
                  <Button variant="outline" className="w-full h-auto justify-between items-center p-4 text-left">
                    <div>
                      <p className="font-semibold text-base">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-muted-foreground">Nephro ID: {patient.nephroId}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-center">
                No patients found with the 'HD' clinical tag.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
