
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import type { Appointment } from '@/lib/types';
import { format, parseISO, isSameDay, startOfDay } from 'date-fns';
import { CalendarRange, Clock, User, Stethoscope, Eye, Users, ListFilter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AppointmentFilter = "all" | "scheduled" | "completed" | "cancelled" | "waiting" | "admitted";

export default function MySchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { appointments, isLoading: appointmentsLoading } = useAppointmentData();
  const [filter, setFilter] = useState<AppointmentFilter>("all");

  const eventDays = useMemo(() => {
    if (appointmentsLoading) return [];
    return appointments.map(app => startOfDay(parseISO(app.date)));
  }, [appointments, appointmentsLoading]);

  const appointmentsForSelectedDay = useMemo(() => {
    if (!selectedDate || appointmentsLoading) return [];
    return appointments
      .filter(app => isSameDay(parseISO(app.date), selectedDate))
      .filter(app => {
        if (filter === "all") return true;
        return app.status.toLowerCase() === filter;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate, appointments, appointmentsLoading, filter]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };
  
  const getStatusBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case 'Scheduled': return 'default';
      case 'Completed': return 'secondary';
      case 'Cancelled': return 'destructive';
      case 'Waiting': return 'outline'; 
      case 'Not Showed': return 'destructive';
      case 'Admitted': return 'default'; 
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="My Schedule"
        description="View and manage your upcoming appointments and events."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="md:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <CalendarRange className="mr-2 h-5 w-5 text-primary" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {appointmentsLoading ? (
              <Skeleton className="h-[290px] w-[280px]" />
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                modifiers={{ events: eventDays }}
                modifiersClassNames={{
                  events: 'day-with-event',
                }}
                className="rounded-md border"
              />
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md h-full flex flex-col">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <CardTitle className="font-headline mb-2 sm:mb-0">
                Appointments for: {selectedDate ? format(selectedDate, 'PPP') : 'No date selected'}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <ListFilter className="mr-2 h-4 w-4" /> Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={filter} onValueChange={(value) => setFilter(value as AppointmentFilter)}>
                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="scheduled">Scheduled</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="waiting">Waiting</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="admitted">Admitted</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>Showing {appointmentsForSelectedDay.length} appointment(s).</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0 sm:p-4 pt-0">
            {appointmentsLoading ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : appointmentsForSelectedDay.length > 0 ? (
              <ScrollArea className="h-[400px] pr-3">
                <div className="space-y-4">
                  {appointmentsForSelectedDay.map(app => (
                    <div key={app.id} className="p-4 border rounded-lg shadow-sm bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-lg font-semibold text-primary">{app.time}</p>
                        <Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge>
                      </div>
                      <p className="text-md font-medium flex items-center"><User className="w-4 h-4 mr-2 text-muted-foreground"/>{app.patientName}</p>
                      <p className="text-sm text-muted-foreground flex items-center"><Stethoscope className="w-4 h-4 mr-2"/>{app.type}</p>
                      <p className="text-sm text-muted-foreground flex items-center"><Users className="w-4 h-4 mr-2"/>Dr. {app.doctorName}</p>
                      {app.notes && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">Notes: {app.notes}</p>}
                      <Button variant="link" size="sm" asChild className="mt-2 px-0 h-auto text-primary">
                         <Link href={`/patients/${app.patientId}`}><Eye className="w-4 h-4 mr-1"/>View Patient</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground">
                <CalendarRange className="w-16 h-16 mb-4" />
                <p className="text-lg">No appointments scheduled for this day {filter !== "all" ? `with status "${filter}"` : ""}.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
