
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { INVESTIGATION_MASTER_LIST, INVESTIGATION_PANELS } from '@/lib/constants';
import type { InvestigationRecord, InvestigationTest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Notebook, Edit, Trash2, MoreVertical, ChevronsUpDown, Package, TestTube } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';


interface PatientInvestigationsTabContentProps {
  patientId: string;
}

const testEntrySchema = z.object({
  id: z.string(),
  group: z.string(),
  name: z.string(),
  result: z.string().min(1, "Result is required"),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
});

const investigationRecordFormSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  tests: z.array(testEntrySchema).min(1, "At least one test result is required."),
});
type InvestigationRecordFormData = z.infer<typeof investigationRecordFormSchema>;

export const PatientInvestigationsTabContent = ({ patientId }: PatientInvestigationsTabContentProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<InvestigationRecord | null>(null);

  // Mock data would be replaced by actual data fetching in a real app
  const [investigationRecords, setInvestigationRecords] = useState<InvestigationRecord[]>([
    {
      id: 'ir001',
      date: '2024-04-15',
      notes: 'Routine blood work after starting new medication.',
      tests: [
        { id: 't001a', group: 'Hematological', name: 'Hemoglobin', result: '11.5', unit: 'g/dL', normalRange: '13.5-17.5' },
        { id: 't001b', group: 'Hematological', name: 'Platelet Count', result: '250', unit: 'x10^9/L', normalRange: '150-400' },
        { id: 't001c', group: 'Biochemistry', name: 'Serum Creatinine', result: '1.9', unit: 'mg/dL', normalRange: '0.7-1.3' },
        { id: 't001d', group: 'Biochemistry', name: 'eGFR', result: '38', unit: 'mL/min/1.73m²' },
      ],
    },
    {
      id: 'ir002',
      date: '2024-01-10',
      notes: 'Initial workup.',
      tests: [
        { id: 't002a', group: 'Urine Analysis', name: 'Protein', result: '2+', unit: '', normalRange: 'Negative' },
        { id: 't002b', group: 'Serology', name: 'ANA', result: 'Negative', unit: '' },
      ],
    },
  ]);
  
  const sortedRecords = [...investigationRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const form = useForm<InvestigationRecordFormData>({
    resolver: zodResolver(investigationRecordFormSchema),
    defaultValues: {
      id: undefined,
      date: new Date().toISOString().split('T')[0],
      notes: "",
      tests: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "tests",
  });

  const handleOpenDialogForNew = () => {
    form.reset({
      id: undefined,
      date: new Date().toISOString().split('T')[0],
      notes: "",
      tests: [],
    });
    setIsFormDialogOpen(true);
  };
  
  const handleOpenDialogForEdit = (record: InvestigationRecord) => {
    form.reset({
      ...record,
      date: format(parseISO(record.date), 'yyyy-MM-dd'),
    });
    setIsFormDialogOpen(true);
  };

  const handleSaveInvestigationRecord = (data: InvestigationRecordFormData) => {
    if (data.id) { // Editing existing record
      setInvestigationRecords(prev => prev.map(rec => rec.id === data.id ? { ...rec, ...data } : rec));
      toast({ title: "Investigation Updated", description: `Record for ${data.date} has been updated.` });
    } else { // Creating new record
      const newRecord: InvestigationRecord = { ...data, id: crypto.randomUUID() };
      setInvestigationRecords(prev => [newRecord, ...prev]);
      toast({ title: "Investigation Added", description: `Record for ${data.date} logged.` });
    }
    setIsFormDialogOpen(false);
  };

  const handleDeleteRecord = () => {
    if (!recordToDelete) return;
    setInvestigationRecords(prev => prev.filter(rec => rec.id !== recordToDelete.id));
    toast({ title: "Record Deleted", description: `Investigation record from ${format(parseISO(recordToDelete.date), 'PPP')} has been deleted.`, variant: "destructive" });
    setIsDeleteDialogOpen(false);
    setRecordToDelete(null);
  };
  
  const openDialogFromURL = useCallback(() => {
    const dateParam = searchParams.get('date');
    const testsParam = searchParams.get('tests');
    
    if (dateParam && testsParam) {
      const testIds = testsParam.split(',');
      const testsToLog = INVESTIGATION_MASTER_LIST.filter(t => testIds.includes(t.id));
      
      form.reset({
        id: undefined,
        date: dateParam,
        notes: "Ordered from main investigations browser.",
        tests: testsToLog.map(t => ({
          id: t.id,
          group: t.group,
          name: t.name,
          result: "",
          unit: "",
          normalRange: ""
        })),
      });

      setIsFormDialogOpen(true);
      const currentPath = window.location.pathname;
      router.replace(currentPath, { scroll: false });
    }
  }, [searchParams, form, router]);
  
  useEffect(() => {
    openDialogFromURL();
  }, [openDialogFromURL]);
  
   const addTestsToForm = (testsToAdd: InvestigationTest[]) => {
    const existingTestNames = fields.map(f => f.name);
    const newTests = testsToAdd.filter(t => !existingTestNames.includes(t.name));
    if(newTests.length > 0) {
      append(newTests);
    }
    setIsSearchPopoverOpen(false);
  };


  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleOpenDialogForNew}>
          <PlusCircle className="mr-2 h-4 w-4" />Add New Investigation Record
        </Button>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center">
              <Notebook className="mr-2 h-5 w-5 text-primary"/>
              {form.getValues('id') ? 'Edit Investigation Record' : 'Log New Investigation Results'}
            </DialogTitle>
            <DialogDescription>
              {form.getValues('id') ? 'Update the date, notes, or test results for this record.' : 'Enter the date and notes for this record, then fill in the results for each test.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveInvestigationRecord)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Investigation</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Notes (Optional)</FormLabel>
                    <FormControl><Input placeholder="Any overall notes for this set of investigations" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-md font-semibold">Test Results</CardTitle>
                  <CardDescription>Add tests or panels using the search box below, then enter the results.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
                      <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start mb-4">
                              <PlusCircle className="mr-2 h-4 w-4" /> Add Test or Panel...
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                              <CommandInput placeholder="Search for tests or panels..." />
                              <CommandList>
                                  <CommandEmpty>No results found.</CommandEmpty>
                                  <CommandGroup heading={<div className="flex items-center"><Package className="mr-2 h-4 w-4"/>Panels</div>}>
                                      {INVESTIGATION_PANELS.map(panel => (
                                          <CommandItem key={panel.id} onSelect={() => {
                                              const tests = INVESTIGATION_MASTER_LIST.filter(t => panel.testIds.includes(t.id));
                                              addTestsToForm(tests.map(t => ({ id: t.id, name: t.name, group: t.group, result: '', unit: '', normalRange: ''})));
                                          }}>
                                              {panel.name}
                                          </CommandItem>
                                      ))}
                                  </CommandGroup>
                                   <CommandGroup heading={<div className="flex items-center"><TestTube className="mr-2 h-4 w-4"/>Individual Tests</div>}>
                                       {INVESTIGATION_MASTER_LIST.map(test => (
                                          <CommandItem key={test.id} onSelect={() => addTestsToForm([{...test, result: '', unit: '', normalRange: ''}])}>
                                              {test.name}
                                          </CommandItem>
                                      ))}
                                  </CommandGroup>
                              </CommandList>
                          </Command>
                      </PopoverContent>
                  </Popover>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-3 border rounded-lg space-y-2 relative bg-muted/50">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                         <div>
                           <span className="font-medium">{field.name}</span> <Badge variant="secondary">{field.group}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                           <FormField control={form.control} name={`tests.${index}.result`} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Result</FormLabel>
                              <FormControl><Input placeholder="e.g., 12.5, Positive" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`tests.${index}.unit`} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit</FormLabel>
                              <FormControl><Input placeholder="e.g., g/dL" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`tests.${index}.normalRange`} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Normal Range</FormLabel>
                              <FormControl><Input placeholder="e.g., 13.5-17.5" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage>{form.formState.errors.tests?.message || form.formState.errors.tests?.root?.message}</FormMessage>
                </CardContent>
              </Card>

              <DialogFooter className="pt-4 sticky bottom-0 bg-background/95 pb-2">
                <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Record</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the investigation record from {recordToDelete ? format(parseISO(recordToDelete.date), 'PPP') : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {sortedRecords.length === 0 ? (
         <Card className="flex items-center justify-center h-40 border-dashed">
            <p className="text-muted-foreground text-center py-4">No investigation records found for this patient.</p>
          </Card>
      ) : (
        <div className="space-y-6">
          {sortedRecords.map(record => (
            <Card key={record.id} className="shadow-md">
              <CardHeader className="bg-muted/30">
                <CardTitle className="font-headline text-lg flex items-center justify-between">
                  <span>Investigations on: {format(parseISO(record.date), 'PPP')}</span>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialogForEdit(record)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Record</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setRecordToDelete(record); setIsDeleteDialogOpen(true); }} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Record</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </CardTitle>
                {record.notes && <CardDescription className="pt-1">{record.notes}</CardDescription>}
              </CardHeader>
              <CardContent className="pt-4 px-0 sm:px-6">
                {record.tests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Group</TableHead>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="w-[100px]">Unit</TableHead>
                        <TableHead>Normal Range</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {record.tests.map(test => (
                        <TableRow key={test.id}>
                          <TableCell><Badge variant="outline">{test.group}</Badge></TableCell>
                          <TableCell className="font-medium">{test.name}</TableCell>
                          <TableCell>{test.result}</TableCell>
                          <TableCell>{test.unit || 'N/A'}</TableCell>
                          <TableCell>{test.normalRange || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-sm">No specific tests listed for this record date.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
