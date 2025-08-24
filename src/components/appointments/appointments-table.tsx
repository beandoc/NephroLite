
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Appointment, Patient } from "@/lib/types";
import { Eye, CalendarX, CalendarCheck, Edit } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { usePatientData } from "@/hooks/use-patient-data";

interface AppointmentsTableProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  // onEditAppointment: (appointment: Appointment) => void; // For future edit functionality
}

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

export function AppointmentsTable({ appointments, onUpdateStatus }: AppointmentsTableProps) {
  const { toast } = useToast();
  const { getPatientById } = usePatientData();

  const handleStatusUpdate = (appointment: Appointment, status: 'Completed' | 'Cancelled') => {
    onUpdateStatus(appointment.id, status);
    const patient = getPatientById(appointment.patientId);
    const patientFullName = patient ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') : "the patient";
    toast({
      title: `Appointment ${status}`,
      description: `Appointment for ${patientFullName} on ${format(new Date(appointment.date), 'PPP')} at ${appointment.time} has been marked as ${status.toLowerCase()}.`,
    });
  };
  
  const sortedAppointments = [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time));


  if (sortedAppointments.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No appointments found. Schedule a new appointment to get started.</p>;
  }

  return (
    <div className="rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAppointments.map((appointment) => {
            const patient = getPatientById(appointment.patientId);
            const patientFullName = patient ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') : "Unknown Patient";
            return (
              <TableRow key={appointment.id} className={appointment.status === 'Cancelled' ? 'opacity-60' : ''}>
                <TableCell>{format(parseISO(appointment.date), 'PPP')}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>
                  <Link href={`/patients/${appointment.patientId}`} className="hover:underline text-primary">
                    {patientFullName}
                  </Link>
                </TableCell>
                <TableCell>{appointment.type}</TableCell>
                <TableCell>{appointment.doctorName}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusBadgeVariant(appointment.status)}
                  >
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild title="View Patient Profile">
                    <Link href={`/patients/${appointment.patientId}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                  {appointment.status === 'Scheduled' && (
                    <>
                      {/* <Button variant="ghost" size="icon" title="Edit Appointment" onClick={() => onEditAppointment(appointment)}>
                        <Edit className="h-4 w-4" />
                      </Button> */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Cancel Appointment" className="text-destructive hover:text-destructive/90">
                            <CalendarX className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel the appointment for {patientFullName} on {format(new Date(appointment.date), 'PPP')} at {appointment.time}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Scheduled</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleStatusUpdate(appointment, 'Cancelled')} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                              Confirm Cancellation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                       <Button variant="ghost" size="icon" title="Mark as Completed" className="text-green-600 hover:text-green-500" onClick={() => handleStatusUpdate(appointment, 'Completed')}>
                          <CalendarCheck className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}
