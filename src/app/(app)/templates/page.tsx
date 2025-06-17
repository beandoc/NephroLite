
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
import { Loader2, FileSignature, Wand2, Pill, FileText, MessageCircleQuestion, BookMarked, ListPlus, Copy, Mail, MessageSquare as MessageSquareIcon, DraftingCompass } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateConsentForm, type GenerateConsentFormInput } from '@/ai/flows/generate-consent-form-flow';
import { generateDischargeSummary, type GenerateDischargeSummaryInput } from '@/ai/flows/generate-discharge-summary-flow';
import { generateOpinionReport, type GenerateOpinionReportInput } from '@/ai/flows/generate-opinion-report-flow';
import { generateOpdConsultationNote, type GenerateOpdConsultationNoteInput } from '@/ai/flows/generate-opd-consultation-note-flow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_DIAGNOSES, MOCK_MEDICATIONS } from '@/lib/constants';
import type { DiagnosisEntry, MedicationEntry } from '@/lib/types';

const consentFormSchema = z.object({
  patientName: z.string().min(1, "Patient name is required."),
  procedureName: z.string().min(1, "Procedure name is required."),
  doctorName: z.string().min(1, "Doctor name is required."),
  patientServiceNumber: z.string().optional(),
  patientRank: z.string().optional(),
});
type ConsentFormData = z.infer<typeof consentFormSchema>;

const medicinePrescriptionSchema = z.object({
  patientName: z.string().min(1, "Patient name is required."),
  medicationName: z.string().min(1, "Medication name is required."),
  dosage: z.string().min(1, "Dosage is required."),
  frequency: z.string().min(1, "Frequency is required."),
  duration: z.string().optional().describe("e.g., 7 days, as needed"),
  instructions: z.string().optional().describe("e.g., Take with food"),
  doctorName: z.string().min(1, "Doctor name is required."),
});
type MedicinePrescriptionData = z.infer<typeof medicinePrescriptionSchema>;

const dischargeSummarySchema = z.object({
  patientName: z.string().min(1, "Patient name is required."),
  admissionDate: z.string().min(1, "Admission date is required."),
  dischargeDate: z.string().min(1, "Discharge date is required."),
  primaryDiagnosis: z.string().min(1, "Primary diagnosis is required."),
  treatmentSummary: z.string().min(1, "Summary of treatment is required."),
  conditionAtDischarge: z.string().min(1, "Patient's condition at discharge is required."),
  followUpInstructions: z.string().min(1, "Follow-up instructions are required."),
  doctorName: z.string().min(1, "Doctor name is required."),
  hospitalName: z.string().optional(),
  patientServiceNumber: z.string().optional(),
  patientRank: z.string().optional(),
});

const opinionReportSchema = z.object({
  patientName: z.string().min(1, "Patient name is required."),
  dateOfOpinion: z.string().min(1, "Date of opinion is required."),
  referringPhysician: z.string().optional(),
  reasonForOpinion: z.string().min(1, "Reason for opinion is required."),
  historyOfPresentIllness: z.string().min(1, "History of present illness is required."),
  examinationFindings: z.string().min(1, "Examination findings are required."),
  investigationResultsSummary: z.string().min(1, "Summary of investigation results is required."),
  medicalOpinion: z.string().min(1, "Medical opinion is required."),
  recommendations: z.string().min(1, "Recommendations are required."),
  providingDoctorName: z.string().min(1, "Doctor providing opinion is required."),
  patientServiceNumber: z.string().optional(),
  patientRank: z.string().optional(),
});

const opdConsultationNoteSchema = z.object({
  patientName: z.string().min(1, "Patient name is required."),
  visitDate: z.string().min(1, "Visit date is required."),
  doctorName: z.string().min(1, "Doctor name is required."),
  chiefComplaints: z.string().min(1, "Chief complaints are required."),
  examinationFindings: z.string().min(1, "Examination findings are required."),
  investigationsOrdered: z.string().optional(),
  medicationsPrescribed: z.string().min(1, "Medications prescribed are required."),
  assessmentAndPlan: z.string().min(1, "Assessment and plan are required."),
  followUpInstructions: z.string().optional(),
  patientServiceNumber: z.string().optional(),
  patientRank: z.string().optional(),
});
type OpdConsultationNoteData = z.infer<typeof opdConsultationNoteSchema>;


