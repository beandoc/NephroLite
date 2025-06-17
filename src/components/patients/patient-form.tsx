
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Patient, Vaccination, ClinicalProfile } from "@/lib/types";
import { GENDERS, INDIAN_STATES, RELATIONSHIPS, PRIMARY_DIAGNOSIS_OPTIONS, NUTRITIONAL_STATUSES, DISABILITY_PROFILES, VACCINATION_NAMES, SUBSPECIALITY_FOLLOWUP_OPTIONS, YES_NO_NIL_OPTIONS, MALE_IMPLYING_RELATIONS, FEMALE_IMPLYING_RELATIONS } from "@/lib/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Briefcase, HeartPulse, Activity, Leaf, Accessibility, Syringe, PencilLine, TagsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { AiTagSuggester } from "./ai-tag-suggester";


const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode (must be 6 digits)"),
  country: z.string().optional(),
});

const guardianSchema = z.object({
  name: z.string().min(1, "Guardian name is required"),
  relation: z.string().min(1, "Relation is required"),
  contact: z.string().regex(/^\d{10}$/, "Invalid contact (must be 10 digits)"),
});

const vaccinationSchema = z.object({
  name: z.string(),
  administered: z.boolean(),
  date: z.string().optional().nullable(),
  nextDoseDate: z.string().optional().nullable(),
});

const clinicalProfileSchema = z.object({
  primaryDiagnosis: z.string().optional(),
  labels: z.array(z.string()).default([]), // Stored as array
  tags: z.array(z.string()).default([]),   // Stored as array
  nutritionalStatus: z.string().optional(),
  disability: z.string().optional(),
  subspecialityFollowUp: z.string().optional().default('NIL'),
  smokingStatus: z.string().optional().default('NIL'),
  alcoholConsumption: z.string().optional().default('NIL'),
  pomr: z.string().optional(),
  vaccinations: z.array(vaccinationSchema).optional().default(() => getDefaultVaccinations()),
});

const patientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  contact: z.string().regex(/^\d{10}$/, "Invalid contact (must be 10 digits)"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: addressSchema,
  guardian: guardianSchema,
  // Clinical profile is now fully optional at the top level for initial registration,
  // but its internal fields become relevant when editing.
  clinicalProfile: clinicalProfileSchema.optional(), 
  serviceName: z.string().optional(),
  serviceNumber: z.string().optional(),
  rank: z.string().optional(),
  unitName: z.string().optional(),
  formation: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => void;
  isSubmitting?: boolean;
}

const getDefaultVaccinations = (): Vaccination[] => {
  return VACCINATION_NAMES.map(name => ({ name, administered: false, date: "", nextDoseDate: "" }));
};

const getInitialClinicalProfile = (): ClinicalProfile => ({
  primaryDiagnosis: PRIMARY_DIAGNOSIS_OPTIONS.includes('Not Set') ? 'Not Set' : PRIMARY_DIAGNOSIS_OPTIONS[0] || "",
  labels: [],
  tags: [],
  nutritionalStatus: NUTRITIONAL_STATUSES.includes('Not Set') ? 'Not Set' : NUTRITIONAL_STATUSES[0] || "",
  disability: DISABILITY_PROFILES.includes('Not Set') ? 'Not Set' : DISABILITY_PROFILES[0] || "",
  subspecialityFollowUp: 'NIL',
  smokingStatus: 'NIL',
  alcoholConsumption: 'NIL',
  pomr: "",
  vaccinations: getDefaultVaccinations(),
});


