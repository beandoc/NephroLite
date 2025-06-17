
"use client";

import type { Patient, Vaccination, InvestigationRecord, InvestigationTest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, ShieldCheck, Stethoscope, FileText, Microscope, Pill, MessageSquare, CalendarDays, FlaskConical, Trash2, Eye, Edit, Copy, PlusCircle, ShieldQuestion, Cigarette, Wine, CheckSquare, TrendingUp, Link as LinkIcon, Briefcase, Notebook } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { INVESTIGATION_GROUPS } from '@/lib/constants';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


interface PatientProfileViewProps {
  patient: Patient;
}

const DetailItem = ({ label, value, icon: Icon, className }: { label: string; value?: string | string[] | null; icon?: React.ElementType, className?: string }) => (
  <div className={className}>
    <h3 className="text-sm font-medium text-muted-foreground flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2 text-primary" />}
      {label}
    </h3>
    {Array.isArray(value) ? (
      <div className="flex flex-wrap gap-1 mt-1">
        {value.length > 0 ? value.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>) : <p className="text-base text-muted-foreground italic">None</p>}
      </div>
    ) : (
      <p className="text-base">{value || 'N/A'}</p>
    )}
  </div>
);


const MockVisitHistory = ({ patientId }: { patientId: string }) => {
  const { toast } = useToast();
  const visits = [
    { id: 'v1', date: '2024-05-10', doctor: 'Dr. Anya Sharma', type: 'Routine Checkup', notes: 'BP stable, advised diet modification. Patient reports feeling well. Next follow-up in 3 months.' },
    { id: 'v2', date: '2024-02-15', doctor: 'Dr. Vikram Singh', type: 'RELAPSE', notes: 'Increased proteinuria, starting immunosuppressants.' },
    { id: 'v3', date: '2023-11-20', doctor: 'Dr. Anya Sharma', type: 'REMISSION', notes: 'Proteinuria significantly reduced, continuing current treatment.' },
    { id: 'v4', date: '2023-08-01', doctor: 'Dr. Priya Patel', type: 'CHANGED Rx', notes: 'Switched from ACEi to ARB due to cough.' },
    { id: 'v5', date: '2023-05-05', doctor: 'Dr. Rohan Gupta', type: 'LOW DRUG LEVEL', notes: 'Tacrolimus level below target, dose adjusted.' },
  ];

  const handleAddNewVisit = () => {
    toast({ title: "Feature Under Development", description: "Adding new visit records will be available soon." });
  };
  
  const handleVisitAction = (action: string, visitId: string) => {
     toast({ title: "Feature Under Development", description: `${action} functionality for visit ${visitId} is under development.` });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNewVisit}><PlusCircle className="mr-2 h-4 w-4"/>Add New Visit</Button>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {visits.map(visit => (
          <AccordionItem value={visit.id} key={visit.id} className="border-b last:border-b-0 rounded-md mb-2 shadow-sm bg-card">
            <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 text-left rounded-t-md">
              <div className="flex items-center gap-4 w-full">
                <CalendarDays className="w-5 h-5 text-primary flex-shrink-0"/>
                <div className="flex-grow">
                  <p className="font-medium">{format(new Date(visit.date), 'PPP')} - <span className="font-semibold">{visit.type}</span></p>
                  <p className="text-sm text-muted-foreground">With {visit.doctor}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4 bg-card rounded-b-md">
              <p className="text-sm text-foreground mt-2 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="font-medium">Remark: </span>
                  <span>{visit.notes || "No specific notes for this visit."}</span>
              </p>
              <div className="mt-3 pt-3 border-t flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleVisitAction('View Details', visit.id)} title="View Details (Under Development)">
                    <Eye className="w-4 h-4 mr-1"/> View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleVisitAction('Edit Visit', visit.id)} title="Edit Visit (Under Development)">
                    <Edit className="w-4 h-4 mr-1"/> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleVisitAction('Copy Visit', visit.id)} title="Copy Visit (Under Development)">
                    <Copy className="w-4 h-4 mr-1"/> Copy
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90" onClick={() => handleVisitAction('Delete Visit', visit.id)} title="Delete visit (Under Development)">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
        {visits.length === 0 && (
          <Card className="flex items-center justify-center h-32 border-dashed">
            <p className="text-muted-foreground text-center py-4">No visit history recorded.</p>
          </Card>
        )}
      </Accordion>
    </>
  );
};


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

