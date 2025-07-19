
"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSignature, Save, Trash2, PlusCircle, FileText, Activity, Microscope } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { DIAGNOSIS_TEMPLATES } from '@/lib/constants';
import type { DiagnosisTemplate } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const medicationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Medication name is required."),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  instructions: z.string().optional(),
});

const templateFormSchema = z.object({
  templateName: z.string().min(1, "Template name is required."),
  templateType: z.enum(["Opinion Report", "Discharge Summary"]),
  diagnoses: z.array(z.object({ name: z.string().min(1), icdCode: z.string().optional() })).min(1),
  history: z.string().optional(),
  generalExamination: z.string().optional(),
  systemicExamination: z.string().optional(),
  medications: z.array(medicationSchema),
  // Fields available for both
  usgReport: z.string().optional(),
  kidneyBiopsyReport: z.string().optional(),
  // Discharge Summary specific fields
  dischargeInstructions: z.string().optional(),
  // Opinion Report specific fields
  opinionText: z.string().optional(),
  recommendations: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Record<string, DiagnosisTemplate>>(DIAGNOSIS_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      templateName: "",
      templateType: "Opinion Report",
      diagnoses: [{ name: "" }],
      history: "",
      generalExamination: "",
      systemicExamination: "",
      medications: [],
      dischargeInstructions: "",
      usgReport: "",
      kidneyBiopsyReport: "",
      opinionText: "",
      recommendations: "",
    },
  });

  const { fields: medicationFields, append: appendMedication, remove: removeMedication } = useFieldArray({
    control: form.control,
    name: "medications"
  });

  const templateType = form.watch("templateType");

  useEffect(() => {
    if (selectedTemplate) {
        const templateData = templates[selectedTemplate];
        if (templateData) {
            form.reset({
                ...templateData,
                medications: templateData.medications.map(m => ({ ...m, id: crypto.randomUUID() })),
            });
        }
    } else {
        const currentType = form.getValues("templateType");
        form.reset({
            templateName: "",
            templateType: currentType,
            diagnoses: [{ name: "" }],
            history: "",
            generalExamination: "",
            systemicExamination: "",
            medications: [],
            dischargeInstructions: "",
            usgReport: "",
            kidneyBiopsyReport: "",
            opinionText: "",
            recommendations: "",
        });
    }
  }, [selectedTemplate, templates, form]);


  const handleSelectTemplate = (templateName: string) => {
    if (templateName && templates[templateName]) {
      setSelectedTemplate(templateName);
    } else {
      setSelectedTemplate(null);
      form.reset({ templateType: "Opinion Report" });
    }
  };
  
  const onSaveTemplate = (data: TemplateFormData) => {
    setTemplates(prev => ({ ...prev, [data.templateName]: data }));
    toast({ title: "Template Saved (Mock)", description: `Template "${data.templateName}" has been saved locally.` });
    setSelectedTemplate(data.templateName);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    form.reset({
        templateName: "",
        templateType: "Opinion Report",
        diagnoses: [{ name: "" }],
        history: "",
        generalExamination: "",
        systemicExamination: "",
        medications: [],
        dischargeInstructions: "",
        usgReport: "",
        kidneyBiopsyReport: "",
        opinionText: "",
        recommendations: "",
    });
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Clinical Template Management" description="Create, edit, and manage clinical templates linked to diagnoses for various report types." />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline">Template Editor</CardTitle>
          <CardDescription>Select an existing template to edit, or fill out the form to create a new one. Templates are linked to a primary diagnosis name.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold">Load or Create</h3>
              <Select onValueChange={handleSelectTemplate} value={selectedTemplate || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Load an existing template..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(templates).map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <Button onClick={handleCreateNew} variant="outline" className="w-full">Create New Template</Button>
            </div>
            
            <div className="md:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSaveTemplate)} className="space-y-6 p-4 border rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="templateName" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-bold">Template / Diagnosis Name</FormLabel>
                            <FormControl><Input placeholder="e.g., IgA Nephropathy" {...field} /></FormControl>
                            <FormDescription>This name links the template to a diagnosis.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="templateType" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-bold">Template Type</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Opinion Report">Opinion Report</SelectItem>
                                    <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                  </div>
                  

                  <FormField control={form.control} name="history" render={({ field }) => (<FormItem><FormLabel>History / Summary Template</FormLabel><FormControl><Textarea rows={4} placeholder="Default history text..." {...field} /></FormControl><FormMessage /></FormItem>)} />

                  <div className="space-y-4">
                    <FormField control={form.control} name="generalExamination" render={({ field }) => (<FormItem><FormLabel>General Examination</FormLabel><FormControl><Textarea rows={2} placeholder="Default general examination findings..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="systemicExamination" render={({ field }) => (<FormItem><FormLabel>Systemic Examination</FormLabel><FormControl><Textarea rows={2} placeholder="Default systemic examination findings..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>

                  <Card>
                    <CardHeader><CardTitle className="text-md">Default Medications</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Dosage</TableHead><TableHead>Freq.</TableHead><TableHead>Instr.</TableHead><TableHead>Del</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {medicationFields.map((field, index) => (
                            <TableRow key={field.id}>
                              <TableCell><FormField control={form.control} name={`medications.${index}.name`} render={({ field }) => <Input placeholder="Name" {...field} />} /></TableCell>
                              <TableCell><FormField control={form.control} name={`medications.${index}.dosage`} render={({ field }) => <Input placeholder="Dosage" {...field} />} /></TableCell>
                              <TableCell><FormField control={form.control} name={`medications.${index}.frequency`} render={({ field }) => <Input placeholder="Freq." {...field} />} /></TableCell>
                              <TableCell><FormField control={form.control} name={`medications.${index}.instructions`} render={({ field }) => <Input placeholder="Instructions" {...field} />} /></TableCell>
                              <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeMedication(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendMedication({ name: "", dosage: "", frequency: "", instructions: "" })}>
                        <PlusCircle className="mr-2 h-4 w-4"/>Add Medication
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {templateType === 'Discharge Summary' && (
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Discharge Summary Fields</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="dischargeInstructions" render={({ field }) => (<FormItem><FormLabel>Discharge Instructions</FormLabel><FormControl><Textarea rows={4} placeholder="Default discharge instructions..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>
                  )}

                  {templateType === 'Opinion Report' && (
                     <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Opinion Report Fields</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="opinionText" render={({ field }) => (<FormItem><FormLabel>Opinion Text</FormLabel><FormControl><Textarea rows={4} placeholder="Default opinion text..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="recommendations" render={({ field }) => (<FormItem><FormLabel>Recommendations</FormLabel><FormControl><Textarea rows={4} placeholder="Default recommendations..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>
                  )}

                  <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center"><Microscope className="mr-2 h-5 w-5 text-primary"/>Investigation Report Fields</CardTitle>
                        <CardDescription>These fields are available for all template types.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField control={form.control} name="usgReport" render={({ field }) => (<FormItem><FormLabel>USG Report Template</FormLabel><FormControl><Textarea rows={4} placeholder="Default USG report text..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="kidneyBiopsyReport" render={({ field }) => (<FormItem><FormLabel>Kidney Biopsy Report Template</FormLabel><FormControl><Textarea rows={6} placeholder="Default kidney biopsy report text..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                  </Card>
                  
                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" /> Save Template
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
