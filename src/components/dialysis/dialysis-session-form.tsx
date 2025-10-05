
"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dialysisSessionSchema } from '@/lib/schemas';
import type { Patient, DialysisSession } from '@/lib/types';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Save } from 'lucide-react';
import * as D_CONSTANTS from '@/lib/constants'; // Use aliased import to avoid name clashes
import { useEffect } from 'react';

const formSchema = dialysisSessionSchema.omit({id: true, patientId: true});
type FormData = Zod.infer<typeof formSchema>;


interface DialysisSessionFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient;
    session: DialysisSession | null;
}

const MultiSelectField = ({ form, name, label, options }: { form: any, name: any, label: string, options: readonly string[] }) => (
    <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                                {field.value?.length ? `${field.value.length} selected` : `Select ${label.toLowerCase()}...`}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
                            <CommandEmpty>Nothing found.</CommandEmpty>
                            <CommandGroup>
                                <ScrollArea className="h-48">
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option}
                                            onSelect={() => {
                                                const selected = field.value || [];
                                                const isSelected = selected.includes(option);
                                                form.setValue(name, isSelected ? selected.filter((s: string) => s !== option) : [...selected, option]);
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", (field.value || []).includes(option) ? "opacity-100" : "opacity-0")} />
                                            {option}
                                        </CommandItem>
                                    ))}
                                </ScrollArea>
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
                <FormMessage />
            </FormItem>
        )}
    />
);

export function DialysisSessionForm({ isOpen, onOpenChange, patient, session }: DialysisSessionFormProps) {
    const { addOrUpdateDialysisSession } = usePatientData();
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (session) {
            form.reset(session);
        } else {
            form.reset({
                dateOfSession: new Date().toISOString().split('T')[0],
                indicationOfDialysis: [],
                nativeKidneyDisease: [],
                comorbidities: [],
                typeOfDialysis: 'Hemodialysis',
                duration: { hours: 4, minutes: 0 },
                complicationsFlag: false,
                complicationsDesc: [],
                complicationsManagementDesc: [],
                anticoagulation: 'Heparin',
            });
        }
    }, [session, isOpen, form]);

    const onSubmit = (data: FormData) => {
        const sessionToSave: DialysisSession = {
            id: session?.id || crypto.randomUUID(),
            patientId: patient.id,
            ...data,
        };
        addOrUpdateDialysisSession(patient.id, sessionToSave);
        toast({ title: `Session ${session ? 'updated' : 'saved'} successfully.` });
        onOpenChange(false);
    };
    
    const showComplications = form.watch('complicationsFlag');

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{session ? 'Edit' : 'Log'} Hemodialysis Session</DialogTitle>
                    <DialogDescription>For patient: {patient.firstName} {patient.lastName}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <ScrollArea className="h-[70vh] pr-4">
                            <div className="space-y-6">
                                <FormField control={form.control} name="dateOfSession" render={({ field }) => ( <FormItem><FormLabel>Date of Session</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <MultiSelectField form={form} name="indicationOfDialysis" label="Indication of Dialysis" options={D_CONSTANTS.DIALYSIS_INDICATIONS} />
                                <MultiSelectField form={form} name="comorbidities" label="Comorbidities" options={D_CONSTANTS.COMORBIDITIES} />

                                <Card>
                                    <CardHeader><CardTitle>Session Details</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="dialysisModality" render={({ field }) => ( <FormItem><FormLabel>Dialysis Modality</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{D_CONSTANTS.HD_MODALITIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField control={form.control} name="duration.hours" render={({ field }) => ( <FormItem><FormLabel>Duration (H)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="duration.minutes" render={({ field }) => ( <FormItem><FormLabel>Duration (M)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl><FormMessage /></FormItem> )} />
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader><CardTitle>Fluid Management</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FormField control={form.control} name="dryWeight" render={({ field }) => ( <FormItem><FormLabel>Dry Weight (kg)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="weightBefore" render={({ field }) => ( <FormItem><FormLabel>Pre-HD Weight (kg)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="weightAfter" render={({ field }) => ( <FormItem><FormLabel>Post-HD Weight (kg)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="ultrafiltration" render={({ field }) => ( <FormItem><FormLabel>Ultrafiltration (mL)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl><FormMessage /></FormItem> )} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle>Blood Pressure (mmHg)</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField control={form.control} name="bpBefore.systolic" render={({ field }) => ( <FormItem><FormLabel>Pre-HD Sys.</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl></FormItem> )}/>
                                            <FormField control={form.control} name="bpBefore.diastolic" render={({ field }) => ( <FormItem><FormLabel>Pre-HD Dia.</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl></FormItem> )}/>
                                        </div>
                                         <div className="grid grid-cols-2 gap-2">
                                            <FormField control={form.control} name="bpAfter.systolic" render={({ field }) => ( <FormItem><FormLabel>Post-HD Sys.</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl></FormItem> )}/>
                                            <FormField control={form.control} name="bpAfter.diastolic" render={({ field }) => ( <FormItem><FormLabel>Post-HD Dia.</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl></FormItem> )}/>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader><CardTitle>Access & Technical Details</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FormField control={form.control} name="accessType" render={({ field }) => ( <FormItem><FormLabel>Access Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{D_CONSTANTS.ACCESS_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="vascularAccessLocation" render={({ field }) => ( <FormItem><FormLabel>Access Location</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{D_CONSTANTS.VASCULAR_ACCESS_LOCATIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="anticoagulation" render={({ field }) => ( <FormItem><FormLabel>Anticoagulation</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent>{D_CONSTANTS.ANTICOAGULATION_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="bloodFlowRate" render={({ field }) => ( <FormItem><FormLabel>Blood Flow Rate (mL/min)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="dialysateFlowRate" render={({ field }) => ( <FormItem><FormLabel>Dialysate Flow Rate (mL/min)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="dialyzerType" render={({ field }) => ( <FormItem><FormLabel>Dialyzer Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <FormField control={form.control} name="complicationsFlag" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                <FormLabel className="text-base font-semibold">Any Complications?</FormLabel>
                                            </FormItem>
                                        )} />
                                    </CardHeader>
                                    {showComplications && (
                                        <CardContent className="space-y-4">
                                            <MultiSelectField form={form} name="complicationsDesc" label="Complications" options={D_CONSTANTS.HD_COMPLICATIONS} />
                                            <MultiSelectField form={form} name="complicationsManagementDesc" label="Management" options={D_CONSTANTS.HD_COMPLICATION_MANAGEMENTS} />
                                        </CardContent>
                                    )}
                                </Card>
                                
                                <FormField control={form.control} name="medicationsAdministered" render={({ field }) => ( <FormItem><FormLabel>Medications Administered (e.g., EPO, Iron)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="anyConcernsForDoctor" render={({ field }) => ( <FormItem><FormLabel>Concerns for Doctor</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />

                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-6">
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Session</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
