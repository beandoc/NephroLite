
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient, Appointment } from "@/lib/types";
import { APPOINTMENT_TYPES, MOCK_DOCTORS, TIME_SLOTS } from "@/lib/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, addDays } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePatientData } from "@/hooks/use-patient-data";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";


const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Patient selection is required"),
  date: z.string().min(1, "Date is required"), // Storing as string YYYY-MM-DD
  time: z.string().min(1, "Time is required"),
  type: z.string().min(1, "Appointment type is required"),
  doctorName: z.string().min(1, "Doctor selection is required"),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  appointment?: Appointment; 
  onSubmit: (data: AppointmentFormData, patient: Patient) => void;
  isSubmitting?: boolean;
}

export function AppointmentForm({ appointment, onSubmit, isSubmitting }: AppointmentFormProps) {
  const { patients, isLoading: patientsLoading } = usePatientData();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: appointment ? {
      ...appointment,
      date: appointment.date ? format(new Date(appointment.date), "yyyy-MM-dd") : "",
    } : {
      patientId: "",
      date: format(addDays(new Date(), 14), "yyyy-MM-dd"), // Default to 2 weeks from today
      time: "",
      type: "",
      doctorName: "",
      notes: "",
    },
  });

  const handleSubmit = (data: AppointmentFormData) => {
    const selectedPatient = patients.find(p => p.id === data.patientId);
    if (selectedPatient) {
      onSubmit(data, selectedPatient);
    } else {
      form.setError("patientId", { type: "manual", message: "Selected patient not found." });
    }
  };

  if (patientsLoading) {
    return (
      <div className="space-y-6 mt-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Button disabled className="w-full md:w-auto">Loading Patient Data...</Button>
      </div>
    );
  }
  
  if (!patientsLoading && patients.length === 0) {
     return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">No Patients Available</CardTitle>
            </CardHeader>
            <CardContent>
                <p>There are no patients registered in the system. Please <Link href="/patients/new" className="text-primary hover:underline">add a patient</Link> before scheduling an appointment.</p>
            </CardContent>
        </Card>
     );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle className="font-headline">Appointment Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="patientId" render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.nephroId})</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(parse(field.value, "yyyy-MM-dd", new Date()), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } 
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="time" render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 opacity-50" />
                        <SelectValue placeholder="Select time" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIME_SLOTS.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                  <SelectContent>{APPOINTMENT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="doctorName" render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger></FormControl>
                  <SelectContent>{MOCK_DOCTORS.map(doc => <SelectItem key={doc} value={doc}>{doc}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl><Textarea placeholder="Enter any relevant notes for the appointment" {...field} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || patientsLoading || patients.length === 0}>
          {isSubmitting ? "Scheduling..." : (appointment ? "Update Appointment" : "Schedule Appointment")}
        </Button>
      </form>
    </Form>
  );
}
