
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ClinicalProfile } from "@/lib/types";
import { clinicalProfileSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { PRIMARY_DIAGNOSIS_OPTIONS, NUTRITIONAL_STATUSES, DISABILITY_PROFILES, BLOOD_GROUPS } from "@/lib/constants";
import { Save, Syringe, HeartPulse } from "lucide-react";
import { format, parseISO, addMonths } from 'date-fns';

interface ClinicalProfileFormProps {
  onSubmit: (data: ClinicalProfile) => void;
  isSubmitting?: boolean;
  existingProfileData: ClinicalProfile;
}

export function ClinicalProfileForm({ onSubmit, isSubmitting, existingProfileData }: ClinicalProfileFormProps) {
  
  const form = useForm<ClinicalProfile>({
    resolver: zodResolver(clinicalProfileSchema),
    defaultValues: {
      ...existingProfileData,
      hasDiabetes: existingProfileData.hasDiabetes ?? false,
      onAntiHypertensiveMedication: existingProfileData.onAntiHypertensiveMedication ?? false,
      onLipidLoweringMedication: existingProfileData.onLipidLoweringMedication ?? false,
    },
  });

  const { fields, update } = useFieldArray({
    control: form.control,
    name: "vaccinations",
  });
  
  const handleVaccinationDateChange = (index: number, dateStr: string | null) => {
    const vaccine = fields[index];
    let nextDoseDateUpdate: string | null = vaccine.nextDoseDate; // Preserve manual entry by default
    
    if (dateStr) {
        const adminDate = parseISO(dateStr);
         // Only auto-calculate if next dose is not already set manually
        if (!vaccine.nextDoseDate) {
            if (vaccine.name === 'Hepatitis B') {
                nextDoseDateUpdate = format(addMonths(adminDate, 1), 'yyyy-MM-dd');
            } else if (vaccine.name === 'Pneumococcal') {
                nextDoseDateUpdate = format(addMonths(adminDate, 2), 'yyyy-MM-dd');
            }
        }
    }

    update(index, {
        ...vaccine,
        date: dateStr,
        administered: !!dateStr,
        nextDoseDate: nextDoseDateUpdate,
    });
  };


  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Clinical Profile</CardTitle>
                    <CardDescription>Update the patient's core clinical information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="primaryDiagnosis" render={({ field }) => ( <FormItem><FormLabel>Primary Diagnosis</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select diagnosis"/></SelectTrigger></FormControl><SelectContent>{PRIMARY_DIAGNOSIS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="nutritionalStatus" render={({ field }) => ( <FormItem><FormLabel>Nutritional Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status"/></SelectTrigger></FormControl><SelectContent>{NUTRITIONAL_STATUSES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="disability" render={({ field }) => ( <FormItem><FormLabel>Disability Profile</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select profile"/></SelectTrigger></FormControl><SelectContent>{DISABILITY_PROFILES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="bloodGroup" render={({ field }) => ( <FormItem><FormLabel>Blood Group</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select blood group"/></SelectTrigger></FormControl><SelectContent>{BLOOD_GROUPS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="smokingStatus" render={({ field }) => ( <FormItem><FormLabel>Smoking Status</FormLabel><FormControl><Input placeholder="e.g., No" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="alcoholConsumption" render={({ field }) => ( <FormItem><FormLabel>Alcohol Consumption</FormLabel><FormControl><Input placeholder="e.g., No" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    </div>
                     <FormField control={form.control} name="drugAllergies" render={({ field }) => ( <FormItem><FormLabel>Drug Allergies</FormLabel><FormControl><Textarea placeholder="List any known drug allergies" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center"><HeartPulse className="w-5 h-5 mr-2 text-primary"/>Risk Factors</CardTitle>
                    <CardDescription>Flags for cardiovascular risk calculation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={form.control} name="hasDiabetes" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Patient has Diabetes</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem> )}/>
                     <FormField control={form.control} name="onAntiHypertensiveMedication" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Patient is on Anti-Hypertensive Medication</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem> )}/>
                     <FormField control={form.control} name="onLipidLoweringMedication" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Patient is on Lipid-Lowering (Statin) Medication</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem> )}/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center"><Syringe className="w-5 h-5 mr-2 text-primary"/>Vaccination Status</CardTitle>
                    <CardDescription>Mark vaccines as administered and set the date. Next dose can be set manually.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                     {fields.map((vaccine, index) => (
                        <div key={vaccine.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-end gap-4 p-3 border rounded-md">
                           <FormField
                                control={form.control}
                                name={`vaccinations.${index}.administered`}
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-3 space-y-0 pt-8">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                    if (!checked) {
                                                       handleVaccinationDateChange(index, null);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-medium">{vaccine.name}</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`vaccinations.${index}.date`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Administered Date</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="date" 
                                                value={field.value || ""}
                                                onChange={(e) => handleVaccinationDateChange(index, e.target.value || null)}
                                                disabled={!form.watch(`vaccinations.${index}.administered`)}
                                                className="w-full md:w-40"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`vaccinations.${index}.nextDoseDate`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Next Dose Date</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="date" 
                                                value={field.value || ""}
                                                onChange={(e) => update(index, {...vaccine, nextDoseDate: e.target.value || null})}
                                                className="w-full md:w-40"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                     ))}
                </CardContent>
            </Card>

            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving Clinical Profile..." : "Save Clinical Profile"}
            </Button>
        </form>
    </Form>
  );
}