const PatientInvestigationsTabContent = ({ patientId }: { patientId: string }) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock data for Investigation Records
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
      title: "Feature Under Development",
      description: "Saving investigation records is not yet implemented. Data logged to console.",
    });
    // Here you would typically add the new record to your state/backend
    // For now, just close the dialog and reset form
    setIsAddDialogOpen(false);
    form.reset();
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
                <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); form.reset(); }}>Cancel</Button>
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
                   {/* Placeholder for actions on the record itself */}
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


const MockDiagnosisRx = ({ patientId }: { patientId: string }) => {
  const { toast } = useToast();
   const history = [
    { id: 'd1', date: '2024-01-20', diagnosis: 'Chronic Kidney Disease Stage 3a', medication: 'Telmisartan 40mg OD, Atorvastatin 10mg OD', doctor: 'Dr. Anya Sharma' },
    { id: 'd2', date: '2023-07-15', diagnosis: 'Hypertension', medication: 'Amlodipine 5mg OD (discontinued)', doctor: 'Dr. Vikram Singh' },
  ];

  const handleAddNew = (type: string) => {
    toast({ title: "Feature Under Development", description: `Adding new ${type} will be available soon.` });
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => handleAddNew('Diagnosis')} variant="outline"><PlusCircle className="mr-2 h-4 w-4"/>Add New Diagnosis</Button>
        <Button onClick={() => handleAddNew('Medication')}><PlusCircle className="mr-2 h-4 w-4"/>Add New Medication</Button>
      </div>
      <div className="space-y-4">
        {history.map(item => (
          <Card key={item.id} className="shadow-sm">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-md font-semibold flex items-center"><Stethoscope className="w-5 h-5 mr-2 text-primary"/>{item.diagnosis}</CardTitle>
              <CardDescription>{format(new Date(item.date), 'PPP')} - Diagnosed by {item.doctor}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm font-medium flex items-center text-muted-foreground"><Pill className="w-4 h-4 mr-2 text-primary"/>Medication:</p>
              <p className="text-sm text-foreground pl-6">{item.medication}</p>
            </CardContent>
          </Card>
        ))}
        {history.length === 0 && (
         <Card className="flex items-center justify-center h-32 border-dashed">
            <p className="text-muted-foreground text-center py-4">No diagnosis or medication history found.</p>
          </Card>
        )}
      </div>
    </>
  );
};


