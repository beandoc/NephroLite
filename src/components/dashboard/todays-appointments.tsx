
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { format, isToday, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { CalendarDays } from 'lucide-react';

export function TodaysAppointments() {
  const { appointments, isLoading } = useAppointmentData();
  
  const today = new Date();
  const todaysAppointments = appointments
    .filter(app => {
        try {
            // Assuming app.date is "yyyy-MM-dd"
            const appDate = parseISO(app.date); // Handles "yyyy-MM-dd" correctly
            return isToday(appDate);
        } catch (e) {
            console.error("Error parsing appointment date:", app.date, e);
            return false;
        }
    })
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 4); // Show max 4 appointments

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Today's Appointments</CardTitle>
          <CardDescription><Skeleton className="h-4 w-24" /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
           <Skeleton className="h-10 w-full mt-2" />
        </CardContent>
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
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0 sm:p-6 pt-0">
        {todaysAppointments.length > 0 ? (
          <ScrollArea className="flex-grow pr-3"> {/* pr-3 to avoid scrollbar overlap on content */}
            <div className="space-y-3">
            {todaysAppointments.map((appointment, index) => (
              <div 
                key={appointment.id} 
                className={`flex items-center space-x-3 p-3 rounded-md border border-dashed border-l-4 ${
                  index % 4 === 0 ? 'border-l-primary' : 
                  index % 4 === 1 ? 'border-l-green-500' : 
                  index % 4 === 2 ? 'border-l-purple-500' : 
                  'border-l-yellow-500' // Example border colors
                } bg-card hover:bg-muted/50 transition-colors`}
              >
                <div className="flex-grow">
                  <p className="font-semibold text-sm">{appointment.patientName}</p>
                  <p className="text-xs text-muted-foreground">{appointment.type}</p>
                </div>
                <div className="text-sm font-medium text-foreground whitespace-nowrap">
                  {appointment.time}
                </div>
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
       <div className="p-4 pt-2 border-t">
          <Button asChild variant="outline" className="w-full">
            <Link href="/appointments">View Full Schedule</Link>
          </Button>
        </div>
    </Card>
  );
}
