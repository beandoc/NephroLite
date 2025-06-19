
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from '@/components/shared/page-header';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from "@/hooks/use-toast";
import type { Patient } from '@/lib/types';
import { VISIT_TYPES, PATIENT_GROUP_NAMES } from '@/lib/constants';
import { ArrowLeft, CheckSquare, ListPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const createVisitFormSchema = z.object({
  visitType: z.string().min(1, "Visit type is required."),
  visitRemark: z.string().optional(),
  groupName: z.string().optional(),
});

type CreateVisitFormData = z.infer<typeof typeof createVisitFormSchema>;

export default function CreateVisitPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { getPatientById, isLoading: patientLoading } = usePatientData();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (patientId && !patientLoading) {
      const fetchedPatient = getPatientById(patientId);
      if (fetchedPatient) {
        setPatient(fetchedPatient);
      } else {
        toast({ title: "Patient Not Found", description: "Cannot create visit for non-existent patient.", variant: "destructive" });
        router.push('/patients');
      }
    }
  }, [patientId, getPatientById, patientLoading, router, toast]);

  const form = useForm<CreateVisitFormData>({
    resolver: zodResolver(createVisitFormSchema),
    defaultValues: {
      visitType: "",
      visitRemark: "",
      groupName: PATIENT_GROUP_NAMES.includes("Not Assigned") ? "Not Assigned" : PATIENT_GROUP_NAMES[0] || "",
    },
  });

  const handleSubmit = async (data: CreateVisitFormData) => {
    if (!patient) return;
    setIsSubmitting(true);
    console.log("Create Visit Data:", {
      patientId: patient.id,
      patientName: patient.name,
      visitDate: new Date().toISOString().split('T')[0], // Assuming visit is created for today
      ...data,
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Visit Created (Mock)",
      description: `Visit of type "${data.visitType}" for ${patient.name} has been logged. You can now proceed to their dashboard.`,
    });
    // In a real app, you would save this visit data
    // For now, redirect to patient's profile (which will become their dashboard)
    router.push(`/patients/${patient.id}`);
  };

  if (patientLoading || !patient) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Loading Patient for Visit Creation..." />
        <Card className="mt-6">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/3 mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title={`Create Visit for ${patient.name}`}
        description={`Nephro ID: ${patient.nephroId}. Select visit type and add remarks.`}
        actions={
          <Button variant="outline" onClick={() => router.push(`/patients/${patient.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Skip to Patient Profile
          </Button>
        }
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <ListPlus className="mr-2 h-5 w-5 text-primary" />
            Visit Details
          </CardTitle>
          <CardDescription>This is the first step after registration or selecting an existing patient.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="visitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VISIT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visitRemark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Remark (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any specific remarks for this visit (e.g., reason for unscheduled visit, specific focus)"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groupName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Patient Group (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PATIENT_GROUP_NAMES.map(group => (
                          <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Helps in categorizing patients for analytics and management.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Creating Visit..." : <><CheckSquare className="mr-2 h-4 w-4" /> Create Visit & Proceed</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