export function PatientProfileView({ patient }: PatientProfileViewProps) {
  const { clinicalProfile } = patient;
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
        <TabsTrigger value="overview"><User className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Overview</TabsTrigger>
        <TabsTrigger value="visits"><FileText className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Visit History</TabsTrigger>
        <TabsTrigger value="investigations"><Microscope className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Investigations</TabsTrigger>
        <TabsTrigger value="diagnosis"><Pill className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Diagnosis/Rx</TabsTrigger>
        <TabsTrigger value="healthTrends"><TrendingUp className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Health Trends</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="font-headline text-xl flex items-center"><User className="w-6 h-6 mr-3 text-primary"/>Demographic Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Full Name" value={patient.name} />
              <DetailItem label="Nephro ID" value={patient.nephroId} />
              <DetailItem label="Date of Birth" value={patient.dob ? format(parseISO(patient.dob), 'PPP') : 'N/A'} />
              <DetailItem label="Age" value={patient.dob ? `${new Date().getFullYear() - parseISO(patient.dob).getFullYear()} years` : 'N/A'} />
              <DetailItem label="Gender" value={patient.gender} />
              <DetailItem label="Contact Number" value={patient.contact} />
              <DetailItem label="Email Address" value={patient.email} />
              <DetailItem label="Registration Date" value={patient.registrationDate ? format(parseISO(patient.registrationDate), 'PPP') : 'N/A'} />
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="font-headline text-xl flex items-center"><Briefcase className="w-6 h-6 mr-3 text-primary"/>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Service Name" value={patient.serviceName} />
              <DetailItem label="Service Number" value={patient.serviceNumber} />
              <DetailItem label="Rank" value={patient.rank} />
              <DetailItem label="Unit Name" value={patient.unitName} />
              <DetailItem label="Formation" value={patient.formation} />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="font-headline text-xl flex items-center"><MapPin className="w-6 h-6 mr-3 text-primary"/>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Street Address" value={patient.address.street} />
              <DetailItem label="City" value={patient.address.city} />
              <DetailItem label="State" value={patient.address.state} />
              <DetailItem label="Pincode" value={patient.address.pincode} />
              <DetailItem label="Country" value={patient.address.country || "India"} /> 
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="font-headline text-xl flex items-center"><ShieldCheck className="w-6 h-6 mr-3 text-primary"/>Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Guardian Name" value={patient.guardian.name} />
              <DetailItem label="Relation" value={patient.guardian.relation} />
              <DetailItem label="Guardian Contact" value={patient.guardian.contact} />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="font-headline text-xl flex items-center"><Stethoscope className="w-6 h-6 mr-3 text-primary"/>Clinical Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
              <DetailItem label="Primary Diagnosis" value={clinicalProfile.primaryDiagnosis} />
              <DetailItem label="Nutritional Status" value={clinicalProfile.nutritionalStatus} />
              <DetailItem label="Disability Profile" value={clinicalProfile.disability} />
              <DetailItem label="Subspeciality Follow-up" icon={ShieldQuestion} value={clinicalProfile.subspecialityFollowUp || 'NIL'} />
              <DetailItem label="Smoking Status" icon={Cigarette} value={clinicalProfile.smokingStatus || 'NIL'} />
              <DetailItem label="Alcohol Consumption" icon={Wine} value={clinicalProfile.alcoholConsumption || 'NIL'} />
              <DetailItem label="Labels" value={clinicalProfile.labels} className="lg:col-span-1" />
              <DetailItem label="Clinical Tags" value={clinicalProfile.tags} className="lg:col-span-2" />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="font-headline text-xl flex items-center"><CheckSquare className="w-6 h-6 mr-3 text-primary"/>Vaccination Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {(clinicalProfile.vaccinations && clinicalProfile.vaccinations.length > 0) ? (
                clinicalProfile.vaccinations.map((vaccination, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border-b last:border-b-0">
                    <span className="font-medium">{vaccination.name}</span>
                    <div>
                      {vaccination.administered ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Administered
                          {vaccination.date && ` on ${format(parseISO(vaccination.date), 'PPP')}`}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Administered</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No vaccination data recorded.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </TabsContent>

      <TabsContent value="visits">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Visit History</CardTitle>
            <CardDescription>Chronological record of patient consultations and visits. Click on a visit to see details.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 md:px-6">
            <MockVisitHistory patientId={patient.id} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="investigations">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Investigation Results</CardTitle>
            <CardDescription>Summary of lab reports and other diagnostic findings, grouped by date.</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientInvestigationsTabContent patientId={patient.id} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="diagnosis">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Diagnosis & Medication History</CardTitle>
            <CardDescription>Historical view of diagnoses and prescribed medications.</CardDescription>
          </CardHeader>
          <CardContent>
            <MockDiagnosisRx patientId={patient.id} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="healthTrends">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-primary"/>
              Patient Health Trends & Predictions
            </CardTitle>
            <CardDescription>
              View detailed analytics, risk predictions, and trends for this patient.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <TrendingUp className="w-16 h-16 text-primary mb-4" />
            <p className="text-lg text-center mb-4">
              Access comprehensive health trends, medication timelines, event logs, and risk predictions.
            </p>
            <Button asChild size="lg">
              <Link href={`/patients/${patient.id}/health-trends`}>
                <LinkIcon className="mr-2 h-5 w-5" /> View Detailed Health Trends
              </Link>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
