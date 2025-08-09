
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
import { Save, Trash2, PlusCircle, FileText, Activity, Microscope, ChevronsUpDown, Pencil } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { DIAGNOSIS_TEMPLATES, MOCK_DIAGNOSES } from '@/lib/constants';
import type { DiagnosisTemplate, Diagnosis, Medication, DiagnosisEntry } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const diagnosisSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Diagnosis name is required."),
  icdCode: z.string().optional(),
  icdName: z.string().optional(),
});

const medicationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Medication name is required."),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  instructions: z.string().optional(),
});

const templateFormSchema = z.object({
  templateName: z.string().min(1, "Template name is required."),
  templateType: z.enum(["Opinion Report", "Discharge Summary"]),
  diagnoses: z.array(diagnosisSchema).min(1, "At least one diagnosis is required."),
  history: z.string().optional(),
  generalExamination: z.string().optional(),
  systemicExamination: z.string().optional(),
  medications: z.array(medicationSchema),
  usgReport: z.string().optional(),
  kidneyBiopsyReport: z.string().optional(),
  dischargeInstructions: z.string().optional(),
  opinionText: z.string().optional(),
  recommendations: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

// Schema for adding/editing a master diagnosis
const masterDiagnosisSchema = z.object({
    icdCode: z.string().min(1, "ICD-10 code is required."),
    name: z.string().min(1, "Primary clinical name is required."),
    icdName: z.string().min(1, "Full ICD-10 description is required."),
});
type MasterDiagnosisFormData = z.infer<typeof masterDiagnosisSchema>;


// Component for Adding a new Master Diagnosis
function AddMasterDiagnosisDialog({
  isOpen,
  onOpenChange,
  onSave,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newDiagnosis: MasterDiagnosisFormData) => void;
}) {
  const form = useForm<MasterDiagnosisFormData>({
    resolver: zodResolver(masterDiagnosisSchema),
    defaultValues: {
      icdCode: "",
      name: "",
      icdName: "",
    },
  });

  const handleSave = (data: MasterDiagnosisFormData) => {
    onSave(data);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New Master Diagnosis</DialogTitle>
          <DialogDescription>
            Add a new ICD-10 code and its description to the central database.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 py-4">
                <FormField control={form.control} name="icdCode" render={({ field }) => (
                    <FormItem>
                        <FormLabel>ICD-10 Code</FormLabel>
                        <FormControl><Input placeholder="e.g., N18.9" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Primary Clinical Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Chronic Kidney Disease, Unspecified" {...field} /></FormControl>
                        <FormDescription>This is the user-friendly name that will appear in lists.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="icdName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full ICD-10 Description</FormLabel>
                        <FormControl><Textarea placeholder="The official description from the ICD-10 manual." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Add Diagnosis</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


// Component for the Master Diagnosis Edit Dialog
function EditMasterDiagnosisDialog({
  diagnosis,
  isOpen,
  onOpenChange,
  onSave,
}: {
  diagnosis: DiagnosisEntry | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedDiagnosis: DiagnosisEntry) => void;
}) {
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisEntry | null>(diagnosis);
  const [newClinicalName, setNewClinicalName] = useState('');

  useEffect(() => {
    setCurrentDiagnosis(diagnosis);
  }, [diagnosis]);

  if (!currentDiagnosis) return null;

  const handleAddClinicalName = () => {
    if (newClinicalName && !currentDiagnosis.clinicalNames.includes(newClinicalName)) {
      setCurrentDiagnosis({
        ...currentDiagnosis,
        clinicalNames: [...currentDiagnosis.clinicalNames, newClinicalName],
      });
      setNewClinicalName('');
    }
  };

  const handleRemoveClinicalName = (nameToRemove: string) => {
    setCurrentDiagnosis({
      ...currentDiagnosis,
      clinicalNames: currentDiagnosis.clinicalNames.filter(name => name !== nameToRemove),
    });
  };

  const handleSave = () => {
    if(currentDiagnosis) {
      onSave(currentDiagnosis);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit ICD-10 Mapping: {currentDiagnosis.icdCode}</DialogTitle>
          <DialogDescription>
            Map multiple clinical diagnosis names to a single ICD-10 code.
            The first clinical name is used as the primary display name.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-1">
                <Label>Official ICD-10 Description</Label>
                <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md">{currentDiagnosis.icdName}</p>
            </div>
            <div className="space-y-2">
                <Label>Mapped Clinical Names</Label>
                <div className="space-y-2">
                {currentDiagnosis.clinicalNames.map((name) => (
                    <div key={name} className="flex items-center gap-2">
                    <Input value={name} readOnly className="flex-grow" />
                    <Button variant="destructive" size="icon" onClick={() => handleRemoveClinicalName(name)} disabled={currentDiagnosis.clinicalNames.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </div>
                ))}
                {currentDiagnosis.clinicalNames.length === 0 && <p className="text-sm text-muted-foreground">No clinical names mapped yet.</p>}
                </div>
            </div>
             <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="new-clinical-name">Add New Clinical Name</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="new-clinical-name"
                        value={newClinicalName}
                        onChange={(e) => setNewClinicalName(e.target.value)}
                        placeholder="Enter a new clinical name"
                    />
                    <Button onClick={handleAddClinicalName}>Add</Button>
                </div>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Record<string, DiagnosisTemplate>>(DIAGNOSIS_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { toast } = useToast();

  // State for master diagnosis list and dialogs
  const [masterDiagnoses, setMasterDiagnoses] = useState<DiagnosisEntry[]>(MOCK_DIAGNOSES);
  const [isEditMasterDiagOpen, setIsEditMasterDiagOpen] = useState(false);
  const [isAddMasterDiagOpen, setIsAddMasterDiagOpen] = useState(false);
  const [selectedMasterDiag, setSelectedMasterDiag] = useState<DiagnosisEntry | null>(null);


  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      templateName: "",
      templateType: "Opinion Report",
      diagnoses: [],
      history: "",
      generalExamination: "",
      systemicExamination: "",
      medications: [],
      usgReport: "",
      kidneyBiopsyReport: "",
      dischargeInstructions: "",
      opinionText: "",
      recommendations: "",
    },
  });

  const { fields: medicationFields, append: appendMedication, remove: removeMedication } = useFieldArray({
    control: form.control,
    name: "medications"
  });

  const { fields: diagnosisFields, append: appendDiagnosis, remove: removeDiagnosis } = useFieldArray({
      control: form.control,
      name: "diagnoses"
  });

  const templateType = form.watch("templateType");

  useEffect(() => {
    if (selectedTemplate) {
        const templateData = templates[selectedTemplate];
        if (templateData) {
            form.reset({
                ...templateData,
                medications: templateData.medications.map(m => ({ ...m, id: m.id || crypto.randomUUID() })),
            });
        }
    } else {
        handleCreateNew();
    }
  }, [selectedTemplate, templates, form]);


  const handleSelectTemplate = (templateName: string) => {
    if (templateName && templates[templateName]) {
      setSelectedTemplate(templateName);
    } else {
      setSelectedTemplate(null);
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
        diagnoses: [],
        history: "",
        generalExamination: "",
        systemicExamination: "",
        medications: [],
        usgReport: "",
        kidneyBiopsyReport: "",
        dischargeInstructions: "",
        opinionText: "",
        recommendations: "",
    });
  }
  
  const handleAddDiagnosis = (diagnosisId: string) => {
    const diagnosisToAdd = masterDiagnoses.find(d => d.id === diagnosisId);
    if (diagnosisToAdd) {
        // Here we map all clinical names under that one master diagnosis entry
        const diagnosesToAppend: Diagnosis[] = diagnosisToAdd.clinicalNames.map(name => ({
            id: `${diagnosisToAdd.id}-${name.replace(/\s/g, "")}`, // Create a more unique ID
            name: name,
            icdCode: diagnosisToAdd.icdCode,
            icdName: diagnosisToAdd.icdName,
        }));

        diagnosesToAppend.forEach(diag => {
            const isAlreadyAdded = diagnosisFields.some(field => field.name === diag.name && field.icdCode === diag.icdCode);
            if (!isAlreadyAdded) {
                appendDiagnosis(diag);
            }
        });

        toast({ title: "Diagnoses Added", description: `Added options for "${diagnosisToAdd.name}" to the template.` });
        setIsPopoverOpen(false); // Close popover after selection
    }
  };

  const handleEditMasterDiagnosis = (diagnosis: DiagnosisEntry) => {
    setSelectedMasterDiag(diagnosis);
    setIsEditMasterDiagOpen(true);
  };

  const handleSaveMasterDiagnosis = (updatedDiagnosis: DiagnosisEntry) => {
    setMasterDiagnoses(prev =>
      prev.map(d => (d.id === updatedDiagnosis.id ? updatedDiagnosis : d))
    );
    toast({
      title: 'Master Diagnosis Updated',
      description: `${updatedDiagnosis.icdCode} has been updated. (This is a mock save)`,
    });
  };

  const handleAddNewMasterDiagnosis = (data: MasterDiagnosisFormData) => {
    const newDiagnosis: DiagnosisEntry = {
        id: data.icdCode, // Use ICD code as a unique ID for new entries
        icdCode: data.icdCode,
        name: data.name,
        icdName: data.icdName,
        clinicalNames: [data.name], // Start with the primary name
    };
    // Check if it already exists
    if(masterDiagnoses.some(d => d.id === newDiagnosis.id)) {
        toast({ title: "Error", description: `Diagnosis with ICD-10 code ${newDiagnosis.icdCode} already exists.`, variant: "destructive" });
        return;
    }
    setMasterDiagnoses(prev => [newDiagnosis, ...prev]);
    toast({ title: "Diagnosis Added", description: `Successfully added ${newDiagnosis.name} to the master list.` });
  };


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Clinical Template Management" description="Create, edit, and manage clinical templates linked to diagnoses for various report types." />

      <Card className="mt-6 mb-8">
        <CardHeader>
          <CardTitle className="font-headline">Template Editor</CardTitle>
          <CardDescription>Select an existing template to edit, or fill out the form to create a new one. A template name (e.g., 'Chronic Kidney Disease') can be mapped to multiple specific ICD-10 diagnoses.</CardDescription>
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
                            <FormLabel className="text-base font-bold">Template Name</FormLabel>
                            <FormControl><Input placeholder="e.g., IgA Nephropathy" {...field} /></FormControl>
                            <FormDescription>The broad clinical diagnosis name for this template.</FormDescription>
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">Mapped ICD-10 Diagnoses</CardTitle>
                      <CardDescription>Add specific ICD-10 diagnoses that fall under this template's clinical category.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isPopoverOpen}
                            className="w-full justify-between"
                          >
                            Click on a diagnosis to add...
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                           <Command>
                            <CommandInput placeholder="Search diagnosis..." />
                            <CommandList>
                                <CommandEmpty>No diagnosis found.</CommandEmpty>
                                <CommandGroup>
                                  {masterDiagnoses.map((diagnosis) => (
                                    <CommandItem
                                      key={diagnosis.id}
                                      value={`${diagnosis.name} ${diagnosis.icdCode}`}
                                      onSelect={() => handleAddDiagnosis(diagnosis.id)}
                                    >
                                      {diagnosis.name} ({diagnosis.icdCode})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      <div className="space-y-2 pt-2">
                        {diagnosisFields.length > 0 ? (
                          diagnosisFields.map((field, index) => (
                            <div key={field.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                              <p className="text-sm">
                                <span className="font-semibold">{field.name}</span>
                                <Badge variant="secondary" className="ml-2">{field.icdCode}</Badge>
                              </p>
                              <Button type="button" variant="ghost" size="icon" className="text-destructive h-6 w-6" onClick={() => removeDiagnosis(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-2">No diagnoses mapped yet.</p>
                        )}
                      </div>

                       <FormMessage>{form.formState.errors.diagnoses?.message || form.formState.errors.diagnoses?.root?.message}</FormMessage>
                    </CardContent>
                  </Card>
                  
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
                      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendMedication({ id: crypto.randomUUID(), name: "", dosage: "", frequency: "", instructions: "" })}>
                        <PlusCircle className="mr-2 h-4 w-4"/>Add Medication
                      </Button>
                    </CardContent>
                  </Card>

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
                  
                  {templateType === 'Discharge Summary' && (
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Discharge Summary Fields</CardTitle>
                        </Header>
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
                  
                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" /> Save Template
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline">ICD-10 Diagnosis Master List</CardTitle>
              <CardDescription>This is the central database of all available diagnoses.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsAddMasterDiagOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4"/>Add New Diagnosis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>ICD-10 Code</TableHead>
                  <TableHead>Primary Clinical Name</TableHead>
                  <TableHead>Full ICD-10 Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masterDiagnoses.sort((a,b) => a.icdCode.localeCompare(b.icdCode)).map(d => (
                  <TableRow key={d.id}>
                    <TableCell><Badge variant="secondary">{d.icdCode}</Badge></TableCell>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-muted-foreground">{d.icdName}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEditMasterDiagnosis(d)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Names
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <AddMasterDiagnosisDialog 
        isOpen={isAddMasterDiagOpen}
        onOpenChange={setIsAddMasterDiagOpen}
        onSave={handleAddNewMasterDiagnosis}
      />

      <EditMasterDiagnosisDialog
        isOpen={isEditMasterDiagOpen}
        onOpenChange={setIsEditMasterDiagOpen}
        diagnosis={selectedMasterDiag}
        onSave={handleSaveMasterDiagnosis}
      />
    </div>
  );
}
