
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
import { PRIMARY_DIAGNOSIS_OPTIONS, NUTRITIONAL_STATUSES, DISABILITY_PROFILES, BLOOD_GROUPS, DISABILITY_PROFILE_VALUES, SHAPE_CLASSIFICATIONS } from "@/lib/constants";
import { Save, Syringe, HeartPulse } from "lucide-react";
import { getDefaultVaccinations } from "@/lib/data-helpers";
import { useEffect } from "react";

interface ClinicalProfileFormProps {
  onSubmit: (data: ClinicalProfile) => void;
  isSubmitting?: boolean;
  existingProfileData: ClinicalProfile;
  patientRelation?: string;
}

export function ClinicalProfileForm({ onSubmit, isSubmitting, existingProfileData, patientRelation }: ClinicalProfileFormProps) {

  const form = useForm<ClinicalProfile>({
    resolver: zodResolver(clinicalProfileSchema),
    defaultValues: {
      ...existingProfileData,
      hasDiabetes: existingProfileData.hasDiabetes ?? false,
      onAntiHypertensiveMedication: existingProfileData.onAntiHypertensiveMedication ?? false,
      onLipidLoweringMedication: existingProfileData.onLipidLoweringMedication ?? false,
      vaccinations: (existingProfileData.vaccinations && existingProfileData.vaccinations.length > 0)
        ? existingProfileData.vaccinations
        : getDefaultVaccinations(),
    },
  });

  const { fields, update, replace } = useFieldArray({
    control: form.control,
    name: "vaccinations",
  });

  // This effect ensures that if a patient record has no vaccination data,
  // the form is populated with the default schedule upon opening the edit page.
  useEffect(() => {
    if (!existingProfileData.vaccinations || existingProfileData.vaccinations.length === 0) {
      replace(getDefaultVaccinations());
    }
  }, [existingProfileData.vaccinations, replace]);


  const handleAdministeredDateChange = (vaccineIndex: number, doseIndex: number, dateStr: string | null) => {
    const vaccine = fields[vaccineIndex];
    if (!vaccine || !vaccine.doses) return;

    const newDoses = [...vaccine.doses];
    newDoses[doseIndex] = { ...newDoses[doseIndex], date: dateStr, administered: !!dateStr };

    update(vaccineIndex, {
      ...vaccine,
      doses: newDoses,
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
              <FormField control={form.control} name="primaryDiagnosis" render={({ field }) => (<FormItem><FormLabel>Primary Diagnosis</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select diagnosis" /></SelectTrigger></FormControl><SelectContent>{PRIMARY_DIAGNOSIS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="nutritionalStatus" render={({ field }) => (<FormItem><FormLabel>Nutritional Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent>{NUTRITIONAL_STATUSES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="nutritionalStatus" render={({ field }) => (<FormItem><FormLabel>Nutritional Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent>{NUTRITIONAL_STATUSES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              {(patientRelation === 'Self') && (
                <FormField control={form.control} name="disability" render={({ field }) => (<FormItem><FormLabel>Disability Profile</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select profile" /></SelectTrigger></FormControl><SelectContent>{DISABILITY_PROFILES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              )}
              <FormField control={form.control} name="bloodGroup" render={({ field }) => (<FormItem><FormLabel>Blood Group</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger></FormControl><SelectContent>{BLOOD_GROUPS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="bloodGroup" render={({ field }) => (<FormItem><FormLabel>Blood Group</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger></FormControl><SelectContent>{BLOOD_GROUPS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="smokingStatus" render={({ field }) => (<FormItem><FormLabel>Smoking Status</FormLabel><FormControl><Input placeholder="e.g., No" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="alcoholConsumption" render={({ field }) => (<FormItem><FormLabel>Alcohol Consumption</FormLabel><FormControl><Input placeholder="e.g., No" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="drugAllergies" render={({ field }) => (<FormItem><FormLabel>Drug Allergies</FormLabel><FormControl><Textarea placeholder="List any known drug allergies" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><HeartPulse className="w-5 h-5 mr-2 text-primary" />Risk Factors</CardTitle>
            <CardDescription>Flags for cardiovascular risk calculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="hasDiabetes" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Patient has Diabetes</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="onAntiHypertensiveMedication" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Patient is on Anti-Hypertensive Medication</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="onLipidLoweringMedication" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Patient is on Lipid-Lowering (Statin) Medication</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Disability Tracking</CardTitle>
            <CardDescription>Record disability profile and past medical classification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="pastMedicalClassification" render={({ field }) => (
                <FormItem>
                  <FormLabel>Past Medical Classification</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SHAPE classification" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SHAPE_CLASSIFICATIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="disabilityProfile" render={({ field }) => (
                <FormItem>
                  <FormLabel>Disability Profile</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select disability profile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DISABILITY_PROFILE_VALUES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="primaryDisability" render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Disability</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., IgA Nephropathy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="disabilityLocationOfOnset" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location of Onset</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Manasbal (J&K)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="disabilityDateOfOnset" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Onset</FormLabel>
                  <FormControl>
                    <Input type="month" placeholder="YYYY-MM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="pdDispositionValue" render={({ field }) => (
              <FormItem>
                <FormLabel>PD Disposition Value</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Enter PD disposition details..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Syringe className="w-5 h-5 mr-2 text-primary" />Vaccination Status</CardTitle>
            <CardDescription>Manage vaccination records and upcoming doses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((vaccine, vaccineIndex) => (
              <Card key={vaccine.id} className="p-4 bg-muted/30">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">{vaccine.name} ({vaccine.totalDoses} doses)</h4>
                  <FormField
                    control={form.control}
                    name={`vaccinations.${vaccineIndex}.nextDoseDate`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormLabel className="text-sm whitespace-nowrap">Next Dose Due:</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="w-auto"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-3">
                  {(vaccine.doses || []).map((dose, doseIndex) => (
                    <div key={dose.id} className="grid grid-cols-[1fr_auto] items-end gap-4 p-2 border-t">
                      <p className="font-medium text-sm pt-4">Dose {dose.doseNumber}</p>
                      <FormField
                        control={form.control}
                        name={`vaccinations.${vaccineIndex}.doses.${doseIndex}.date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Administered Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                value={field.value || ""}
                                onChange={(e) => handleAdministeredDateChange(vaccineIndex, doseIndex, e.target.value || null)}
                                className="w-full md:w-40"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </Card>
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
