
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient } from "@/lib/types";
import { GENDERS, INDIAN_STATES, RELATIONSHIPS, PRIMARY_DIAGNOSIS_OPTIONS, NUTRITIONAL_STATUSES, DISABILITY_PROFILES } from "@/lib/constants";
import { AiTagSuggester } from "./ai-tag-suggester";
import { Badge } from "@/components/ui/badge";
import { XIcon, Tag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode (must be 6 digits)"),
});

const guardianSchema = z.object({
  name: z.string().min(1, "Guardian name is required"),
  relation: z.string().min(1, "Relation is required"),
  contact: z.string().regex(/^\d{10}$/, "Invalid contact (must be 10 digits)"),
});

const clinicalProfileSchema = z.object({
  primaryDiagnosis: z.string().min(1, "Primary diagnosis is required"),
  labels: z.array(z.string()),
  tags: z.array(z.string()),
  nutritionalStatus: z.string().min(1, "Nutritional status is required"),
  disability: z.string().min(1, "Disability profile is required"),
});

const patientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dob: z.string().min(1, "Date of birth is required"), // Storing as string YYYY-MM-DD
  gender: z.string().min(1, "Gender is required"),
  contact: z.string().regex(/^\d{10}$/, "Invalid contact (must be 10 digits)"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: addressSchema,
  guardian: guardianSchema,
  clinicalProfile: clinicalProfileSchema,
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => void;
  isSubmitting?: boolean;
}

export function PatientForm({ patient, onSubmit, isSubmitting }: PatientFormProps) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patient ? {
      ...patient,
      dob: patient.dob ? format(new Date(patient.dob), "yyyy-MM-dd") : "",
    } : {
      name: "",
      dob: "",
      gender: "",
      contact: "",
      email: "",
      address: { street: "", city: "", state: "", pincode: "" },
      guardian: { name: "", relation: "", contact: "" },
      clinicalProfile: { primaryDiagnosis: "", labels: [], tags: [], nutritionalStatus: "", disability: "" },
    },
  });

  const [currentLabelInput, setCurrentLabelInput] = useState("");
  const [currentTagInput, setCurrentTagInput] = useState("");

  const handleAddLabel = () => {
    if (currentLabelInput.trim() && !form.getValues("clinicalProfile.labels").includes(currentLabelInput.trim())) {
      form.setValue("clinicalProfile.labels", [...form.getValues("clinicalProfile.labels"), currentLabelInput.trim()]);
      setCurrentLabelInput("");
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    form.setValue("clinicalProfile.labels", form.getValues("clinicalProfile.labels").filter(label => label !== labelToRemove));
  };
  
  const handleAddTag = (isAI: boolean = false) => {
    if (currentTagInput.trim() && !form.getValues("clinicalProfile.tags").includes(currentTagInput.trim())) {
      form.setValue("clinicalProfile.tags", [...form.getValues("clinicalProfile.tags"), currentTagInput.trim()]);
      if (!isAI) setCurrentTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue("clinicalProfile.tags", form.getValues("clinicalProfile.tags").filter(tag => tag !== tagToRemove));
  };

  const handleAiTagsSuggested = (suggestedTags: string[]) => {
    const currentTags = form.getValues("clinicalProfile.tags");
    const newTagsToAdd = suggestedTags.filter(st => !currentTags.includes(st));
    if (newTagsToAdd.length > 0) {
      form.setValue("clinicalProfile.tags", [...currentTags, ...newTagsToAdd]);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle className="font-headline">Demographic Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
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
                            format(new Date(field.value), "PPP")
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
                        selected={field.value ? new Date(field.value) : undefined}
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                  <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contact" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl><Input type="tel" placeholder="Enter 10-digit mobile" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Email Address (Optional)</FormLabel>
                <FormControl><Input type="email" placeholder="Enter email address" {...field} /></FormControl>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-headline">Guardian Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="guardian.name" render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Name</FormLabel>
                <FormControl><Input placeholder="Enter guardian's name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="guardian.relation" render={({ field }) => (
              <FormItem>
                <FormLabel>Relation</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select relation" /></SelectTrigger></FormControl>
                  <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="guardian.contact" render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Contact</FormLabel>
                <FormControl><Input type="tel" placeholder="Enter 10-digit mobile" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-headline">Clinical Profile</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="clinicalProfile.primaryDiagnosis" render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Diagnosis</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select primary diagnosis" /></SelectTrigger></FormControl>
                  <SelectContent>{PRIMARY_DIAGNOSIS_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormItem>
              <FormLabel>Labels</FormLabel>
              <div className="flex items-center gap-2">
                <Input placeholder="Add a label (e.g., Hypertension)" value={currentLabelInput} onChange={e => setCurrentLabelInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())} />
                <Button type="button" variant="outline" onClick={handleAddLabel}>Add Label</Button>
              </div>
              {form.watch("clinicalProfile.labels")?.length > 0 && <FormDescription>Current labels:</FormDescription>}
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("clinicalProfile.labels")?.map(label => (
                  <Badge key={label} variant="secondary">
                    {label} <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => handleRemoveLabel(label)}><XIcon className="h-3 w-3" /></Button>
                  </Badge>
                ))}
              </div>
            </FormItem>

            <FormItem>
              <FormLabel>Clinical Tags</FormLabel>
               <div className="flex items-center gap-2">
                <Input placeholder="Add a clinical tag (e.g., Stage 3 CKD)" value={currentTagInput} onChange={e => setCurrentTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} />
                <Button type="button" variant="outline" onClick={() => handleAddTag()}>Add Tag</Button>
              </div>
              {form.watch("clinicalProfile.tags")?.length > 0 && <FormDescription>Current tags:</FormDescription>}
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("clinicalProfile.tags")?.map(tag => (
                  <Badge key={tag}>
                    {tag} <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => handleRemoveTag(tag)}><XIcon className="h-3 w-3"/></Button>
                  </Badge>
                ))}
              </div>
            </FormItem>
            
            <AiTagSuggester onTagsSuggested={handleAiTagsSuggested} currentTags={form.watch("clinicalProfile.tags") || []} />
            
            <FormField control={form.control} name="clinicalProfile.nutritionalStatus" render={({ field }) => (
              <FormItem>
                <FormLabel>Nutritional Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select nutritional status" /></SelectTrigger></FormControl>
                  <SelectContent>{NUTRITIONAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="clinicalProfile.disability" render={({ field }) => (
              <FormItem>
                <FormLabel>Disability Profile</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select disability profile" /></SelectTrigger></FormControl>
                  <SelectContent>{DISABILITY_PROFILES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
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

