
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { INVESTIGATION_MASTER_LIST, INVESTIGATION_PANELS, FREQUENTLY_USED_INVESTIGATIONS } from '@/lib/constants';
import type { InvestigationRecord, InvestigationTest, Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Notebook, Edit, Trash2, MoreVertical, ChevronsUpDown, Package, TestTube, Star, Search, AlertTriangle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { usePatientData } from '@/hooks/use-patient-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface PatientInvestigationsTabContentProps {
  patient: Patient;
  onDataChange?: () => void;
}

const testEntrySchema = z.object({
  id: z.string(),
  group: z.string(),
  name: z.string(),
  result: z.string().optional(), // Made optional so users can save incomplete data
  unit: z.string().optional(),
  normalRange: z.string().optional(),
  resultType: z.enum(['numeric', 'text', 'select']).optional(),
  options: z.array(z.string()).optional(),
});

const investigationRecordFormSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  tests: z.array(testEntrySchema).min(1, "At least one test result is required."),
});
type InvestigationRecordFormData = z.infer<typeof investigationRecordFormSchema>;

const isCritical = (test: InvestigationTest): boolean => {
  if (test.resultType !== 'numeric' || !test.result || !test.normalRange || test.normalRange === 'N/A') return false;

  const resultValue = parseFloat(test.result);
  if (isNaN(resultValue)) return false;

  const rangeMatch = test.normalRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    const lowerBound = parseFloat(rangeMatch[1]);
    const upperBound = parseFloat(rangeMatch[2]);
    return resultValue < lowerBound || resultValue > upperBound;
  }

  const lowerBoundMatch = test.normalRange.match(/>\s*([\d.]+)/);
  if (lowerBoundMatch) {
    const lowerBound = parseFloat(lowerBoundMatch[1]);
    return resultValue <= lowerBound;
  }

  const upperBoundMatch = test.normalRange.match(/<\s*([\d.]+)/);
  if (upperBoundMatch) {
    const upperBound = parseFloat(upperBoundMatch[1]);
    return resultValue >= upperBound;
  }

  return false;
};

