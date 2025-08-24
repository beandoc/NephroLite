
"use client";

import React from "react";
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
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENDERS, INDIAN_STATES, RELATIONSHIPS } from "@/lib/constants";
import type { Patient } from "@/lib/types";
import { patientFormDataSchema, type PatientFormData } from "@/lib/schemas";


const defaultFormValues: PatientFormData = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  contact: "",
  email: "",
  whatsappNumber: "",
  uhid: "",
  address: { street: "", city: "", state: "", pincode: "" },
  guardian: { name: "", relation: "", contact: "" },
};

const getInitialValues = (patient?: Patient | null): PatientFormData => {
  if (patient) {
    return {
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      dob: patient.dob ? format(parseISO(patient.dob), "yyyy-MM-dd") : "",
      gender: patient.gender || "Male",
      contact: patient.contact || "",
      email: patient.email || "",
      whatsappNumber: patient.clinicalProfile?.whatsappNumber || "",
      uhid: patient.clinicalProfile?.aabhaNumber || "",
      address: {
        street: patient.address?.street || "",
        city: patient.address?.city || "",
        state: patient.address?.state || "",
        pincode: patient.address?.pincode || "",
      },
      guardian: {
        name: patient.guardian?.name || "",
        relation: patient.guardian?.relation || "",
        contact: patient.guardian?.contact || "",
      },
    };
  }
  return defaultFormValues;
};


interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void;
  isSubmitting?: boolean;
  existingPatientData?: Patient | null;
}

export function PatientForm({ onSubmit, isSubmitting, existingPatientData }: PatientFormProps) {
  
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormDataSchema),
    defaultValues: getInitialValues(existingPatientData),
  });
  
  const today = new Date();
  const oneHundredYearsAgo = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());

  const relation = form.watch("guardian.relation");
  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const patientContact = form.watch("contact");
  
  React.useEffect(() => {
    if (relation === "Self") {
      const fullName = [firstName, lastName].filter(Boolean).join(' ');
      form.setValue("guardian.name", fullName);
      form.setValue("guardian.contact", patientContact);
    }
  }, [relation, firstName, lastName, patientContact, form]);


  const handleFormSubmit = (data: PatientFormData) => {
    onSubmit(data);
    if (!existingPatientData) {
        form.reset(defaultFormValues);
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Demographic Information</CardTitle>
            <CardDescription>Enter the patient's personal and contact details. Name, DOB, and Gender are required.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl><Input placeholder="Enter patient's first name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl><Input placeholder="Enter patient's last name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => {
                const [displayValue, setDisplayValue] = React.useState(
                  field.value ? format(parseISO(field.value), 'dd-MM-yyyy') : ''
                );

                React.useEffect(() => {
                  if (field.value) {
                    const date = parseISO(field.value);
                    if (isValid(date)) {
                      setDisplayValue(format(date, 'dd-MM-yyyy'));
                    }
                  } else {
                    setDisplayValue('');
                  }
                }, [field.value]);

                const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const typedValue = e.target.value;
                    setDisplayValue(typedValue);
                    
                    // Only attempt to parse and set the value if the length is 10 (dd-mm-yyyy)
                    if (typedValue.length === 10) {
                        const parsedDate = parse(typedValue, 'dd-MM-yyyy', new Date());
                        if (isValid(parsedDate)) {
                            field.onChange(format(parsedDate, 'yyyy-MM-dd'));
                        }
                    }
                };

                const handleCalendarSelect = (date: Date | undefined) => {
                    if (date) {
                        field.onChange(format(date, 'yyyy-MM-dd'));
                        setDisplayValue(format(date, 'dd-MM-yyyy'));
                    }
                };
                
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Input
                      placeholder="dd-mm-yyyy"
                      value={displayValue}
                      onChange={handleManualChange}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-fit">
                          <CalendarIcon className="h-4 w-4" /> Pick from Calendar
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? parseISO(field.value) : undefined}
                          onSelect={handleCalendarSelect}
                          disabled={(date) => date > today || date < oneHundredYearsAgo}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={oneHundredYearsAgo.getFullYear()}
                          toYear={today.getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                  <SelectContent>{GENDERS.map(gender => <SelectItem key={gender} value={gender}>{gender}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contact" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number (Optional)</FormLabel>
                <FormControl><Input type="tel" placeholder="Enter 10-digit mobile number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp Number (Optional)</FormLabel>
                <FormControl><Input type="tel" placeholder="Enter WhatsApp number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address (Optional)</FormLabel>
                <FormControl><Input type="email" placeholder="Enter email address" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="uhid" render={({ field }) => (
              <FormItem>
                <FormLabel>UHID / Aabha Number (Optional)</FormLabel>
                <FormControl><Input placeholder="Enter Unique Health ID" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Address Details (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <FormField control={form.control} name="address.state" render={({ field }) => (
                    <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                            <SelectContent>{INDIAN_STATES.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
                        </Select>
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
                 <FormField control={form.control} name="address.street" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Street Address</FormLabel>
                        <FormControl><Input placeholder="House No., Street, Area" {...field} /></FormControl>
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
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Guardian Details (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                 <FormField control={form.control} name="guardian.relation" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Relation to Patient</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select relation" /></SelectTrigger></FormControl>
                            <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="guardian.name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Guardian's Name</FormLabel>
                        <FormControl><Input placeholder="Enter guardian's full name" {...field} disabled={relation === 'Self'} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="guardian.contact" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Guardian's Contact Number</FormLabel>
                        <FormControl><Input type="tel" placeholder="Enter 10-digit mobile number" {...field} disabled={relation === 'Self'} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting 
              ? (existingPatientData ? "Saving Changes..." : "Registering Patient...")
              : (existingPatientData ? "Save Changes" : "Register Patient")
          }
        </Button>
      </form>
    </Form>
  );
}
