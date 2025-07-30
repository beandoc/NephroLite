
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppointmentsTable } from '@/components/appointments/appointments-table';
import { PageHeader } from '@/components/shared/page-header';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { CalendarPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AppointmentsPage() {
  const { appointments, isLoading, updateAppointmentStatus } = useAppointmentData();

  if (isLoading) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader 
          title="Appointments" 
          description="Manage patient appointments schedule."
          actions={<Button disabled><CalendarPlus className="mr-2 h-4 w-4" /> Schedule New</Button>}
          backHref="/dashboard"
        />
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title="Appointments" 
        description="Manage patient appointments schedule."
        actions={
          <Button asChild>
            <Link href="/appointments/new">
              <CalendarPlus className="mr-2 h-4 w-4" /> Schedule New
            </Link>
          </Button>
        }
        backHref="/dashboard"
      />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline">Appointment List</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 py-6"> {/* Remove horizontal padding on mobile for table */}
          <AppointmentsTable appointments={appointments} onUpdateStatus={updateAppointmentStatus} />
        </CardContent>
      </Card>
    </div>
  );
}
