

"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Visit, Diagnosis, Medication, ClinicalVisitData, DiagnosisTemplate } from "@/lib/types";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { DIAGNOSIS_TEMPLATES } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const diagnosisSchema = z.object({
  name: z.string().min(1, "Diagnosis name is required"),
  icdName: z.string().optional(),
  icdCode: z.string().optional(),
});

const medicationSchema = z.object({
  id: z.string(), // To track array fields
  name: z.string().min(1, "Medication name is required."),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  instructions: z.string().optional(),
});


const clinicalVisitSchema = z.object({
  diagnoses: z.array(diagnosisSchema),
  medications: z.array(medicationSchema),
  history: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bmi: z.string().optional(),
  idealBodyWeight: z.string().optional(),
  pulse: z.string().optional(),
  systolicBP: z.string().optional(),
  diastolicBP: z.string().optional(),
  respiratoryRate: z.string().optional(),
  generalExamination: z.string().optional(),
  systemicExamination: z.string().optional(),
  courseInHospital: z.string().optional(),
  dischargeInstructions: z.string().optional(),
  opinionText: z.string().optional(),
  recommendations: z.string().optional(),
});

type ClinicalVisitFormData = z.infer<typeof clinicalVisitSchema>;

interface ClinicalVisitDetailsProps {
  visit: Visit;
}

