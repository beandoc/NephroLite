
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { INVESTIGATION_GROUPS } from '@/lib/constants';
import type { InvestigationRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Notebook, Edit } from 'lucide-react';

interface PatientInvestigationsTabContentProps {
  patientId: string;
}

const investigationRecordFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  testGroup: z.string().min(1, "Test group is required"),
  testName: z.string().min(1, "Test name is required"),
  testResult: z.string().min(1, "Result is required"),
  testUnit: z.string().optional(),
  testNormalRange: z.string().optional(),
});
type InvestigationRecordFormData = z.infer<typeof investigationRecordFormSchema>;

export const PatientInvestigationsTabContent = ({ patientId }: PatientInvestigationsTabContentProps) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const mockInvestigationRecords: InvestigationRecord[] = [
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
  ];
  
  const sortedRecords = [...mockInvestigationRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const form = useForm<InvestigationRecordFormData>({
    resolver: zodResolver(investigationRecordFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: "",
      testGroup: "",
      testName: "",
      testResult: "",
      testUnit: "",
      testNormalRange: "",
    },
  });

  const handleSaveInvestigationRecord = (data: InvestigationRecordFormData) => {
    console.log("Form data (to be saved):", data);
    toast({
      title: "Investigation Added (Mock)",
      description: `Test "${data.testName}" on ${data.date} logged. Full saving functionality is under development.`,
    });
    setIsAddDialogOpen(false);
    form.reset({ 
        date: new Date().toISOString().split('T')[0],
        notes: "", 
        testGroup: "", 
        testName: "", 
        testResult: "", 
        testUnit: "", 
        testNormalRange: "" 
    });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Add New Investigation Record</Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center"><Notebook className="mr-2 h-5 w-5 text-primary"/>Add New Investigation Record</DialogTitle>
            <DialogDescription>
              Enter the details for the set of investigations performed on a specific date.
              Note: This form currently supports adding one test per record for demonstration. A full system would allow multiple tests.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveInvestigationRecord)} className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
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
                  <FormControl><Textarea placeholder="Any overall notes for this set of investigations" {...field} rows={2} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Card className="pt-2">
                <CardHeader className="pb-2 pt-2"><CardTitle className="text-md font-semibold">Test Entry</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <FormField control={form.control} name="testGroup" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {INVESTIGATION_GROUPS.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="testName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Hemoglobin, Serum Creatinine" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="testResult" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Result</FormLabel>
                        <FormControl><Input placeholder="e.g., 12.5, Positive" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="testUnit" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit (Optional)</FormLabel>
                        <FormControl><Input placeholder="e.g., g/dL, mg/dL" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="testNormalRange" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Normal Range (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., 13.5-17.5" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); form.reset({ date: new Date().toISOString().split('T')[0], notes: "", testGroup: "", testName: "", testResult: "", testUnit: "", testNormalRange: "" }); }}>Cancel</Button>
                <Button type="submit">Save Record (Mock)</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                  <Button variant="ghost" size="sm" onClick={() => toast({title: "Edit/Delete Record (WIP)"})} className="text-xs">
                    <Edit className="h-3 w-3 mr-1"/> Edit/Delete Record
                  </Button>
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
