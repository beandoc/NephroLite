
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, FileSignature, Wand2, Pill, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateConsentForm } from '@/ai/flows/generate-consent-form-flow';

const consentFormSchema = z.object({
  patientName: z.string().min(1, "Patient name is required."),
  procedureName: z.string().min(1, "Procedure name is required."),
  doctorName: z.string().min(1, "Doctor name is required."),
});
type ConsentFormData = z.infer<typeof consentFormSchema>;

const medicinePrescriptionSchema = z.object({
  patientName: z.string().min(1, "Patient name is required."),
  medicationName: z.string().min(1, "Medication name is required."),
  dosage: z.string().min(1, "Dosage is required."),
  frequency: z.string().min(1, "Frequency is required."),
  doctorName: z.string().min(1, "Doctor name is required."),
});
type MedicinePrescriptionData = z.infer<typeof medicinePrescriptionSchema>;

const dischargeSummarySchema = z.object({
  patientName: z.string().min(1, "Patient name is required."),
  admissionDate: z.string().min(1, "Admission date is required."),
  dischargeDate: z.string().min(1, "Discharge date is required."),
  diagnosis: z.string().min(1, "Diagnosis is required."),
  summary: z.string().min(1, "Summary of treatment is required."),
  doctorName: z.string().min(1, "Doctor name is required."),
});
type DischargeSummaryData = z.infer<typeof dischargeSummarySchema>;