export function ClinicalVisitDetails({ visit }: ClinicalVisitDetailsProps) {
  const { toast } = useToast();

  const form = useForm<ClinicalVisitFormData>({
    resolver: zodResolver(clinicalVisitSchema),
    defaultValues: {
      diagnoses: visit.diagnoses?.length ? visit.diagnoses : [{ name: "", icdCode: "", icdName: "" }],
      medications: visit.clinicalData?.medications?.map(m => ({ ...m, id: m.id || crypto.randomUUID() })) || [],
      history: visit.clinicalData?.history || "",
      height: visit.clinicalData?.height || "",
      weight: visit.clinicalData?.weight || "",
      bmi: visit.clinicalData?.bmi || "",
      idealBodyWeight: visit.clinicalData?.idealBodyWeight || "",
      pulse: visit.clinicalData?.pulse || "",
      systolicBP: visit.clinicalData?.systolicBP || "",
      diastolicBP: visit.clinicalData?.diastolicBP || "",
      respiratoryRate: visit.clinicalData?.respiratoryRate || "",
      generalExamination: visit.clinicalData?.generalExamination || "",
      systemicExamination: visit.clinicalData?.systemicExamination || "",
      courseInHospital: visit.clinicalData?.courseInHospital || "",
      dischargeInstructions: visit.clinicalData?.dischargeInstructions || "",
      opinionText: visit.clinicalData?.opinionText || "",
      recommendations: visit.clinicalData?.recommendations || "",
    },
  });

  const { fields: diagnosisFields, append: appendDiagnosis, remove: removeDiagnosis, replace: replaceDiagnoses } = useFieldArray({
    control: form.control,
    name: "diagnoses",
  });

  const { fields: medicationFields, append: appendMedication, remove: removeMedication, replace: replaceMedications } = useFieldArray({
    control: form.control,
    name: "medications"
  });
  
  const height = form.watch("height");
  const weight = form.watch("weight");
  const gender = visit.patientGender || 'Male'; 

  useEffect(() => {
    const h = parseFloat(height || "0");
    const w = parseFloat(weight || "0");
    if (h > 0 && w > 0) {
      const bmiValue = (w / ((h / 100) * (h / 100))).toFixed(2);
      form.setValue("bmi", bmiValue);
    } else {
      form.setValue("bmi", "");
    }

    if (h > 0) {
      let idealWeight;
      if (gender === 'Male') {
        idealWeight = 50 + 0.91 * (h - 152.4);
      } else { 
        idealWeight = 45.5 + 0.91 * (h - 152.4);
      }
      form.setValue("idealBodyWeight", idealWeight > 0 ? idealWeight.toFixed(2) : "");
    } else {
        form.setValue("idealBodyWeight", "");
    }

  }, [height, weight, gender, form]);


  const onSubmit = (data: ClinicalVisitFormData) => {
    console.log("Saving visit data for visit ID:", visit.id, data);
    toast({
      title: "Data Saved (Mock)",
      description: "Clinical visit data has been logged to the console.",
    });
  };

  const handleTemplateSelect = (templateKey: string) => {
    const template = DIAGNOSIS_TEMPLATES[templateKey];
    if (!template) {
        toast({ title: "Template not found", variant: "destructive" });
        return;
    }

    // Reset form with all template values
    form.reset({
        ...template,
        medications: template.medications.map(med => ({ ...med, id: crypto.randomUUID() })),
    });

    toast({ title: "Template Loaded", description: `The form has been pre-filled with the "${templateKey}" template.`});
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <Card>
                <CardHeader>
                    <CardTitle>Visit Data Entry</CardTitle>
                    <CardDescription>If diagnosis is known, select a template to pre-fill the form. Otherwise, proceed with manual data entry.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <Select onValueChange={handleTemplateSelect}>
                            <SelectTrigger className="flex-grow">
                                <SelectValue placeholder="Load a clinical template..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(DIAGNOSIS_TEMPLATES).map(key => (
                                    <SelectItem key={key} value={key}>{key}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={() => form.reset()}>Clear Form</Button>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Clinical Diagnosis</CardTitle>
                <CardDescription>Add one or more diagnoses for this visit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {diagnosisFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end p-2 border rounded-md">
                    <FormField
                      control={form.control}
                      name={`diagnoses.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis Name</FormLabel>
                          <FormControl><Input placeholder="e.g., Hypertension" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`diagnoses.${index}.icdCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ICD-10</FormLabel>
                          <FormControl><Input placeholder="e.g., I10" {...field} className="w-24"/></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeDiagnosis(index)} disabled={diagnosisFields.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendDiagnosis({ name: "", icdCode: "", icdName: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Diagnosis
                </Button>
              </CardContent>
            </Card>
            
             <FormField
              control={form.control}
              name="history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>History</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="Enter patient history for this visit..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardHeader><CardTitle>Examination</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="idealBodyWeight" render={({ field }) => ( <FormItem><FormLabel>Ideal Wt (kg)</FormLabel><FormControl><Input placeholder="Calculated" {...field} readOnly /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="bmi" render={({ field }) => ( <FormItem><FormLabel>BMI (kg/m²)</FormLabel><FormControl><Input placeholder="Calculated" {...field} readOnly /></FormControl><FormMessage /></FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t mt-4">
                  <FormField control={form.control} name="pulse" render={({ field }) => ( <FormItem><FormLabel>Pulse (/min)</FormLabel><FormControl><Input type="number" placeholder="e.g., 72" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="systolicBP" render={({ field }) => ( <FormItem><FormLabel>Systolic BP (mmHg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 120" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="diastolicBP" render={({ field }) => ( <FormItem><FormLabel>Diastolic BP (mmHg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 80" {...field} /></FormControl><FormMessage /></FormItem> )} />
                   <FormField control={form.control} name="respiratoryRate" render={({ field }) => ( <FormItem><FormLabel>Resp. Rate (/min)</FormLabel><FormControl><Input type="number" placeholder="e.g., 16" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={form.control} name="generalExamination" render={({ field }) => ( <FormItem><FormLabel>General Examination Findings</FormLabel><FormControl><Textarea rows={3} placeholder="Pallor, icterus, clubbing, etc." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="systemicExamination" render={({ field }) => ( <FormItem><FormLabel>Systemic Examination Findings</FormLabel><FormControl><Textarea rows={3} placeholder="CVS, Respiratory, Abdomen, etc." {...field} /></FormControl><FormMessage /></FormItem> )} />
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="courseInHospital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course in Hospital (if applicable)</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="Describe the patient's course during admission..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Card>
                <CardHeader>
                    <CardTitle>Medications</CardTitle>
                    <CardDescription>Medications can be loaded from a template or added manually.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medicine Name</TableHead>
                                    <TableHead>Dosage</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Instructions</TableHead>
                                    <TableHead className="w-[50px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {medicationFields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <FormField control={form.control} name={`medications.${index}.name`} render={({ field }) => <Input placeholder="Medication" {...field} />} />
                                        </TableCell>
                                        <TableCell>
                                            <FormField control={form.control} name={`medications.${index}.dosage`} render={({ field }) => <Input placeholder="e.g., 40mg" {...field} />} />
                                        </TableCell>
                                        <TableCell>
                                            <FormField control={form.control} name={`medications.${index}.frequency`} render={({ field }) => <Input placeholder="e.g., OD" {...field} />} />
                                        </TableCell>
                                         <TableCell>
                                            <FormField control={form.control} name={`medications.${index}.instructions`} render={({ field }) => <Input placeholder="e.g., After food" {...field} />} />
                                        </TableCell>
                                        <TableCell>
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeMedication(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {medicationFields.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No medications added. Load a template or add manually.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendMedication({ id: crypto.randomUUID(), name: "", dosage: "", frequency: "", instructions: "" })}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Medication Manually
                    </Button>
                </CardContent>
            </Card>

            {visit.patientRelation === "Self" && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Opinion Report Section</CardTitle>
                        <CardDescription>This section is available as the patient's relation is marked as 'Self'.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="opinionText" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Medical Opinion</FormLabel>
                                <FormControl><Textarea rows={5} placeholder="Provide your detailed medical opinion..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="recommendations" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Recommendations</FormLabel>
                                <FormControl><Textarea rows={5} placeholder="Provide specific recommendations for the patient..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                 </Card>
            )}
            
            <FormField
              control={form.control}
              name="dischargeInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discharge Instructions</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="Advised to..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save Clinical Data (Mock)
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
