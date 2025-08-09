
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { usePatientData } from '@/hooks/use-patient-data'; // Import usePatientData
import { format, isToday, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { CalendarDays, User, Clock, Stethoscope, Eye, CheckCircle, XCircle, Loader2, Hospital, CalendarX, CalendarCheck, Hourglass } from 'lucide-react'; // Added new icons
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


export function TodaysAppointments() {
  const { appointments, isLoading, updateAppointmentStatus } = useAppointmentData(true); // << Use optimized hook
  const { admitPatient, getPatientById } = usePatientData(); // Get admitPatient function
  const { toast } = useToast();
  
  const today = new Date();
  
  // No need to filter by date anymore, the hook does it for us
  const todaysAppointments = appointments
    .filter(app => app.status === 'Scheduled')
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleUpdateStatus = (appointmentId: string, newStatus: Appointment['status'], patientName: string, patientId?: string) => {
    updateAppointmentStatus(appointmentId, newStatus);
    toast({
      title: "Appointment Updated",
      description: `${patientName}'s appointment marked as ${newStatus}.`
    });

    if (newStatus === 'Admitted' && patientId) {
      const patient = getPatientById(patientId);
      if (patient && patient.patientStatus !== 'IPD') {
        admitPatient(patientId);
        toast({
          title: "Patient Admitted",
          description: `${patientName} has been admitted.`
        });
      } else if (patient && patient.patientStatus === 'IPD') {
         toast({
          title: "Patient Already Admitted",
          description: `${patientName} is already marked as IPD.`
        });
      }
    }
  };


  if (isLoading) {
    return (
      <Card className="shadow-md h-full flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Today's Appointments</CardTitle>
          <CardDescription><Skeleton className="h-4 w-24" /></CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-md border border-dashed">
              <Skeleton className="h-8 w-1 bg-muted" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))}
        </CardContent>
        <div className="p-4 border-t">
           <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  const getStatusBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case 'Scheduled': return 'default';
      case 'Completed': return 'secondary'; // Consider a 'success' variant if available or green
      case 'Cancelled': return 'destructive';
      case 'Waiting': return 'outline'; // Consider a 'warning' variant or yellow
      case 'Not Showed': return 'destructive';
      case 'Admitted': return 'default'; // Consider a specific IPD color
      case 'Now Serving': return 'default';
      default: return 'default';
    }
  };


  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline">Today's Check-In</CardTitle>
          <div className="text-sm text-muted-foreground">{format(today, 'MMM d, yyyy')}</div>
        </div>
         <CardDescription>Move scheduled patients to the OPD queue.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0 sm:p-4 pt-0">
        {todaysAppointments.length > 0 ? (
          <ScrollArea className="flex-grow pr-3">
            <div className="space-y-3">
            {todaysAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="flex flex-col p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-grow">
                    <Link href={`/patients/${appointment.patientId}`} className="font-semibold text-sm text-primary hover:underline flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5" /> {appointment.patientName}
                    </Link>
                    <Badge 
                      variant={getStatusBadgeVariant(appointment.status)}
                      className="text-xs mt-1"
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-7 w-7 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {appointment.status === 'Scheduled' &&
                        <DropdownMenuItem onClick={() => handleUpdateStatus(appointment.id, 'Waiting', appointment.patientName)}>
                          <Hourglass className="mr-2 h-4 w-4 text-amber-600" /> Mark as Waiting
                        </DropdownMenuItem>
                      }
                      <DropdownMenuItem onClick={() => handleUpdateStatus(appointment.id, 'Completed', appointment.patientName)}>
                        <CalendarCheck className="mr-2 h-4 w-4 text-green-600" /> Mark Completed
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleUpdateStatus(appointment.id, 'Not Showed', appointment.patientName)}>
                        <CalendarX className="mr-2 h-4 w-4 text-red-600" /> Mark Not Showed
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUpdateStatus(appointment.id, 'Admitted', appointment.patientName, appointment.patientId)}>
                        <Hospital className="mr-2 h-4 w-4" /> Admit Patient
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5" /> {appointment.time}</p>
                  <p className="flex items-center"><Stethoscope className="w-3.5 h-3.5 mr-1.5" /> {appointment.type}</p>
                  <p className="flex items-center">Dr. {appointment.doctorName}</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="mt-2 self-start px-0 h-auto text-xs text-primary hover:underline">
                   <Link href={`/patients/${appointment.patientId}`}><Eye className="w-3.5 h-3.5 mr-1"/> View Patient</Link>
                </Button>
              </div>
            ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-6">
            <CalendarDays className="w-12 h-12 mb-3" />
            <p>No more patients scheduled for today.</p>
          </div>
        )}
      </CardContent>
       <div className="p-4 pt-2 border-t mt-auto">
          <Button asChild variant="outline" className="w-full">
            <Link href="/appointments">View Full Schedule</Link>
          </Button>
        </div>
    </Card>
  );
}