export const PatientInvestigationsTabContent = ({ patient, onDataChange }: PatientInvestigationsTabContentProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addOrUpdateInvestigationRecord, deleteInvestigationRecord } = usePatientData();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCriticalResultDialogOpen, setIsCriticalResultDialogOpen] = useState(false);
  const [criticalResultsFound, setCriticalResultsFound] = useState<InvestigationTest[]>([]);
  const [recordToDelete, setRecordToDelete] = useState<InvestigationRecord | null>(null);
  const [addTestSearchQuery, setAddTestSearchQuery] = useState('');


  const investigationRecords = patient?.investigationRecords || [];
  const sortedRecords = useMemo(() => {
    return [...investigationRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [investigationRecords]);

  const form = useForm<InvestigationRecordFormData>({
    resolver: zodResolver(investigationRecordFormSchema),
    defaultValues: {
      id: undefined,
      date: new Date().toISOString().split('T')[0],
      notes: "",
      tests: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tests",
  });

  const handleOpenDialogForNew = useCallback(() => {
    form.reset({
      id: undefined,
      date: new Date().toISOString().split('T')[0],
      notes: "",
      tests: [],
    });
    setAddTestSearchQuery('');
    setIsFormDialogOpen(true);
  }, [form]);

  const handleOpenDialogForEdit = useCallback((record: InvestigationRecord) => {
    form.reset({
      ...record,
      date: format(parseISO(record.date), 'yyyy-MM-dd'),
    });
    setAddTestSearchQuery('');
    setIsFormDialogOpen(true);
  }, [form]);

  const handleSaveInvestigationRecord = useCallback(async (data: InvestigationRecordFormData) => {
    const recordToSave: InvestigationRecord = {
      id: data.id || crypto.randomUUID(),
      date: data.date,
      notes: data.notes || "",
      tests: data.tests.map(t => ({
        id: t.id,
        group: t.group,
        name: t.name,
        result: t.result,
        unit: t.unit || "",
        normalRange: t.normalRange || "",
        resultType: t.resultType || 'numeric',
        options: t.options || []
      }))
    }
    await addOrUpdateInvestigationRecord(patient.id, recordToSave);
    toast({ title: "Investigation Saved", description: `Record for ${data.date} has been saved.` });
    setIsFormDialogOpen(false);

    // Trigger refresh
    if (onDataChange) {
      onDataChange();
    }

    // Check for critical results after saving
    const criticals = recordToSave.tests.filter(isCritical);
    if (criticals.length > 0) {
      setCriticalResultsFound(criticals);
      setIsCriticalResultDialogOpen(true);
    }

  }, [patient.id, addOrUpdateInvestigationRecord, toast, onDataChange]);

  const handleDeleteRecord = useCallback(async () => {
    if (!recordToDelete) return;
    await deleteInvestigationRecord(patient.id, recordToDelete.id);
    toast({ title: "Record Deleted", description: `Investigation record from ${format(parseISO(recordToDelete.date), 'PPP')} has been deleted.`, variant: "destructive" });
    setIsDeleteDialogOpen(false);
    setRecordToDelete(null);

    // Trigger refresh
    if (onDataChange) {
      onDataChange();
    }
  }, [recordToDelete, patient.id, deleteInvestigationRecord, toast, onDataChange]);

  const addTestsFromMaster = useCallback((testIds: string[], date: string) => {
    if (isFormDialogOpen) return;
    const testsToLog = INVESTIGATION_MASTER_LIST.filter(t => testIds.includes(t.id));

    form.reset({
      id: undefined,
      date: date,
      notes: "Ordered from main investigations browser.",
      tests: testsToLog.map(t => ({
        id: t.id,
        group: t.group,
        name: t.name,
        result: "",
        unit: t.unit || "",
        normalRange: t.normalRange || "",
        resultType: t.resultType || 'numeric',
        options: t.options || [],
      })),
    });
    setAddTestSearchQuery('');
    setIsFormDialogOpen(true);
  }, [form, isFormDialogOpen]);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const testsParam = searchParams.get('tests');
    const tabParam = searchParams.get('tab');

    if (tabParam === 'investigations' && dateParam && testsParam && !isFormDialogOpen) {
      const testIds = testsParam.split(',');
      addTestsFromMaster(testIds, dateParam);
      // Clean up URL params after use
      const currentPath = window.location.pathname;
      router.replace(`${currentPath}?tab=investigations`, { scroll: false });
    }
  }, [searchParams, addTestsFromMaster, router, isFormDialogOpen]);

  const handleFrequentInvestigationToggle = useCallback((item: { type: 'test' | 'panel'; id: string }) => {
    let testIdsToToggle: string[] = [];
    if (item.type === 'test') {
      testIdsToToggle.push(item.id);
    } else {
      const panel = INVESTIGATION_PANELS.find(p => p.id === item.id);
      if (panel) {
        testIdsToToggle = panel.testIds;
      }
    }

    if (testIdsToToggle.length === 0) return;

    const testsInForm = fields.map(f => f.id);
    const shouldAdd = testIdsToToggle.some(id => !testsInForm.includes(id));

    if (shouldAdd) {
      const testsToAdd = INVESTIGATION_MASTER_LIST
        .filter(t => testIdsToToggle.includes(t.id) && !testsInForm.includes(t.id))
        .map(t => ({
          id: t.id,
          group: t.group,
          name: t.name,
          result: '',
          unit: t.unit,
          normalRange: t.normalRange,
          resultType: t.resultType,
          options: t.options,
        }));
      append(testsToAdd);
    } else {
      const testIndicesToRemove: number[] = [];
      fields.forEach((field, index) => {
        if (testIdsToToggle.includes(field.id)) {
          testIndicesToRemove.push(index);
        }
      });
      testIndicesToRemove.reverse().forEach(index => remove(index));
    }
  }, [fields, append, remove]);

  const filteredCommandItems = useMemo(() => {
    if (!addTestSearchQuery) return { panels: [], tests: [] };
    const lowercasedQuery = addTestSearchQuery.toLowerCase();

    const panels = INVESTIGATION_PANELS.filter(p => p.name.toLowerCase().includes(lowercasedQuery));
    const tests = INVESTIGATION_MASTER_LIST.filter(t => t.name.toLowerCase().includes(lowercasedQuery));

    return { panels, tests };
  }, [addTestSearchQuery]);


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
              <Notebook className="mr-2 h-5 w-5 text-primary" />
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
                  <CardDescription>Add tests or panels using the quick options or the search box below, then enter the results.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center"><Star className="mr-2 h-4 w-4 text-amber-500" />Quick Investigations</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 p-3 border rounded-md bg-muted/30">
                        {FREQUENTLY_USED_INVESTIGATIONS.map(item => {
                          const testIdsInPanel = item.type === 'panel'
                            ? INVESTIGATION_PANELS.find(p => p.id === item.id)?.testIds || []
                            : [item.id];
                          const isSelected = testIdsInPanel.length > 0 && testIdsInPanel.every(id => fields.some(f => f.id === id));

                          return (
                            <div key={`quick-${item.type}-${item.id}`} className="flex items-center space-x-2">
                              <Checkbox
                                id={`quick-chk-${item.id}`}
                                checked={isSelected}
                                onCheckedChange={() => handleFrequentInvestigationToggle(item)}
                              />
                              <Label htmlFor={`quick-chk-${item.id}`} className="font-normal cursor-pointer text-xs sm:text-sm">{item.name}</Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center mt-4"><Search className="mr-2 h-4 w-4 text-sky-500" />Add Other Tests or Panels</Label>
                      <Command shouldFilter={false} className="border rounded-md">
                        <CommandInput
                          placeholder="Search to add any test or panel from the database..."
                          value={addTestSearchQuery}
                          onValueChange={setAddTestSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          {addTestSearchQuery && filteredCommandItems.panels.length > 0 && (
                            <CommandGroup heading={<div className="flex items-center"><Package className="mr-2 h-4 w-4" />Panels</div>}>
                              {filteredCommandItems.panels.map(panel => (
                                <CommandItem
                                  key={panel.id}
                                  value={panel.id}
                                  onSelect={() => {
                                    handleFrequentInvestigationToggle({ type: 'panel', id: panel.id });
                                    setAddTestSearchQuery(''); // Clear search after selection
                                  }}
                                  onClick={() => {
                                    handleFrequentInvestigationToggle({ type: 'panel', id: panel.id });
                                    setAddTestSearchQuery('');
                                  }}
                                >
                                  {panel.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                          {addTestSearchQuery && filteredCommandItems.tests.length > 0 && (
                            <CommandGroup heading={<div className="flex items-center"><TestTube className="mr-2 h-4 w-4" />Individual Tests</div>}>
                              {filteredCommandItems.tests.map(test => (
                                <CommandItem
                                  key={test.id}
                                  value={test.id}
                                  onSelect={() => {
                                    handleFrequentInvestigationToggle({ type: 'test', id: test.id });
                                    setAddTestSearchQuery(''); // Clear search after selection
                                  }}
                                  onClick={() => {
                                    handleFrequentInvestigationToggle({ type: 'test', id: test.id });
                                    setAddTestSearchQuery('');
                                  }}
                                >
                                  {test.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    {fields.map((field, index) => {
                      const isNarrative = field.resultType === 'text';
                      const isSelect = field.resultType === 'select';
                      return (
                        <div key={field.id} className="p-3 border rounded-lg space-y-2 relative bg-muted/50">
                          <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <div>
                            <span className="font-medium">{field.name}</span> <Badge variant="secondary">{field.group}</Badge>
                          </div>

                          {isNarrative ? (
                            <FormField control={form.control} name={`tests.${index}.result`} render={({ field }) => (
                              <FormItem>
                                <FormLabel>Result / Report</FormLabel>
                                <FormControl><Textarea rows={3} placeholder="Enter report findings..." {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          ) : isSelect ? (
                            <FormField control={form.control} name={`tests.${index}.result`} render={({ field: selectField }) => (
                              <FormItem>
                                <FormLabel>Result</FormLabel>
                                <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                  <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select result..." /></SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {(field.options || []).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )} />
                          ) : ( // Numeric
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <FormField control={form.control} name={`tests.${index}.result`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Result</FormLabel>
                                  <FormControl><Input type="number" step="any" placeholder="e.g., 12.5" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl><Input placeholder="Unit" value={field.unit || ''} readOnly disabled /></FormControl>
                              </FormItem>
                              <FormItem>
                                <FormLabel>Normal Range</FormLabel>
                                <FormControl><Input placeholder="Normal Range" value={field.normalRange || ''} readOnly disabled /></FormControl>
                              </FormItem>
                            </div>
                          )}
                        </div>
                      );
                    })}
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

      <AlertDialog open={isCriticalResultDialogOpen} onOpenChange={setIsCriticalResultDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" />Critical Results Found</AlertDialogTitle>
            <AlertDialogDescription>
              The following investigation results are outside their normal range and may require immediate attention.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <ul className="space-y-2 rounded-md border p-2">
              {criticalResultsFound.map(test => (
                <li key={test.id} className="text-sm">
                  <span className="font-semibold">{test.name}:</span>
                  <span className="ml-2 font-bold text-destructive">{test.result}</span>
                  <span className="ml-1 text-xs text-muted-foreground">({test.unit})</span>
                  <span className="ml-2 text-xs text-muted-foreground">Normal: {test.normalRange}</span>
                </li>
              ))}
            </ul>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsCriticalResultDialogOpen(false)}>Acknowledge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {sortedRecords.length === 0 ? (
        <Card className="flex items-center justify-center h-40 border-dashed">
          <p className="text-muted-foreground text-center py-4">No investigation records found for this patient.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedRecords.map(record => {
            const hasCritical = record.tests.some(isCritical);
            return (
              <Card key={record.id} className="shadow-md">
                <CardHeader className={hasCritical ? "bg-red-50" : "bg-muted/30"}>
                  <CardTitle className="font-headline text-lg flex items-center justify-between">
                    <span className="flex items-center">
                      {hasCritical && <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />}
                      Investigations on: {format(parseISO(record.date), 'PPP')}
                    </span>
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
                        {record.tests.map((test: InvestigationTest, testIndex: number) => {
                          const critical = isCritical(test);
                          return (
                            <TableRow key={`${record.id}-${test.id}-${testIndex}`}>
                              <TableCell><Badge variant="outline">{test.group}</Badge></TableCell>
                              <TableCell className="font-medium">{test.name}</TableCell>
                              <TableCell className={critical ? "font-bold text-destructive" : ""}>{test.result}</TableCell>
                              <TableCell>{test.unit || 'N/A'}</TableCell>
                              <TableCell>{test.normalRange || 'N/A'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-sm">No specific tests listed for this record date.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};
