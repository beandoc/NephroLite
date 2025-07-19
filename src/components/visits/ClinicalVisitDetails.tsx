
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Visit, Diagnosis } from "@/lib/types";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const diagnosisSchema = z.object({
  name: z.string().min(1, "Diagnosis name is required"),
  icdName: z.string().optional(),
  icdCode: z.string().optional(),
});

const clinicalVisitSchema = z.object({
  diagnoses: z.array(diagnosisSchema),
  history: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bmi: z.string().optional(),
  generalExamination: z.string().optional(),
  systemicExamination: z.string().optional(),
  courseInHospital: z.string().optional(),
  dischargeInstructions: z.string().optional(),
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
      history: visit.clinicalData?.history || "",
      height: visit.clinicalData?.height || "",
      weight: visit.clinicalData?.weight || "",
      bmi: visit.clinicalData?.bmi || "",
      generalExamination: visit.clinicalData?.generalExamination || "",
      systemicExamination: visit.clinicalData?.systemicExamination || "",
      courseInHospital: visit.clinicalData?.courseInHospital || "",
      dischargeInstructions: visit.clinicalData?.dischargeInstructions || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "diagnoses",
  });
  
  const height = form.watch("height");
  const weight = form.watch("weight");

  useEffect(() => {
    const h = parseFloat(height || "0");
    const w = parseFloat(weight || "0");
    if (h > 0 && w > 0) {
      const bmiValue = (w / ((h / 100) * (h / 100))).toFixed(2);
      form.setValue("bmi", bmiValue);
    } else {
      form.setValue("bmi", "");
    }
  }, [height, weight, form]);

  const onSubmit = (data: ClinicalVisitFormData) => {
    // In a real app, this would save to a database.
    console.log("Saving visit data for visit ID:", visit.id, data);
    toast({
      title: "Data Saved (Mock)",
      description: "Clinical visit data has been logged to the console.",
    });
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Clinical Diagnosis Section */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
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
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", icdCode: "", icdName: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Diagnosis
                </Button>
              </CardContent>
            </Card>
            
            {/* History */}
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

            {/* Examination Section */}
            <Card>
              <CardHeader><CardTitle>Examination</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="bmi" render={({ field }) => ( <FormItem><FormLabel>BMI (kg/m²)</FormLabel><FormControl><Input placeholder="Calculated" {...field} readOnly /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={form.control} name="generalExamination" render={({ field }) => ( <FormItem><FormLabel>General Examination Findings</FormLabel><FormControl><Textarea rows={3} placeholder="Pallor, icterus, clubbing, etc." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="systemicExamination" render={({ field }) => ( <FormItem><FormLabel>Systemic Examination Findings</FormLabel><FormControl><Textarea rows={3} placeholder="CVS, Respiratory, Abdomen, etc." {...field} /></FormControl><FormMessage /></FormItem> )} />
              </CardContent>
            </Card>

            {/* Course in Hospital */}
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
            
            {/* Medications Placeholder */}
            <Card>
                <CardHeader><CardTitle>Medications</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Medication entry section (Under Development)</p>
                </CardContent>
            </Card>
            
            {/* Discharge Instructions */}
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
