
"use client";

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { usePatientData } from '@/hooks/use-patient-data';
import { isToday, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Clock, ChevronRight, PlayCircle, Users, CheckCircle, Ban, Forward, Tv2, Copy } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { Appointment } from '@/lib/types';

export default function OpdQueuePage() {
  const { appointments, isLoading, updateAppointmentStatus, updateMultipleAppointmentStatuses } = useAppointmentData();
  const { toast } = useToast();
  const router = useRouter();

  const { nowServing, waitingList } = useMemo(() => {
    const todaysAppointments = appointments.filter(app => {
      try {
        return isToday(parseISO(app.date));
      } catch {
        return false;
      }
    });

    const nowServing = todaysAppointments.find(app => app.status === 'Now Serving') || null;
    const waitingList = todaysAppointments
      .filter(app => app.status === 'Waiting')
      .sort((a, b) => a.time.localeCompare(b.time));
    
    return { nowServing, waitingList };
  }, [appointments]);

  const handleCallNext = () => {
    if (waitingList.length === 0) {
      toast({ title: "Queue is empty", description: "No patients are currently waiting." });
      return;
    }

    const updates: { id: string; status: Appointment['status'] }[] = [];
    const nextPatient = waitingList[0];

    // Mark current patient as completed, if there is one
    if (nowServing) {
      updates.push({ id: nowServing.id, status: 'Completed' });
    }

    // Mark next patient as now serving
    updates.push({ id: nextPatient.id, status: 'Now Serving' });

    updateMultipleAppointmentStatuses(updates);

    toast({
      title: "Next Patient Called",
      description: `${nextPatient.patientName} is now being served.`,
    });
  };
  
  const handleCopyDisplayLink = () => {
    const url = new URL('/opd-display/public', window.location.origin);
    navigator.clipboard.writeText(url.href);
    toast({
        title: "Link Copied",
        description: "The public waiting room display link has been copied to your clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="OPD Queue Management" description="Loading today's patient queue..." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-1"><Skeleton className="h-48 w-full" /></div>
          <div className="md:col-span-2"><Skeleton className="h-96 w-full" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="OPD Queue Management"
        description="Manage the live patient queue for today's outpatient department."
        actions={
          <div className="flex gap-2">
            <Button onClick={handleCopyDisplayLink} variant="secondary">
              <Copy className="mr-2 h-4 w-4" /> Copy Public Display Link
            </Button>
            <Button onClick={() => router.push('/opd-display/public')} variant="outline">
              <Tv2 className="mr-2 h-4 w-4" /> Open Public Display
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Control Panel & Now Serving */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Queue Control</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCallNext} size="lg" className="w-full" disabled={waitingList.length === 0}>
                <Forward className="mr-2 h-5 w-5" /> Call Next Patient
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><PlayCircle className="mr-2 h-5 w-5 text-green-500" />Now Serving</CardTitle>
            </CardHeader>
            <CardContent>
              {nowServing ? (
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-primary">{nowServing.patientName}</p>
                  <p className="text-sm text-muted-foreground flex items-center"><Clock className="mr-1.5 h-4 w-4" />Scheduled at {nowServing.time}</p>
                  <p className="text-sm text-muted-foreground flex items-center"><User className="mr-1.5 h-4 w-4" />Nephro ID: {nowServing.patientId.split('-')[0]}</p>
                   <Button variant="link" asChild className="p-0 h-auto mt-2">
                        <Link href={`/patients/${nowServing.patientId}`}>View Patient Profile</Link>
                   </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No patient is currently being served.</p>
                  <p className="text-sm">Click "Call Next" to begin.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Waiting List */}
        <div className="md:col-span-2">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Waiting List</CardTitle>
              <CardDescription>Patients who have checked in and are waiting to be seen. Total waiting: {waitingList.length}</CardDescription>
            </CardHeader>
            <CardContent>
              {waitingList.length > 0 ? (
                <ul className="space-y-3">
                  {waitingList.map((app, index) => (
                    <li key={app.id} className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-primary mr-4">{index + 1}</span>
                        <div>
                          <p className="font-semibold">{app.patientName}</p>
                          <p className="text-sm text-muted-foreground">Scheduled: {app.time} &bull; Type: {app.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toast({title: "WIP"})} title="Mark as Completed">
                            <CheckCircle className="h-4 w-4 text-green-600"/>
                        </Button>
                         <Button variant="ghost" size="sm" onClick={() => toast({title: "WIP"})} title="Mark as No Show">
                            <Ban className="h-4 w-4 text-red-600"/>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/patients/${app.patientId}`}><ChevronRight className="h-5 w-5"/></Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-lg">The waiting list is empty.</p>
                  <p>Patients with "Waiting" status will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