export default function TemplatesPage() {
  const [generatedConsent, setGeneratedConsent] = useState<string | null>(null);
  const [isLoadingConsent, setIsLoadingConsent] = useState(false);
  
  const [generatedPrescription, setGeneratedPrescription] = useState<string | null>(null);
  const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);

  const [generatedDischargeSummary, setGeneratedDischargeSummary] = useState<string | null>(null);
  const [isLoadingDischargeSummary, setIsLoadingDischargeSummary] = useState(false);

  const { toast } = useToast();

  const consentForm = useForm<ConsentFormData>({
    resolver: zodResolver(consentFormSchema),
    defaultValues: { patientName: "", procedureName: "", doctorName: "Dr. Sarah Johnson" },
  });

  const prescriptionForm = useForm<MedicinePrescriptionData>({
    resolver: zodResolver(medicinePrescriptionSchema),
    defaultValues: { patientName: "", medicationName: "", dosage: "", frequency: "", doctorName: "Dr. Sarah Johnson" },
  });

  const dischargeSummaryForm = useForm<DischargeSummaryData>({
    resolver: zodResolver(dischargeSummarySchema),
    defaultValues: { patientName: "", admissionDate: "", dischargeDate: "", diagnosis: "", summary: "", doctorName: "Dr. Sarah Johnson" },
  });


  const onConsentSubmit = async (data: ConsentFormData) => {
    setIsLoadingConsent(true);
    setGeneratedConsent(null);
    try {
      const result = await generateConsentForm(data);
      if (result && result.consentFormText) {
        setGeneratedConsent(result.consentFormText);
        toast({ title: "Consent Form Generated", description: "AI generated consent form." });
      } else {
        throw new Error("AI did not return consent form text.");
      }
    } catch (error) {
      console.error("Error generating consent form:", error);
      toast({ title: "Generation Failed", description: String(error), variant: "destructive" });
    } finally {
      setIsLoadingConsent(false);
    }
  };

  const onPrescriptionSubmit = async (data: MedicinePrescriptionData) => {
    setIsLoadingPrescription(true);
    // Placeholder for AI generation call
    // For now, just show a toast and mock output
    setTimeout(() => {
      setGeneratedPrescription(`Medicine Prescription:\nPatient: ${data.patientName}\nMedication: ${data.medicationName}\nDosage: ${data.dosage}\nFrequency: ${data.frequency}\nDoctor: ${data.doctorName}\n\n--- This is a mock generated prescription. AI integration pending. ---`);
      toast({ title: "Prescription Template Generated (Mock)", description: "Feature under development. Showing mock data." });
      setIsLoadingPrescription(false);
    }, 1000);
  };
  
  const onDischargeSummarySubmit = async (data: DischargeSummaryData) => {
    setIsLoadingDischargeSummary(true);
    // Placeholder for AI generation call
    setTimeout(() => {
      setGeneratedDischargeSummary(`Discharge Summary:\nPatient: ${data.patientName}\nAdmission: ${data.admissionDate}\nDischarge: ${data.dischargeDate}\nDiagnosis: ${data.diagnosis}\nSummary: ${data.summary}\nDoctor: ${data.doctorName}\n\n--- This is a mock generated summary. AI integration pending. ---`);
      toast({ title: "Discharge Summary Generated (Mock)", description: "Feature under development. Showing mock data." });
      setIsLoadingDischargeSummary(false);
    }, 1000);
  };


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Document Templates" description="Generate patient consent forms, prescriptions, and other templates using AI." />
      
      {/* Consent Form Generator */}
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-8 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><FileSignature className="mr-2 h-5 w-5 text-primary"/>Generate Patient Consent Form</CardTitle>
            <CardDescription>Enter details to generate a consent form.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...consentForm}>
              <form onSubmit={consentForm.handleSubmit(onConsentSubmit)} className="space-y-6">
                <FormField control={consentForm.control} name="patientName" render={({ field }) => ( <FormItem><FormLabel>Patient Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={consentForm.control} name="procedureName" render={({ field }) => ( <FormItem><FormLabel>Procedure Name</FormLabel><FormControl><Input placeholder="e.g., Kidney Biopsy" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={consentForm.control} name="doctorName" render={({ field }) => ( <FormItem><FormLabel>Doctor Full Name</FormLabel><FormControl><Input placeholder="e.g., Dr. Emily Carter" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <Button type="submit" disabled={isLoadingConsent} className="w-full"> {isLoadingConsent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Generate Consent </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader> <CardTitle className="font-headline">Generated Consent Form</CardTitle> <CardDescription>Review the AI-generated text.</CardDescription> </CardHeader>
          <CardContent>
            {isLoadingConsent && ( <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground">Generating...</p></div> )}
            {generatedConsent ? ( <Textarea value={generatedConsent} readOnly rows={15} className="bg-muted/20 text-sm" /> ) : ( !isLoadingConsent && <p className="text-muted-foreground text-center py-10">Generated consent form will appear here.</p> )}
            {generatedConsent && ( <Button onClick={() => navigator.clipboard.writeText(generatedConsent)} variant="outline" className="mt-4 w-full"> Copy to Clipboard </Button> )}
          </CardContent>
        </Card>

        {/* Medicine Prescription Template */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Pill className="mr-2 h-5 w-5 text-primary"/>Generate Medicine Prescription</CardTitle>
            <CardDescription>Enter details to generate a prescription template. (AI under development)</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...prescriptionForm}>
              <form onSubmit={prescriptionForm.handleSubmit(onPrescriptionSubmit)} className="space-y-6">
                <FormField control={prescriptionForm.control} name="patientName" render={({ field }) => ( <FormItem><FormLabel>Patient Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Smith" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={prescriptionForm.control} name="medicationName" render={({ field }) => ( <FormItem><FormLabel>Medication Name</FormLabel><FormControl><Input placeholder="e.g., Telmisartan 40mg" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={prescriptionForm.control} name="dosage" render={({ field }) => ( <FormItem><FormLabel>Dosage</FormLabel><FormControl><Input placeholder="e.g., 1 tablet" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={prescriptionForm.control} name="frequency" render={({ field }) => ( <FormItem><FormLabel>Frequency</FormLabel><FormControl><Input placeholder="e.g., Once daily" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={prescriptionForm.control} name="doctorName" render={({ field }) => ( <FormItem><FormLabel>Doctor Full Name</FormLabel><FormControl><Input placeholder="e.g., Dr. Sarah Johnson" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <Button type="submit" disabled={isLoadingPrescription} className="w-full"> {isLoadingPrescription ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Generate Prescription </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader> <CardTitle className="font-headline">Generated Prescription</CardTitle> <CardDescription>Review the generated text.</CardDescription> </CardHeader>
          <CardContent>
            {isLoadingPrescription && ( <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground">Generating...</p></div> )}
            {generatedPrescription ? ( <Textarea value={generatedPrescription} readOnly rows={15} className="bg-muted/20 text-sm" /> ) : ( !isLoadingPrescription && <p className="text-muted-foreground text-center py-10">Generated prescription will appear here.</p> )}
            {generatedPrescription && ( <Button onClick={() => navigator.clipboard.writeText(generatedPrescription)} variant="outline" className="mt-4 w-full"> Copy to Clipboard </Button> )}
          </CardContent>
        </Card>

        {/* Discharge Summary Template */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Generate Discharge Summary</CardTitle>
            <CardDescription>Enter details to generate a discharge summary. (AI under development)</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...dischargeSummaryForm}>
              <form onSubmit={dischargeSummaryForm.handleSubmit(onDischargeSummarySubmit)} className="space-y-6">
                <FormField control={dischargeSummaryForm.control} name="patientName" render={({ field }) => ( <FormItem><FormLabel>Patient Full Name</FormLabel><FormControl><Input placeholder="e.g., Robert Brown" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={dischargeSummaryForm.control} name="admissionDate" render={({ field }) => ( <FormItem><FormLabel>Admission Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={dischargeSummaryForm.control} name="dischargeDate" render={({ field }) => ( <FormItem><FormLabel>Discharge Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={dischargeSummaryForm.control} name="diagnosis" render={({ field }) => ( <FormItem><FormLabel>Primary Diagnosis at Discharge</FormLabel><FormControl><Input placeholder="e.g., Acute Kidney Injury, resolved" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={dischargeSummaryForm.control} name="summary" render={({ field }) => ( <FormItem><FormLabel>Brief Summary of Hospital Stay & Treatment</FormLabel><FormControl><Textarea rows={4} placeholder="Patient admitted with..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={dischargeSummaryForm.control} name="doctorName" render={({ field }) => ( <FormItem><FormLabel>Doctor Full Name</FormLabel><FormControl><Input placeholder="e.g., Dr. Sarah Johnson" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <Button type="submit" disabled={isLoadingDischargeSummary} className="w-full"> {isLoadingDischargeSummary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Generate Summary </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader> <CardTitle className="font-headline">Generated Discharge Summary</CardTitle> <CardDescription>Review the generated text.</CardDescription> </CardHeader>
          <CardContent>
            {isLoadingDischargeSummary && ( <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground">Generating...</p></div> )}
            {generatedDischargeSummary ? ( <Textarea value={generatedDischargeSummary} readOnly rows={15} className="bg-muted/20 text-sm" /> ) : ( !isLoadingDischargeSummary && <p className="text-muted-foreground text-center py-10">Generated summary will appear here.</p> )}
            {generatedDischargeSummary && ( <Button onClick={() => navigator.clipboard.writeText(generatedDischargeSummary)} variant="outline" className="mt-4 w-full"> Copy to Clipboard </Button> )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
