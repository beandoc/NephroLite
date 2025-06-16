
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { format, isToday, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { CalendarDays, User, Clock, Stethoscope, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TodaysAppointments() {
  const { appointments, isLoading } = useAppointmentData();
  
  const today = new Date();
  const todaysAppointments = appointments
    .filter(app => {
        try {
            const appDate = parseISO(app.date); 
            return isToday(appDate) && app.status === 'Scheduled'; // Only show scheduled for today
        } catch (e) {
            console.error("Error parsing appointment date:", app.date, e);
            return false;
        }
    })
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5); // Show max 5 appointments

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

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline">Today's Appointments</CardTitle>
          <div className="text-sm text-muted-foreground">{format(today, 'MMM d, yyyy')}</div>
        </div>
         <CardDescription>Upcoming scheduled appointments for today.</CardDescription>
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
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/patients/${appointment.patientId}`} className="font-semibold text-sm text-primary hover:underline flex items-center">
                    <User className="w-3.5 h-3.5 mr-1.5" /> {appointment.patientName}
                  </Link>
                  <Badge 
                    variant={
                      appointment.status === 'Scheduled' ? 'default' : 
                      appointment.status === 'Completed' ? 'secondary' : 
                      'destructive'
                    }
                    className="text-xs"
                  >
                    {appointment.status}
                  </Badge>
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
            <p>No appointments scheduled for today.</p>
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