const diagnosisEntrySchema = z.object({
  name: z.string().min(1, "Diagnosis name is required."),
  icdName: z.string().min(1, "ICD name is required."),
  icdCode: z.string().min(1, "ICD-10 code is required. e.g., I10, E11.9"),
});
type DiagnosisEntryFormData = z.infer<typeof diagnosisEntrySchema>;

const medicationEntrySchema = z.object({
  name: z.string().min(1, "Medication name is required."),
  defaultDosage: z.string().optional(),
  defaultFrequency: z.string().optional(),
  commonInstructions: z.string().optional(),
});
type MedicationEntryFormData = z.infer<typeof medicationEntrySchema>;


export default function TemplatesPage() {
  const [generatedConsent, setGeneratedConsent] = useState<string | null>(null);
  const [isLoadingConsent, setIsLoadingConsent] = useState(false);

  const [generatedPrescription, setGeneratedPrescription] = useState<string | null>(null);
  const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);

  const [generatedDischargeSummary, setGeneratedDischargeSummaryText] = useState<string | null>(null);
  const [isLoadingDischargeSummary, setIsLoadingDischargeSummary] = useState(false);

  const [generatedOpinionReport, setGeneratedOpinionReportText] = useState<string | null>(null);
  const [isLoadingOpinionReport, setIsLoadingOpinionReport] = useState(false);
  
  const [generatedOpdNote, setGeneratedOpdNote] = useState<string | null>(null);
  const [isLoadingOpdNote, setIsLoadingOpdNote] = useState(false);


  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>(MOCK_DIAGNOSES);
  const [medications, setMedications] = useState<MedicationEntry[]>(MOCK_MEDICATIONS);

  const { toast } = useToast();

  const consentForm = useForm<GenerateConsentFormInput>({
    resolver: zodResolver(consentFormSchema),
    defaultValues: { patientName: "", procedureName: "", doctorName: "Dr. Sarah Johnson", patientServiceNumber: "", patientRank: "" },
  });

  const prescriptionForm = useForm<MedicinePrescriptionData>({
    resolver: zodResolver(medicinePrescriptionSchema),
    defaultValues: { patientName: "", medicationName: "", dosage: "", frequency: "", duration: "", instructions: "", doctorName: "Dr. Sarah Johnson" },
  });

  const dischargeSummaryFormHook = useForm<GenerateDischargeSummaryInput>({
    resolver: zodResolver(dischargeSummarySchema),
    defaultValues: { patientName: "", admissionDate: "", dischargeDate: "", primaryDiagnosis: "", treatmentSummary: "", conditionAtDischarge: "", followUpInstructions: "", doctorName: "Dr. Sarah Johnson", hospitalName: "NephroConnect Clinic", patientServiceNumber: "", patientRank: "" },
  });

  const opinionReportFormHook = useForm<GenerateOpinionReportInput>({
    resolver: zodResolver(opinionReportSchema),
    defaultValues: { patientName: "", dateOfOpinion: new Date().toISOString().split('T')[0], reasonForOpinion: "", historyOfPresentIllness: "", examinationFindings: "", investigationResultsSummary: "", medicalOpinion: "", recommendations: "", providingDoctorName: "Dr. Sarah Johnson", patientServiceNumber: "", patientRank: "" },
  });

  const opdConsultationNoteFormHook = useForm<GenerateOpdConsultationNoteInput>({
    resolver: zodResolver(opdConsultationNoteSchema),
    defaultValues: { patientName: "", visitDate: new Date().toISOString().split('T')[0], doctorName: "Dr. Sarah Johnson", chiefComplaints: "", examinationFindings: "", investigationsOrdered: "", medicationsPrescribed: "", assessmentAndPlan: "", followUpInstructions: "", patientServiceNumber: "", patientRank:"" },
  });


  const diagnosisForm = useForm<DiagnosisEntryFormData>({
    resolver: zodResolver(diagnosisEntrySchema),
    defaultValues: { name: "", icdName: "", icdCode: "" },
  });

  const medicationForm = useForm<MedicationEntryFormData>({
    resolver: zodResolver(medicationEntrySchema),
    defaultValues: { name: "", defaultDosage: "", defaultFrequency: "", commonInstructions: "" },
  });


  const onConsentSubmit = async (data: GenerateConsentFormInput) => {
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
    setGeneratedPrescription(null);
    setTimeout(() => {
      let prescriptionText = `MEDICINE PRESCRIPTION\n\n`;
      prescriptionText += `Date: ${new Date().toLocaleDateString()}\n`;
      prescriptionText += `Patient Name: ${data.patientName}\n`;
      prescriptionText += `Doctor: ${data.doctorName}\n\n`;
      prescriptionText += `Rx:\n`;
      prescriptionText += `  1. ${data.medicationName}\n`;
      prescriptionText += `     Dosage: ${data.dosage}\n`;
      prescriptionText += `     Frequency: ${data.frequency}\n`;
      if (data.duration) prescriptionText += `     Duration: ${data.duration}\n`;
      if (data.instructions) prescriptionText += `     Instructions: ${data.instructions}\n`;
      prescriptionText += `\n--- This is a mock generated prescription. AI integration for prescription generation is pending. ---`;
      setGeneratedPrescription(prescriptionText);
      toast({ title: "Prescription Template Generated (Mock)", description: "Feature under development. Showing mock data." });
      setIsLoadingPrescription(false);
    }, 1000);
  };

  const onDischargeSummarySubmit = async (data: GenerateDischargeSummaryInput) => {
    setIsLoadingDischargeSummary(true);
    setGeneratedDischargeSummaryText(null);
    try {
      const result = await generateDischargeSummary(data);
      if (result && result.dischargeSummaryText) {
        setGeneratedDischargeSummaryText(result.dischargeSummaryText);
        toast({ title: "Discharge Summary Generated", description: "AI generated discharge summary." });
      } else {
        throw new Error("AI did not return discharge summary text.");
      }
    } catch (error)
     {
      console.error("Error generating discharge summary:", error);
      toast({ title: "Generation Failed", description: String(error), variant: "destructive" });
    } finally {
      setIsLoadingDischargeSummary(false);
    }
  };

  const onOpinionReportSubmit = async (data: GenerateOpinionReportInput) => {
    setIsLoadingOpinionReport(true);
    setGeneratedOpinionReportText(null);
    try {
      const result = await generateOpinionReport(data);
      if (result && result.opinionReportText) {
        setGeneratedOpinionReportText(result.opinionReportText);
        toast({ title: "Opinion Report Generated", description: "AI generated opinion report." });
      } else {
        throw new Error("AI did not return opinion report text.");
      }
    } catch (error) {
      console.error("Error generating opinion report:", error);
      toast({ title: "Generation Failed", description: String(error), variant: "destructive" });
    } finally {
      setIsLoadingOpinionReport(false);
    }
  };
  
  const onOpdConsultationNoteSubmit = async (data: GenerateOpdConsultationNoteInput) => {
    setIsLoadingOpdNote(true);
    setGeneratedOpdNote(null);
    try {
      const result = await generateOpdConsultationNote(data);
      if (result && result.opdConsultationNoteText) {
        setGeneratedOpdNote(result.opdConsultationNoteText);
        toast({ title: "OPD Consultation Note Generated", description: "AI generated OPD note." });
      } else {
        throw new Error("AI did not return OPD consultation note text.");
      }
    } catch (error) {
      console.error("Error generating OPD consultation note:", error);
      toast({ title: "Generation Failed", description: String(error), variant: "destructive" });
    } finally {
      setIsLoadingOpdNote(false);
    }
  };


  const onDiagnosisSubmit = (data: DiagnosisEntryFormData) => {
    const newDiagnosis: DiagnosisEntry = { ...data, id: crypto.randomUUID() };
    setDiagnoses(prev => [...prev, newDiagnosis]);
    toast({ title: "Diagnosis Added (Mock)", description: `${data.name} added to the local list.` });
    diagnosisForm.reset();
  };

  const onMedicationSubmit = (data: MedicationEntryFormData) => {
    const newMedication: MedicationEntry = { ...data, id: crypto.randomUUID() };
    setMedications(prev => [...prev, newMedication]);
    toast({ title: "Medication Added (Mock)", description: `${data.name} added to the local list.` });
    medicationForm.reset();
  };


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Document Templates & Databases" description="Generate patient documents using AI and manage clinical databases." />

      <div className="grid md:grid-cols-2 gap-x-6 gap-y-8 mt-6">
        {/* Consent Form Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><FileSignature className="mr-2 h-5 w-5 text-primary"/>Generate Patient Consent Form</CardTitle>
            <CardDescription>Enter details to generate a consent form.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...consentForm}>
              <form onSubmit={consentForm.handleSubmit(onConsentSubmit)} className="space-y-4">
                <FormField control={consentForm.control} name="patientName" render={({ field }) => ( <FormItem><FormLabel>Patient Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={consentForm.control} name="procedureName" render={({ field }) => ( <FormItem><FormLabel>Procedure Name</FormLabel><FormControl><Input placeholder="e.g., Kidney Biopsy" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={consentForm.control} name="doctorName" render={({ field }) => ( <FormItem><FormLabel>Doctor Full Name</FormLabel><FormControl><Input placeholder="e.g., Dr. Emily Carter" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={consentForm.control} name="patientServiceNumber" render={({ field }) => ( <FormItem><FormLabel>Service No. (Optional)</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={consentForm.control} name="patientRank" render={({ field }) => ( <FormItem><FormLabel>Rank (Optional)</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
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
            {generatedConsent && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => navigator.clipboard.writeText(generatedConsent)} variant="outline" className="flex-grow sm:flex-grow-0">
                  <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Feature Under Development", description: "Sharing via Email is not yet implemented."})}
                  className="flex-grow sm:flex-grow-0"
                >
                  <Mail className="mr-2 h-4 w-4" /> Share via Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Feature Under Development", description: "Sharing via WhatsApp is not yet implemented."})}
                  className="flex-grow sm:flex-grow-0"
                >
                  <MessageSquareIcon className="mr-2 h-4 w-4" /> Share via WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medicine Prescription Template */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Pill className="mr-2 h-5 w-5 text-primary"/>Generate Medicine Prescription</CardTitle>
            <CardDescription>Enter details to generate a prescription template. (Mock Output)</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...prescriptionForm}>
              <form onSubmit={prescriptionForm.handleSubmit(onPrescriptionSubmit)} className="space-y-6">
                <FormField control={prescriptionForm.control} name="patientName" render={({ field }) => ( <FormItem><FormLabel>Patient Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Smith" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={prescriptionForm.control} name="medicationName" render={({ field }) => ( <FormItem><FormLabel>Medication Name</FormLabel><FormControl><Input placeholder="e.g., Telmisartan 40mg" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={prescriptionForm.control} name="dosage" render={({ field }) => ( <FormItem><FormLabel>Dosage</FormLabel><FormControl><Input placeholder="e.g., 1 tablet" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={prescriptionForm.control} name="frequency" render={({ field }) => ( <FormItem><FormLabel>Frequency</FormLabel><FormControl><Input placeholder="e.g., Once daily" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={prescriptionForm.control} name="duration" render={({ field }) => ( <FormItem><FormLabel>Duration (Optional)</FormLabel><FormControl><Input placeholder="e.g., 7 days, As needed" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={prescriptionForm.control} name="instructions" render={({ field }) => ( <FormItem><FormLabel>Additional Instructions (Optional)</FormLabel><FormControl><Textarea rows={2} placeholder="e.g., Take with food" {...field} /></FormControl><FormMessage /></FormItem> )} />
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
            {generatedPrescription && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => navigator.clipboard.writeText(generatedPrescription)} variant="outline" className="flex-grow sm:flex-grow-0">
                   <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
                </Button>
                 <Button
                  variant="outline"
                  onClick={() => toast({ title: "Feature Under Development", description: "Sharing via Email is not yet implemented."})}
                  className="flex-grow sm:flex-grow-0"
                >
                  <Mail className="mr-2 h-4 w-4" /> Share via Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Feature Under Development", description: "Sharing via WhatsApp is not yet implemented."})}
                  className="flex-grow sm:flex-grow-0"
                >
                  <MessageSquareIcon className="mr-2 h-4 w-4" /> Share via WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discharge Summary Template */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Generate Discharge Summary</CardTitle>
            <CardDescription>Enter details to generate a discharge summary.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...dischargeSummaryFormHook}>
              <form onSubmit={dischargeSummaryFormHook.handleSubmit(onDischargeSummarySubmit)} className="space-y-4">
                <FormField control={dischargeSummaryFormHook.control} name="patientName" render={({ field }) => ( <FormItem><FormLabel>Patient Full Name</FormLabel><FormControl><Input placeholder="e.g., Robert Brown" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={dischargeSummaryFormHook.control} name="admissionDate" render={({ field }) => ( <FormItem><FormLabel>Admission Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={dischargeSummaryFormHook.control} name="dischargeDate" render={({ field }) => ( <FormItem><FormLabel>Discharge Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={dischargeSummaryFormHook.control} name="primaryDiagnosis" render={({ field }) => ( <FormItem><FormLabel>Primary Diagnosis at Discharge</FormLabel><FormControl><Input placeholder="e.g., Acute Kidney Injury, resolved" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={dischargeSummaryFormHook.control} name="treatmentSummary" render={({ field }) => ( <FormItem><FormLabel>Brief Summary of Hospital Stay & Treatment</FormLabel><FormControl><Textarea rows={3} placeholder="Patient admitted with..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={dischargeSummaryFormHook.control} name="conditionAtDischarge" render={({ field }) => ( <FormItem><FormLabel>Condition at Discharge</FormLabel><FormControl><Input placeholder="e.g., Stable, Improved, Needs further outpatient care" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={dischargeSummaryFormHook.control} name="followUpInstructions" render={({ field }) => ( <FormItem><FormLabel>Follow-up Instructions (Medications, Appointments)</FormLabel><FormControl><Textarea rows={3} placeholder="e.g., Continue Metformin 500mg BID. Follow up in 2 weeks." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={dischargeSummaryFormHook.control} name="doctorName" render={({ field }) => ( <FormItem><FormLabel>Discharging Doctor Name</FormLabel><FormControl><Input placeholder="e.g., Dr. Sarah Johnson" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={dischargeSummaryFormHook.control} name="hospitalName" render={({ field }) => ( <FormItem><FormLabel>Hospital/Clinic Name (Optional)</FormLabel><FormControl><Input placeholder="e.g., City General Hospital" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={dischargeSummaryFormHook.control} name="patientServiceNumber" render={({ field }) => ( <FormItem><FormLabel>Service No. (Optional)</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={dischargeSummaryFormHook.control} name="patientRank" render={({ field }) => ( <FormItem><FormLabel>Rank (Optional)</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
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
            {generatedDischargeSummary && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => navigator.clipboard.writeText(generatedDischargeSummary)} variant="outline" className="flex-grow sm:flex-grow-0">
                  <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Feature Under Development", description: "Sharing via Email is not yet implemented."})}
                  className="flex-grow sm:flex-grow-0"
                >
                  <Mail className="mr-2 h-4 w-4" /> Share via Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Feature Under Development", description: "Sharing via WhatsApp is not yet implemented."})}
                  className="flex-grow sm:flex-grow-0"
                >
                  <MessageSquareIcon className="mr-2 h-4 w-4" /> Share via WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opinion Report Template */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><MessageCircleQuestion className="mr-2 h-5 w-5 text-primary"/>Generate Medical Opinion Report</CardTitle>
            <CardDescription>Enter details to generate a medical opinion report.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...opinionReportFormHook}>
              <form onSubmit={opinionReportFormHook.handleSubmit(onOpinionReportSubmit)} className="space-y-4">
                <FormField control={opinionReportFormHook.control} name="patientName" render={({ field }) => ( <FormItem><FormLabel>Patient Full Name</FormLabel><FormControl><Input placeholder="e.g., Alice Wonderland" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opinionReportFormHook.control} name="dateOfOpinion" render={({ field }) => ( <FormItem><FormLabel>Date of Opinion</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opinionReportFormHook.control} name="referringPhysician" render={({ field }) => ( <FormItem><FormLabel>Referring Physician (Optional)</FormLabel><FormControl><Input placeholder="e.g., Dr. John Smith" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opinionReportFormHook.control} name="reasonForOpinion" render={({ field }) => ( <FormItem><FormLabel>Reason for Opinion</FormLabel><FormControl><Textarea rows={2} placeholder="e.g., Second opinion for management of complex CKD" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opinionReportFormHook.control} name="historyOfPresentIllness" render={({ field }) => ( <FormItem><FormLabel>History of Present Illness</FormLabel><FormControl><Textarea rows={3} placeholder="Summarize relevant patient history..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opinionReportFormHook.control} name="examinationFindings" render={({ field }) => ( <FormItem><FormLabel>Relevant Examination Findings</FormLabel><FormControl><Textarea rows={3} placeholder="Key physical examination findings..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opinionReportFormHook.control} name="investigationResultsSummary" render={({ field }) => ( <FormItem><FormLabel>Summary of Investigation Results</FormLabel><FormControl><Textarea rows={3} placeholder="Summarize labs, imaging, etc." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opinionReportFormHook.control} name="medicalOpinion" render={({ field }) => ( <FormItem><FormLabel>Medical Opinion</FormLabel><FormControl><Textarea rows={3} placeholder="Your professional medical opinion..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opinionReportFormHook.control} name="recommendations" render={({ field }) => ( <FormItem><FormLabel>Recommendations</FormLabel><FormControl><Textarea rows={3} placeholder="Specific recommendations for the patient..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opinionReportFormHook.control} name="providingDoctorName" render={({ field }) => ( <FormItem><FormLabel>Doctor Providing Opinion</FormLabel><FormControl><Input placeholder="e.g., Dr. Expert Consultant" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={opinionReportFormHook.control} name="patientServiceNumber" render={({ field }) => ( <FormItem><FormLabel>Service No. (Optional)</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={opinionReportFormHook.control} name="patientRank" render={({ field }) => ( <FormItem><FormLabel>Rank (Optional)</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <Button type="submit" disabled={isLoadingOpinionReport} className="w-full"> {isLoadingOpinionReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Generate Opinion Report </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader> <CardTitle className="font-headline">Generated Opinion Report</CardTitle> <CardDescription>Review the generated text.</CardDescription> </CardHeader>
          <CardContent>
            {isLoadingOpinionReport && ( <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground">Generating...</p></div> )}
            {generatedOpinionReport ? ( <Textarea value={generatedOpinionReport} readOnly rows={15} className="bg-muted/20 text-sm" /> ) : ( !isLoadingOpinionReport && <p className="text-muted-foreground text-center py-10">Generated report will appear here.</p> )}
            {generatedOpinionReport && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => navigator.clipboard.writeText(generatedOpinionReport)} variant="outline" className="flex-grow sm:flex-grow-0">
                  <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
                </Button>
                 <Button
                  variant="outline"
                  onClick={() => toast({ title: "Feature Under Development", description: "Sharing via Email is not yet implemented."})}
                  className="flex-grow sm:flex-grow-0"
                >
                  <Mail className="mr-2 h-4 w-4" /> Share via Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Feature Under Development", description: "Sharing via WhatsApp is not yet implemented."})}
                  className="flex-grow sm:flex-grow-0"
                >
                  <MessageSquareIcon className="mr-2 h-4 w-4" /> Share via WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* OPD Consultation Note Template */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><DraftingCompass className="mr-2 h-5 w-5 text-primary"/>Generate OPD Consultation Note</CardTitle>
            <CardDescription>Enter details to generate an OPD consultation note.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...opdConsultationNoteFormHook}>
              <form onSubmit={opdConsultationNoteFormHook.handleSubmit(onOpdConsultationNoteSubmit)} className="space-y-4">
                <FormField control={opdConsultationNoteFormHook.control} name="patientName" render={({ field }) => ( <FormItem><FormLabel>Patient Full Name</FormLabel><FormControl><Input placeholder="e.g., Sita Devi" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={opdConsultationNoteFormHook.control} name="visitDate" render={({ field }) => ( <FormItem><FormLabel>Visit Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={opdConsultationNoteFormHook.control} name="doctorName" render={({ field }) => ( <FormItem><FormLabel>Doctor Name</FormLabel><FormControl><Input placeholder="e.g., Dr. Sarah Johnson" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={opdConsultationNoteFormHook.control} name="chiefComplaints" render={({ field }) => ( <FormItem><FormLabel>Chief Complaints</FormLabel><FormControl><Textarea rows={2} placeholder="Patient complains of..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opdConsultationNoteFormHook.control} name="examinationFindings" render={({ field }) => ( <FormItem><FormLabel>Key Examination Findings</FormLabel><FormControl><Textarea rows={3} placeholder="On examination..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opdConsultationNoteFormHook.control} name="investigationsOrdered" render={({ field }) => ( <FormItem><FormLabel>Investigations Ordered (Optional)</FormLabel><FormControl><Textarea rows={2} placeholder="e.g., CBC, KFT, Urine R/M" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opdConsultationNoteFormHook.control} name="medicationsPrescribed" render={({ field }) => ( <FormItem><FormLabel>Medications Prescribed / Advice</FormLabel><FormControl><Textarea rows={3} placeholder="e.g., Tab Telmisartan 40mg OD, Lifestyle modifications" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opdConsultationNoteFormHook.control} name="assessmentAndPlan" render={({ field }) => ( <FormItem><FormLabel>Assessment & Plan</FormLabel><FormControl><Textarea rows={3} placeholder="Assessment: CKD Stage X. Plan: Monitor BP, follow up in Y weeks." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={opdConsultationNoteFormHook.control} name="followUpInstructions" render={({ field }) => ( <FormItem><FormLabel>Follow-up Instructions (Optional)</FormLabel><FormControl><Textarea rows={2} placeholder="e.g., Review with reports in 1 month." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={opdConsultationNoteFormHook.control} name="patientServiceNumber" render={({ field }) => ( <FormItem><FormLabel>Service No. (Optional)</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={opdConsultationNoteFormHook.control} name="patientRank" render={({ field }) => ( <FormItem><FormLabel>Rank (Optional)</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <Button type="submit" disabled={isLoadingOpdNote} className="w-full"> {isLoadingOpdNote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Generate OPD Note </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader> <CardTitle className="font-headline">Generated OPD Consultation Note</CardTitle> <CardDescription>Review the generated text.</CardDescription> </CardHeader>
          <CardContent>
            {isLoadingOpdNote && ( <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground">Generating...</p></div> )}
            {generatedOpdNote ? ( <Textarea value={generatedOpdNote} readOnly rows={15} className="bg-muted/20 text-sm" /> ) : ( !isLoadingOpdNote && <p className="text-muted-foreground text-center py-10">Generated OPD note will appear here.</p> )}
            {generatedOpdNote && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => navigator.clipboard.writeText(generatedOpdNote)} variant="outline" className="flex-grow sm:flex-grow-0">
                  <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Feature Under Development", description: "Sharing via Email is not yet implemented."})}
                  className="flex-grow sm:flex-grow-0"
                >
                  <Mail className="mr-2 h-4 w-4" /> Share via Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Feature Under Development", description: "Sharing via WhatsApp is not yet implemented."})}
                  className="flex-grow sm:flex-grow-0"
                >
                  <MessageSquareIcon className="mr-2 h-4 w-4" /> Share via WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Diagnosis Database Management */}
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><BookMarked className="mr-2 h-5 w-5 text-primary"/>Diagnosis Database Management</CardTitle>
                <CardDescription>Add and view diagnosis codes. (Mock Implementation)</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <Form {...diagnosisForm}>
                        <form onSubmit={diagnosisForm.handleSubmit(onDiagnosisSubmit)} className="space-y-4">
                            <FormField control={diagnosisForm.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Diagnosis Name</FormLabel><FormControl><Input placeholder="e.g., Hypertension" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={diagnosisForm.control} name="icdName" render={({ field }) => ( <FormItem><FormLabel>Full ICD Name</FormLabel><FormControl><Input placeholder="e.g., Essential (primary) hypertension" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={diagnosisForm.control} name="icdCode" render={({ field }) => ( <FormItem><FormLabel>ICD-10 Code</FormLabel><FormControl><Input placeholder="e.g., I10" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <Button type="submit" className="w-full"><ListPlus className="mr-2 h-4 w-4"/>Add Diagnosis to List</Button>
                        </form>
                    </Form>
                </div>
                <div className="max-h-96 overflow-y-auto border rounded-md p-0">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>ICD Name</TableHead>
                                <TableHead>ICD Code</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {diagnoses.map(diag => (
                                <TableRow key={diag.id}>
                                    <TableCell>{diag.name}</TableCell>
                                    <TableCell>{diag.icdName}</TableCell>
                                    <TableCell>{diag.icdCode}</TableCell>
                                </TableRow>
                            ))}
                             {diagnoses.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No diagnoses in the list.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        {/* Medication Database Management */}
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><Pill className="mr-2 h-5 w-5 text-primary"/>Medication Database Management</CardTitle>
                <CardDescription>Add and view common medications. (Mock Implementation)</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                 <div>
                    <Form {...medicationForm}>
                        <form onSubmit={medicationForm.handleSubmit(onMedicationSubmit)} className="space-y-4">
                            <FormField control={medicationForm.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Medication Name</FormLabel><FormControl><Input placeholder="e.g., Amlodipine" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={medicationForm.control} name="defaultDosage" render={({ field }) => ( <FormItem><FormLabel>Default Dosage (Optional)</FormLabel><FormControl><Input placeholder="e.g., 5mg" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={medicationForm.control} name="defaultFrequency" render={({ field }) => ( <FormItem><FormLabel>Default Frequency (Optional)</FormLabel><FormControl><Input placeholder="e.g., Once Daily" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={medicationForm.control} name="commonInstructions" render={({ field }) => ( <FormItem><FormLabel>Common Instructions (Optional)</FormLabel><FormControl><Textarea rows={2} placeholder="e.g., Take with food" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <Button type="submit" className="w-full"><ListPlus className="mr-2 h-4 w-4"/>Add Medication to List</Button>
                        </form>
                    </Form>
                </div>
                <div className="max-h-96 overflow-y-auto border rounded-md p-0">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Dosage</TableHead>
                                <TableHead>Frequency</TableHead>
                                <TableHead>Instructions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {medications.map(med => (
                                <TableRow key={med.id}>
                                    <TableCell>{med.name}</TableCell>
                                    <TableCell>{med.defaultDosage || 'N/A'}</TableCell>
                                    <TableCell>{med.defaultFrequency || 'N/A'}</TableCell>
                                    <TableCell>{med.commonInstructions || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                            {medications.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No medications in the list.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
