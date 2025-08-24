
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppointmentForm, type AppointmentFormData } from '@/components/appointments/appointment-form';
import { PageHeader } from '@/components/shared/page-header';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { useToast } from "@/hooks/use-toast";
import type { Patient } from '@/lib/types';
import { format, parse } from 'date-fns';

export default function NewAppointmentPage() {
  const router = useRouter();
  const { addAppointment } = useAppointmentData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: AppointmentFormData, patient: Patient) => {
    setIsSubmitting(true);
    const patientFullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ');
    try {
      const newAppointment = await addAppointment(data, patient);
      toast({
        title: "Appointment Scheduled",
        description: `Appointment for ${patientFullName} with ${newAppointment.doctorName} on ${format(parse(newAppointment.date, "yyyy-MM-dd", new Date()), 'PPP')} at ${newAppointment.time} has been scheduled.`,
      });
      router.push('/appointments');
    } catch (error) {
      console.error("Failed to schedule appointment:", error);
      toast({
        title: "Scheduling Failed",
        description: "An error occurred while scheduling the appointment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Schedule New Appointment" description="Fill in the details below to schedule a new appointment." />
      <AppointmentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
