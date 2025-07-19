
"use client";

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
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENDERS, INDIAN_STATES, RELATIONSHIPS } from "@/lib/constants";
import type { PatientFormData } from "@/lib/types";

const patientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  dob: z.string().min(1, "Date of birth is required."),
  gender: z.string().min(1, "Gender is required."),
  contact: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  whatsappNumber: z.string().optional(),
  uhid: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }),
  guardian: z.object({
    name: z.string().optional(),
    relation: z.string().optional(),
    contact: z.string().optional(),
  }),
});


interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void;
  isSubmitting?: boolean;
}

export function PatientForm({ onSubmit, isSubmitting }: PatientFormProps) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      dob: "",
      gender: "",
      contact: "",
      email: "",
      whatsappNumber: "",
      uhid: "",
      address: { street: "", city: "", state: "", pincode: "" },
      guardian: { name: "", relation: "", contact: "" },
    },
  });

  const today = new Date();
  const twelveYearsAgo = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
  const oneHundredYearsAgo = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Demographic Information</CardTitle>
            <CardDescription>Enter the patient's personal and contact details. Name, DOB, and Gender are required.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="Enter patient's full name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dob" render={({ field }) => {
              const { formItemId } = useFormField();
              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          id={formItemId}
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parseISO(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) => date > twelveYearsAgo || date < oneHundredYearsAgo}
                        initialFocus
                        captionLayout="dropdown-buttons" 
                        fromYear={oneHundredYearsAgo.getFullYear()} 
                        toYear={twelveYearsAgo.getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }} />
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
                 <FormField control={form.control} name="address.street" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Street Address</FormLabel>
                        <FormControl><Input placeholder="House No., Street, Area" {...field} /></FormControl>
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
                            <SelectContent>{INDIAN_STATES.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
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
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Guardian Details (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <FormField control={form.control} name="guardian.name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Guardian's Name</FormLabel>
                        <FormControl><Input placeholder="Enter guardian's full name" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
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
                <FormField control={form.control} name="guardian.contact" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Guardian's Contact Number</FormLabel>
                        <FormControl><Input type="tel" placeholder="Enter 10-digit mobile number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Registering Patient..." : "Register Patient"}
        </Button>
      </form>
    </Form>
  );
}
