
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient, Vaccination } from "@/lib/types";
import { GENDERS, INDIAN_STATES, RELATIONSHIPS, VACCINATION_NAMES, MALE_IMPLYING_RELATIONS, FEMALE_IMPLYING_RELATIONS } from "@/lib/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";


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
});

const clinicalProfileSchema = z.object({
  primaryDiagnosis: z.string().optional(),
  labels: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  nutritionalStatus: z.string().optional(),
  disability: z.string().optional(),
  subspecialityFollowUp: z.string().optional().default('NIL'),
  smokingStatus: z.string().optional().default('NIL'),
  alcoholConsumption: z.string().optional().default('NIL'),
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
  clinicalProfile: clinicalProfileSchema,
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
  return VACCINATION_NAMES.map(name => ({ name, administered: false, date: "" }));
};


export function PatientForm({ patient, onSubmit, isSubmitting }: PatientFormProps) {
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
        primaryDiagnosis: patient.clinicalProfile.primaryDiagnosis || "",
        labels: patient.clinicalProfile.labels || [],
        tags: patient.clinicalProfile.tags || [],
        nutritionalStatus: patient.clinicalProfile.nutritionalStatus || "",
        disability: patient.clinicalProfile.disability || "",
        subspecialityFollowUp: patient.clinicalProfile.subspecialityFollowUp || 'NIL',
        smokingStatus: patient.clinicalProfile.smokingStatus || 'NIL',
        alcoholConsumption: patient.clinicalProfile.alcoholConsumption || 'NIL',
        vaccinations: patient.clinicalProfile.vaccinations && patient.clinicalProfile.vaccinations.length > 0
                      ? VACCINATION_NAMES.map(vaccineName => {
                          const existingVaccine = patient.clinicalProfile.vaccinations?.find(v => v.name === vaccineName);
                          return existingVaccine || { name: vaccineName, administered: false, date: '' };
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
      clinicalProfile: {
        primaryDiagnosis: "",
        labels: [],
        tags: [],
        nutritionalStatus: "",
        disability: "",
        subspecialityFollowUp: 'NIL',
        smokingStatus: 'NIL',
        alcoholConsumption: 'NIL',
        vaccinations: getDefaultVaccinations(),
      },
      serviceName: "",
      serviceNumber: "",
      rank: "",
      unitName: "",
      formation: "",
    },
  });

  const { replace: replaceVaccinations } = useFieldArray({
    control: form.control,
    name: "clinicalProfile.vaccinations",
  });

  useEffect(() => {
    if (patient && patient.clinicalProfile.vaccinations) {
      const currentVaccinations = patient.clinicalProfile.vaccinations;
      const fullVaccinationList = VACCINATION_NAMES.map(vaccineName => {
        const existing = currentVaccinations.find(v => v.name === vaccineName);
        return existing || { name: vaccineName, administered: false, date: '' };
      });
      replaceVaccinations(fullVaccinationList);
    } else if (!patient) {
      replaceVaccinations(getDefaultVaccinations());
    }
  }, [patient, replaceVaccinations]);

  const guardianRelation = form.watch("guardian.relation");
  const currentGender = form.watch("gender");

  useEffect(() => {
    if (!currentGender && guardianRelation) { // Only update if gender is not already set
      if (MALE_IMPLYING_RELATIONS.includes(guardianRelation)) {
        form.setValue("gender", "Male", { shouldValidate: true });
      } else if (FEMALE_IMPLYING_RELATIONS.includes(guardianRelation)) {
        form.setValue("gender", "Female", { shouldValidate: true });
      }
    }
  }, [guardianRelation, currentGender, form]);


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
            <FormField control={form.control} name="serviceName" render={({ field }) => (
              <FormItem>
                <FormLabel>Service Name</FormLabel>
                <FormControl><Input placeholder="e.g., Indian Army" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="serviceNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Service Number</FormLabel>
                <FormControl><Input placeholder="Enter service number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="rank" render={({ field }) => (
              <FormItem>
                <FormLabel>Rank</FormLabel>
                <FormControl><Input placeholder="e.g., Major" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="unitName" render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Name</FormLabel>
                <FormControl><Input placeholder="Enter unit name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="formation" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Formation</FormLabel>
                <FormControl><Input placeholder="Enter formation" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? (patient ? "Updating Patient..." : "Registering Patient...") : (patient ? "Update Patient" : "Register Patient")}
        </Button>
      </form>
    </Form>
  );
}

