
"use client";

import { useState, useCallback, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Patient, Intervention, InterventionFormData } from '@/lib/types';
import { interventionFormSchema } from '@/lib/schemas';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Edit, Trash2, Wind } from 'lucide-react';
import { INTERVENTION_TYPES, CATHETER_SITES, CUFFED_CATHETER_SITES, CAPD_CATHETER_TYPES, CAPD_INSERTION_TECHNIQUES, AV_FISTULA_TYPES } from '@/lib/constants';

interface PatientInterventionsTabContentProps {
    patient: Patient;
}

export function PatientInterventionsTabContent({ patient }: PatientInterventionsTabContentProps) {
    const { toast } = useToast();
    const { addOrUpdateIntervention, deleteIntervention } = usePatientData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);

    const sortedInterventions = useMemo(() => {
        return [...(patient.interventions || [])].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    }, [patient.interventions]);

    const form = useForm<InterventionFormData>({
        resolver: zodResolver(interventionFormSchema),
    });

    const openDialog = (intervention: Intervention | null = null) => {
        setEditingIntervention(intervention);
        form.reset(intervention ? {
            ...intervention.details,
            type: intervention.type,
            date: format(parseISO(intervention.date), 'yyyy-MM-dd'),
            notes: intervention.notes,
        } : {
            date: format(new Date(), 'yyyy-MM-dd'),
            type: undefined,
            notes: "",
        });
        setIsFormOpen(true);
    };

    const onSubmit = async (data: InterventionFormData) => {
        const interventionToSave: Intervention = {
            id: editingIntervention?.id || crypto.randomUUID(),
            date: data.date,
            type: data.type,
            notes: data.notes,
            details: data,
        };
        
        await addOrUpdateIntervention(patient.id, interventionToSave);
        toast({
            title: `Intervention ${editingIntervention ? 'Updated' : 'Logged'}`,
            description: `The ${data.type} procedure on ${data.date} has been saved.`,
        });
        setIsFormOpen(false);
    };

    const handleDelete = async (interventionId: string) => {
        await deleteIntervention(patient.id, interventionId);
        toast({ title: 'Intervention Deleted', variant: 'destructive' });
    };

    const interventionType = form.watch('type');

    return (
        <>
            <Card className="shadow-md">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline text-xl">Intervention History</CardTitle>
                            <CardDescription>Chronological record of all clinical interventions for this patient.</CardDescription>
                        </div>
                        <Button onClick={() => openDialog()}><PlusCircle className="mr-2 h-4 w-4" />Log New Intervention</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {sortedInterventions.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                            <p>No interventions recorded for this patient.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedInterventions.map(item => (
                                <Card key={item.id} className="bg-muted/30">
                                    <CardHeader className="flex flex-row items-start justify-between pb-3">
                                        <div>
                                            <CardTitle className="text-lg">{item.type}</CardTitle>
                                            <CardDescription>{format(parseISO(item.date), 'PPP')}</CardDescription>
                                        </div>
                                         <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDialog(item)}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4"/></Button>
                                         </div>
                                    </CardHeader>
                                    <CardContent>
                                        {item.notes && <p className="text-sm italic">"{item.notes}"</p>}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingIntervention ? 'Edit' : 'Log'} Intervention</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                            <FormField control={form.control} name="date" render={({ field }) => (
                                <FormItem><FormLabel>Date of Intervention</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem><FormLabel>Intervention Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl><SelectContent>{INTERVENTION_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )} />

                            {interventionType === 'Temporary Catheter' && <FormField control={form.control} name="catheterSite" render={({ field }) => (
                                <FormItem><FormLabel>Catheter Site</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select site..." /></SelectTrigger></FormControl><SelectContent>{CATHETER_SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )}/>}

                            {interventionType === 'Tunneled Cuffed Catheter' && <FormField control={form.control} name="cuffedCatheterSite" render={({ field }) => (
                                <FormItem><FormLabel>Cuffed Catheter Site</FormLabel><Select onValuechange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select site..." /></SelectTrigger></FormControl><SelectContent>{CUFFED_CATHETER_SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )}/>}
                            
                            {interventionType === 'Dialysis Catheter Removal' && <FormField control={form.control} name="isCatheterRemoved" render={({ field }) => (
                               <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Confirm Removal</FormLabel></div></FormItem>
                            )}/>}

                            {interventionType === 'CAPD Catheter Insertion' && (<div className="space-y-4">
                                <FormField control={form.control} name="capdCatheterType" render={({ field }) => (
                                    <FormItem><FormLabel>CAPD Catheter Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl><SelectContent>{CAPD_CATHETER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="capdInsertionTechnique" render={({ field }) => (
                                    <FormItem><FormLabel>Insertion Technique</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select technique..." /></SelectTrigger></FormControl><SelectContent>{CAPD_INSERTION_TECHNIQUES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )}/>
                            </div>)}
                            
                             {interventionType === 'CAPD Catheter Removal' && <FormField control={form.control} name="isCapdCatheterRemoved" render={({ field }) => (
                               <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Confirm CAPD Catheter Removal</FormLabel></div></FormItem>
                            )}/>}

                            {interventionType === 'AV Fistula Creation' && <FormField control={form.control} name="avFistulaType" render={({ field }) => (
                                <FormItem><FormLabel>AV Fistula Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl><SelectContent>{AV_FISTULA_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )}/>}
                            
                             {interventionType === 'Endovascular Intervention' && <FormField control={form.control} name="endoInterventionDetails" render={({ field }) => (
                               <FormItem><FormLabel>Endovascular Intervention Details</FormLabel><FormControl><Textarea placeholder="e.g., Balloon angioplasty of cephalic vein..." {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>}

                            <FormField control={form.control} name="notes" render={({ field }) => (
                               <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Enter any relevant notes..." {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Intervention</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
