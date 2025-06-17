
"use client";

import type { Patient, Vaccination } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, ShieldCheck, Stethoscope, FileText, Microscope, Pill, MessageSquare, CalendarDays, FlaskConical, Trash2, Eye, Edit, Copy, PlusCircle, ShieldQuestion, Cigarette, Wine, CheckSquare, TrendingUp, Link as LinkIcon, Briefcase } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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
                  <Button variant="ghost" size="sm" onClick={() => handleVisitAction('View Details', visit.id)} disabled title="View Details (Under Development)">
                    <Eye className="w-4 h-4 mr-1"/> View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleVisitAction('Edit Visit', visit.id)} disabled title="Edit Visit (Under Development)">
                    <Edit className="w-4 h-4 mr-1"/> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleVisitAction('Copy Visit', visit.id)} disabled title="Copy Visit (Under Development)">
                    <Copy className="w-4 h-4 mr-1"/> Copy
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90" onClick={() => handleVisitAction('Delete Visit', visit.id)} disabled title="Delete visit (Under Development)">
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

const MockInvestigations = ({ patientId }: { patientId: string }) => {
  const { toast } = useToast();
  const investigations = [
    { id: 'i1', date: '2024-05-01', name: 'Serum Creatinine', result: '1.8 mg/dL', normalRange: '0.6-1.2 mg/dL', status: 'High' },
    { id: 'i2', date: '2024-05-01', name: 'eGFR', result: '40 mL/min/1.73m²', normalRange: '>60 mL/min/1.73m²', status: 'Low' },
    { id: 'i3', date: '2024-02-10', name: 'Urine Albumin-to-Creatinine Ratio (UACR)', result: '150 mg/g', normalRange: '<30 mg/g', status: 'High' },
  ];

  const handleAddNewInvestigation = () => {
    toast({ title: "Feature Under Development", description: "Adding new investigation results will be available soon." });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNewInvestigation}><PlusCircle className="mr-2 h-4 w-4"/>Add New Investigation</Button>
      </div>
      <div className="space-y-4">
        {investigations.map(inv => (
          <Card key={inv.id} className="shadow-sm">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-md font-semibold flex items-center"><FlaskConical className="w-5 h-5 mr-2 text-primary"/>{inv.name}</CardTitle>
              <CardDescription>{format(new Date(inv.date), 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm pb-4">
              <div><span className="font-medium text-muted-foreground">Result:</span> {inv.result}</div>
              <div><span className="font-medium text-muted-foreground">Range:</span> {inv.normalRange}</div>
              <div>
                <span className="font-medium text-muted-foreground">Status:</span>{' '}
                <Badge variant={inv.status === 'Normal' ? 'secondary' : inv.status === 'High' ? 'destructive' : 'outline'}>
                  {inv.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {investigations.length === 0 && (
          <Card className="flex items-center justify-center h-32 border-dashed">
            <p className="text-muted-foreground text-center py-4">No investigation results found.</p>
          </Card>
        )}
      </div>
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
            <CardDescription>Summary of lab reports and other diagnostic findings.</CardDescription>
          </CardHeader>
          <CardContent>
            <MockInvestigations patientId={patient.id} />
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