export function PatientForm({ patient, onSubmit, isSubmitting }: PatientFormProps) {
  const [currentLabelsInput, setCurrentLabelsInput] = useState('');
  const [currentTagsInput, setCurrentTagsInput] = useState('');

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patient ? {
      ...patient,
      dob: patient.dob ? format(parseISO(patient.dob), "yyyy-MM-dd") : "",
      address: {
        ...patient.address,
        country: patient.address.country || "India",
      },
      clinicalProfile: {
        ...(getInitialClinicalProfile()), // Start with defaults
        ...(patient.clinicalProfile || {}), // Spread existing patient clinical profile
        // Ensure arrays are handled correctly for existing patients
        labels: Array.isArray(patient.clinicalProfile?.labels) ? patient.clinicalProfile.labels : [],
        tags: Array.isArray(patient.clinicalProfile?.tags) ? patient.clinicalProfile.tags : [],
        vaccinations: patient.clinicalProfile?.vaccinations && patient.clinicalProfile.vaccinations.length > 0
                      ? VACCINATION_NAMES.map(vaccineName => {
                          const existingVaccine = patient.clinicalProfile.vaccinations?.find(v => v.name === vaccineName);
                          return {
                            name: vaccineName,
                            administered: existingVaccine?.administered || false,
                            date: existingVaccine?.date || "",
                            nextDoseDate: existingVaccine?.nextDoseDate || "",
                          };
                        })
                      : getDefaultVaccinations(),
      },
      serviceName: patient.serviceName || "",
      serviceNumber: patient.serviceNumber || "",
      rank: patient.rank || "",
      unitName: patient.unitName || "",
      formation: patient.formation || "",
    } : {
      name: "",
      dob: "",
      gender: "",
      contact: "",
      email: "",
      address: { street: "", city: "", state: "", pincode: "", country: "India" },
      guardian: { name: "", relation: "", contact: "" },
      clinicalProfile: getInitialClinicalProfile(), // Initialize with defaults for new patient
      serviceName: "",
      serviceNumber: "",
      rank: "",
      unitName: "",
      formation: "",
    },
  });

  const { fields: vaccinationFields, replace: replaceVaccinations } = useFieldArray({
    control: form.control,
    name: "clinicalProfile.vaccinations" as any, // Use 'as any' if TS has trouble with optional clinicalProfile path
  });

  // Ensure vaccinationFields are populated correctly on mount/patient change
   useEffect(() => {
    const currentClinicalProfile = patient?.clinicalProfile || getInitialClinicalProfile();
    const currentVaccinations = currentClinicalProfile.vaccinations;

    if (currentVaccinations && currentVaccinations.length > 0) {
      const fullVaccinationList = VACCINATION_NAMES.map(vaccineName => {
        const existing = currentVaccinations.find(v => v.name === vaccineName);
        return {
          name: vaccineName,
          administered: existing?.administered || false,
          date: existing?.date || '',
          nextDoseDate: existing?.nextDoseDate || '',
        };
      });
      replaceVaccinations(fullVaccinationList);
    } else {
      replaceVaccinations(getDefaultVaccinations());
    }
  }, [patient, replaceVaccinations]);


  const guardianRelation = form.watch("guardian.relation");
  const currentGender = form.watch("gender");

  useEffect(() => {
    if (!currentGender && guardianRelation) { 
      if (MALE_IMPLYING_RELATIONS.includes(guardianRelation)) {
        form.setValue("gender", "Male", { shouldValidate: true });
      } else if (FEMALE_IMPLYING_RELATIONS.includes(guardianRelation)) {
        form.setValue("gender", "Female", { shouldValidate: true });
      }
    }
  }, [guardianRelation, currentGender, form]);

  // Handlers for Labels
  const handleAddLabel = () => {
    if (currentLabelsInput.trim() !== "") {
      const currentLabels = form.getValues("clinicalProfile.labels") || [];
      if (!currentLabels.includes(currentLabelsInput.trim())) {
        form.setValue("clinicalProfile.labels", [...currentLabels, currentLabelsInput.trim()], { shouldValidate: true });
      }
      setCurrentLabelsInput("");
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const currentLabels = form.getValues("clinicalProfile.labels") || [];
    form.setValue("clinicalProfile.labels", currentLabels.filter(label => label !== labelToRemove), { shouldValidate: true });
  };

  // Handlers for Tags
  const handleAddTagManually = () => {
     if (currentTagsInput.trim() !== "") {
      const currentTags = form.getValues("clinicalProfile.tags") || [];
      if (!currentTags.includes(currentTagsInput.trim())) {
        form.setValue("clinicalProfile.tags", [...currentTags, currentTagsInput.trim()], { shouldValidate: true });
      }
      setCurrentTagsInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("clinicalProfile.tags") || [];
    form.setValue("clinicalProfile.tags", currentTags.filter(tag => tag !== tagToRemove), { shouldValidate: true });
  };
  
  const handleAiSuggestedTags = (suggested: string[]) => {
    const currentTags = form.getValues("clinicalProfile.tags") || [];
    const newTags = suggested.filter(st => !currentTags.includes(st));
    if (newTags.length > 0) {
      form.setValue("clinicalProfile.tags", [...currentTags, ...newTags], { shouldValidate: true });
    }
  };
  
  const watchedLabels = form.watch("clinicalProfile.labels") || [];
  const watchedTags = form.watch("clinicalProfile.tags") || [];


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle className="font-headline">Personal Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Full Name</FormLabel>
                <FormControl><Input placeholder="Enter full name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
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
                            format(parseISO(field.value), "PPP")
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
                        selected={field.value ? parseISO(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                  <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contact" render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Contact Number</FormLabel>
                <FormControl><Input type="tel" placeholder="Enter 10-digit mobile" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Email Address (Optional)</FormLabel>
                <FormControl><Input type="email" placeholder="Enter email address" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="guardian.name" render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Name</FormLabel>
                <FormControl><Input placeholder="Enter guardian's name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="guardian.relation" render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Relation to Patient</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select relation" /></SelectTrigger></FormControl>
                  <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="guardian.contact" render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Contact Number</FormLabel>
                <FormControl><Input type="tel" placeholder="Enter 10-digit mobile" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-headline">Address Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="address.street" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Street Address</FormLabel>
                <FormControl><Input placeholder="Enter street address" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="address.city" render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl><Input placeholder="Enter city" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="address.state" render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                  <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="address.pincode" render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl><Input placeholder="Enter 6-digit pincode" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="address.country" render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-headline flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" />Service Details (Optional)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="serviceName" render={({ field }) => ( <FormItem> <FormLabel>Service Name</FormLabel> <FormControl><Input placeholder="e.g., Indian Army" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="serviceNumber" render={({ field }) => ( <FormItem> <FormLabel>Service Number</FormLabel> <FormControl><Input placeholder="Enter service number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="rank" render={({ field }) => ( <FormItem> <FormLabel>Rank</FormLabel> <FormControl><Input placeholder="e.g., Major" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="unitName" render={({ field }) => ( <FormItem> <FormLabel>Unit Name</FormLabel> <FormControl><Input placeholder="Enter unit name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="formation" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Formation</FormLabel> <FormControl><Input placeholder="Enter formation" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
          </CardContent>
        </Card>
        
        {/* Clinical Profile Section */}
        <Card>
          <CardHeader><CardTitle className="font-headline flex items-center"><HeartPulse className="mr-2 h-5 w-5 text-primary" />Clinical Profile</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="clinicalProfile.primaryDiagnosis" render={({ field }) => (
                <FormItem> <FormLabel>Primary Diagnosis</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select primary diagnosis" /></SelectTrigger></FormControl> <SelectContent>{PRIMARY_DIAGNOSIS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem>
              )} />
              <FormField control={form.control} name="clinicalProfile.subspecialityFollowUp" render={({ field }) => (
                <FormItem> <FormLabel>Subspeciality Follow-up</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select follow-up type" /></SelectTrigger></FormControl> <SelectContent>{SUBSPECIALITY_FOLLOWUP_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem>
              )} />
              <FormField control={form.control} name="clinicalProfile.smokingStatus" render={({ field }) => (
                <FormItem> <FormLabel>Smoking Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl> <SelectContent>{YES_NO_NIL_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem>
              )} />
              <FormField control={form.control} name="clinicalProfile.alcoholConsumption" render={({ field }) => (
                <FormItem> <FormLabel>Alcohol Consumption</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl> <SelectContent>{YES_NO_NIL_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem>
              )} />
              <FormField control={form.control} name="clinicalProfile.nutritionalStatus" render={({ field }) => (
                <FormItem> <FormLabel><Leaf className="inline h-4 w-4 mr-1"/>Nutritional Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select nutritional status" /></SelectTrigger></FormControl> <SelectContent>{NUTRITIONAL_STATUSES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem>
              )} />
              <FormField control={form.control} name="clinicalProfile.disability" render={({ field }) => (
                <FormItem> <FormLabel><Accessibility className="inline h-4 w-4 mr-1"/>Disability Profile</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select disability profile" /></SelectTrigger></FormControl> <SelectContent>{DISABILITY_PROFILES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="clinicalProfile.pomr" render={({ field }) => (
              <FormItem> <FormLabel><PencilLine className="inline h-4 w-4 mr-1"/>Problem Oriented Medical Record (POMR)</FormLabel> <FormControl><Textarea placeholder="Enter POMR details..." {...field} rows={4} /></FormControl> <FormMessage /> </FormItem>
            )} />

            <div>
              <FormLabel className="flex items-center"><TagsIcon className="inline h-4 w-4 mr-1"/>Clinical Labels</FormLabel>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={currentLabelsInput} 
                  onChange={(e) => setCurrentLabelsInput(e.target.value)} 
                  placeholder="Type a label and add" 
                  className="flex-grow"
                />
                <Button type="button" onClick={handleAddLabel} variant="outline">Add Label</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedLabels.map(label => (
                  <Badge key={label} variant="secondary" className="flex items-center gap-1">
                    {label}
                    <button type="button" onClick={() => handleRemoveLabel(label)} className="ml-1 text-xs text-muted-foreground hover:text-destructive">&times;</button>
                  </Badge>
                ))}
              </div>
              <FormMessage>{form.formState.errors.clinicalProfile?.labels?.message}</FormMessage>
            </div>
            
            <div>
              <FormLabel className="flex items-center"><TagsIcon className="inline h-4 w-4 mr-1"/>Clinical Tags</FormLabel>
               <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={currentTagsInput} 
                  onChange={(e) => setCurrentTagsInput(e.target.value)} 
                  placeholder="Type a tag and add" 
                  className="flex-grow"
                />
                <Button type="button" onClick={handleAddTagManually} variant="outline">Add Tag</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 mb-4">
                {watchedTags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-xs text-muted-foreground hover:text-destructive">&times;</button>
                  </Badge>
                ))}
              </div>
               <FormMessage>{form.formState.errors.clinicalProfile?.tags?.message}</FormMessage>
              <AiTagSuggester onTagsSuggested={handleAiSuggestedTags} currentTags={watchedTags} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-headline flex items-center"><Syringe className="mr-2 h-5 w-5 text-primary" />Vaccination Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {vaccinationFields.map((vaccField, index) => (
              <div key={vaccField.id} className="p-3 border rounded-md bg-muted/20">
                <FormField
                  control={form.control}
                  name={`clinicalProfile.vaccinations.${index}.administered` as any}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 mb-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) { // If unchecked, clear dates
                              form.setValue(`clinicalProfile.vaccinations.${index}.date` as any, "");
                              form.setValue(`clinicalProfile.vaccinations.${index}.nextDoseDate` as any, "");
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-medium text-sm">{vaccField.name}</FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch(`clinicalProfile.vaccinations.${index}.administered` as any) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
                    <FormField
                      control={form.control}
                      name={`clinicalProfile.vaccinations.${index}.date` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Date Administered</FormLabel>
                          <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`clinicalProfile.vaccinations.${index}.nextDoseDate` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Next Dose Date (Optional)</FormLabel>
                          <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>


        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? (patient ? "Updating Patient..." : "Registering Patient...") : (patient ? "Update Patient" : "Register Patient")}
        </Button>
      </form>
    </Form>
  );
}
