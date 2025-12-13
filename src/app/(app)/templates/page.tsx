

"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { Save, Trash2, PlusCircle, FileText, Activity, Microscope, ChevronsUpDown, Pencil, Database } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { MOCK_DIAGNOSES, DIAGNOSIS_TEMPLATES } from '@/lib/constants';
import type { DiagnosisTemplate, Diagnosis, Medication, MasterDiagnosis } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { InvestigationDatabase } from '@/components/investigations/investigation-database';
import { usePatientData } from '@/hooks/use-patient-data';
import { useAuth } from '@/context/auth-provider';
import { saveTemplate, getTemplates, saveMasterDiagnoses, getMasterDiagnoses } from '@/lib/firestore-helpers';
import { Skeleton } from '@/components/ui/skeleton';

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


const icdMappingSchema = z.object({
    icdCode: z.string().min(1, 'ICD Code is required'),
    icdName: z.string().min(1, 'ICD Name is required'),
});

const masterDiagnosisSchema = z.object({
    id: z.string(),
    clinicalDiagnosis: z.string().min(1, 'Clinical Diagnosis is required'),
    icdMappings: z.array(icdMappingSchema).min(1, 'At least one ICD mapping is required'),
});

type MasterDiagnosisFormData = z.infer<typeof masterDiagnosisSchema>;

function AddMasterDiagnosisDialog({
    isOpen,
    onOpenChange,
    onSave,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (newDiagnosis: Omit<MasterDiagnosis, 'id'>) => void;
}) {
    const form = useForm<Omit<MasterDiagnosis, 'id'>>({
        resolver: zodResolver(masterDiagnosisSchema.omit({ id: true })),
        defaultValues: {
            clinicalDiagnosis: '',
            icdMappings: [{ icdCode: '', icdName: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'icdMappings',
    });

    const handleSave = (data: Omit<MasterDiagnosis, 'id'>) => {
        onSave(data);
        onOpenChange(false);
        form.reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Clinical Diagnosis</DialogTitle>
                    <DialogDescription>
                        Define a new clinical diagnosis and map one or more ICD-10 codes to it.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        <FormField
                            control={form.control}
                            name="clinicalDiagnosis"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Clinical Diagnosis Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Chronic Kidney Disease" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-md">ICD-10 Mappings</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                                        <FormField
                                            control={form.control}
                                            name={`icdMappings.${index}.icdCode`}
                                            render={({ field }) => (
                                                <FormItem className="flex-grow">
                                                    <FormLabel>ICD-10 Code</FormLabel>
                                                    <FormControl><Input placeholder="e.g., N18.3" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`icdMappings.${index}.icdName`}
                                            render={({ field }) => (
                                                <FormItem className="flex-grow-[2]">
                                                    <FormLabel>ICD-10 Description</FormLabel>
                                                    <FormControl><Input placeholder="e.g., Chronic kidney disease, stage 3" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ icdCode: '', icdName: '' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add another ICD-10 mapping
                                </Button>
                            </CardContent>
                        </Card>
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

function EditMasterDiagnosisDialog({
    diagnosis,
    isOpen,
    onOpenChange,
    onSave,
}: {
    diagnosis: MasterDiagnosis | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (updatedDiagnosis: MasterDiagnosis) => void;
}) {
    const form = useForm<MasterDiagnosisFormData>({
        resolver: zodResolver(masterDiagnosisSchema),
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "icdMappings",
    });

    useEffect(() => {
        if (diagnosis) {
            form.reset({
                id: diagnosis.id,
                clinicalDiagnosis: diagnosis.clinicalDiagnosis,
                icdMappings: diagnosis.icdMappings,
            });
        }
    }, [diagnosis, form]);

    if (!diagnosis) return null;

    const handleSave = (data: MasterDiagnosisFormData) => {
        onSave(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit: {diagnosis.clinicalDiagnosis}</DialogTitle>
                    <DialogDescription>
                        Manage the ICD-10 codes mapped to this clinical diagnosis.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        <FormField
                            control={form.control}
                            name="clinicalDiagnosis"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Clinical Diagnosis Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-md">ICD-10 Mappings</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                                        <FormField control={form.control} name={`icdMappings.${index}.icdCode`} render={({ field }) => (
                                            <FormItem className="flex-grow"><FormLabel>ICD-10 Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`icdMappings.${index}.icdName`} render={({ field }) => (
                                            <FormItem className="flex-grow-[2]"><FormLabel>ICD-10 Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ icdCode: '', icdName: '' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add another mapping
                                </Button>
                            </CardContent>
                        </Card>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default function TemplatesPage() {
    const {
        investigationMasterList,
        investigationPanels,
        addOrUpdateInvestigation,
        deleteInvestigation,
        addOrUpdatePanel,
        deletePanel
    } = usePatientData();

    const { user } = useAuth();
    const [templates, setTemplates] = useState<Record<string, DiagnosisTemplate>>({});
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const [masterDiagnoses, setMasterDiagnoses] = useState<MasterDiagnosis[]>([]);
    const [isEditMasterDiagOpen, setIsEditMasterDiagOpen] = useState(false);
    const [isAddMasterDiagOpen, setIsAddMasterDiagOpen] = useState(false);
    const [selectedMasterDiag, setSelectedMasterDiag] = useState<MasterDiagnosis | null>(null);

    // Load templates and master diagnoses from Firestore
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                setIsLoading(true);
                const [loadedTemplates, loadedDiagnoses] = await Promise.all([
                    getTemplates(user.uid),
                    getMasterDiagnoses(user.uid)
                ]);

                // If no templates in Firestore, use defaults
                if (Object.keys(loadedTemplates).length === 0) {
                    const defaultTemplates = JSON.parse(JSON.stringify(DIAGNOSIS_TEMPLATES));
                    setTemplates(defaultTemplates);
                } else {
                    setTemplates(loadedTemplates);
                }

                // If no diagnoses in Firestore, use defaults
                if (loadedDiagnoses.length === 0) {
                    setMasterDiagnoses(MOCK_DIAGNOSES);
                    // Save defaults to Firestore
                    await saveMasterDiagnoses(user.uid, MOCK_DIAGNOSES);
                } else {
                    setMasterDiagnoses(loadedDiagnoses);
                }
            } catch (error) {
                console.error('Error loading templates:', error);
                toast({ title: 'Error', description: 'Failed to load templates', variant: 'destructive' });
                // Fallback to defaults
                setTemplates(JSON.parse(JSON.stringify(DIAGNOSIS_TEMPLATES)));
                setMasterDiagnoses(MOCK_DIAGNOSES);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user, toast]);

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

    const onSaveTemplate = async (data: TemplateFormData) => {
        if (!user) return;

        try {
            await saveTemplate(user.uid, data);
            setTemplates(prev => ({ ...prev, [data.templateName]: data }));
            toast({ title: "Template Saved", description: `Template "${data.templateName}" has been saved to Firestore.` });
            setSelectedTemplate(data.templateName);
        } catch (error) {
            console.error('Error saving template:', error);
            toast({ title: 'Error', description: 'Failed to save template', variant: 'destructive' });
        }
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
            const diagnosesToAppend: Diagnosis[] = diagnosisToAdd.icdMappings.map(mapping => ({
                id: `${diagnosisToAdd.id}-${mapping.icdCode}`,
                name: mapping.icdName,
                icdCode: mapping.icdCode,
                icdName: mapping.icdName,
            }));

            diagnosesToAppend.forEach(diag => {
                const isAlreadyAdded = diagnosisFields.some(field => field.icdCode === diag.icdCode);
                if (!isAlreadyAdded) {
                    appendDiagnosis(diag);
                }
            });

            toast({ title: "Diagnoses Added", description: `Added options for "${diagnosisToAdd.clinicalDiagnosis}" to the template.` });
            setIsPopoverOpen(false);
        }
    };

    const handleEditMasterDiagnosis = (diagnosis: MasterDiagnosis) => {
        setSelectedMasterDiag(diagnosis);
        setIsEditMasterDiagOpen(true);
    };

    const handleSaveMasterDiagnosis = async (updatedDiagnosis: MasterDiagnosis) => {
        if (!user) return;

        const updatedList = masterDiagnoses.map(d => (d.id === updatedDiagnosis.id ? updatedDiagnosis : d));
        setMasterDiagnoses(updatedList);

        try {
            await saveMasterDiagnoses(user.uid, updatedList);
            toast({
                title: 'Master Diagnosis Updated',
                description: `"${updatedDiagnosis.clinicalDiagnosis}" has been updated and saved to Firestore.`,
            });
        } catch (error) {
            console.error('Error saving master diagnosis:', error);
            toast({ title: 'Error', description: 'Failed to save diagnosis', variant: 'destructive' });
        }
    };

    const handleAddNewMasterDiagnosis = async (data: Omit<MasterDiagnosis, 'id'>) => {
        if (!user) return;

        const newDiagnosis: MasterDiagnosis = {
            id: data.clinicalDiagnosis.toLowerCase().replace(/\s/g, '_'),
            ...data
        };

        if (masterDiagnoses.some(d => d.id === newDiagnosis.id)) {
            toast({ title: "Error", description: `Clinical diagnosis "${newDiagnosis.clinicalDiagnosis}" already exists.`, variant: "destructive" });
            return;
        }

        const updatedList = [newDiagnosis, ...masterDiagnoses];
        setMasterDiagnoses(updatedList);

        try {
            await saveMasterDiagnoses(user.uid, updatedList);
            toast({ title: "Diagnosis Added", description: `Successfully added ${newDiagnosis.clinicalDiagnosis} to the master list and saved to Firestore.` });
        } catch (error) {
            console.error('Error saving new diagnosis:', error);
            toast({ title: 'Error', description: 'Failed to save diagnosis', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-2">
                <PageHeader title="Clinical Template & Database Management" description="Loading templates and diagnoses..." />
                <div className="space-y-6 mt-6">
                    <Card><CardContent className="h-96 pt-6"><Skeleton className="h-full w-full" /></CardContent></Card>
                    <Card><CardContent className="h-96 pt-6"><Skeleton className="h-full w-full" /></CardContent></Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-2">
            <PageHeader title="Clinical Template &amp; Database Management" description="Create, edit, and manage clinical templates, diagnoses, and investigations." />

            <div className="space-y-8 mt-6">
                <Card>
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
                                                            Add a Clinical Diagnosis to map...
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Search clinical diagnosis..." />
                                                            <CommandList>
                                                                <CommandEmpty>No diagnosis found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {masterDiagnoses.map((diagnosis) => (
                                                                        <CommandItem
                                                                            key={diagnosis.id}
                                                                            value={diagnosis.clinicalDiagnosis}
                                                                            onSelect={() => handleAddDiagnosis(diagnosis.id)}
                                                                        >
                                                                            {diagnosis.clinicalDiagnosis}
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
                                                    <PlusCircle className="mr-2 h-4 w-4" />Add Medication
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-muted/50">
                                            <CardHeader>
                                                <CardTitle className="font-headline flex items-center"><Microscope className="mr-2 h-5 w-5 text-primary" />Investigation Report Fields</CardTitle>
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
                                                    <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary" />Discharge Summary Fields</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <FormField control={form.control} name="dischargeInstructions" render={({ field }) => (<FormItem><FormLabel>Discharge Instructions</FormLabel><FormControl><Textarea rows={4} placeholder="Default discharge instructions..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                </CardContent>
                                            </Card>
                                        )}

                                        {templateType === 'Opinion Report' && (
                                            <Card className="bg-muted/50">
                                                <CardHeader>
                                                    <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Opinion Report Fields</CardTitle>
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
                                <CardTitle className="font-headline flex items-center"><Database className="mr-2 h-6 w-6 text-primary" />Master Diagnosis Database</CardTitle>
                                <CardDescription>Manage the central list of clinical diagnoses and their ICD-10 mappings.</CardDescription>
                            </div>
                            <Button onClick={() => setIsAddMasterDiagOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Add New Diagnosis</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Clinical Diagnosis</TableHead>
                                        <TableHead>Mapped ICD-10 Codes</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {masterDiagnoses.map(diag => (
                                        <TableRow key={diag.id}>
                                            <TableCell className="font-semibold">{diag.clinicalDiagnosis}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {diag.icdMappings.map(m => <Badge key={m.icdCode} variant="secondary">{m.icdCode}: {m.icdName}</Badge>)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditMasterDiagnosis(diag)}><Pencil className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <InvestigationDatabase />
            </div>

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
