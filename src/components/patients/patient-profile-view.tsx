
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, ShieldCheck, Stethoscope, Users, FileText, Microscope, Pill, MessageSquare, CalendarDays, FlaskConical, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

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
  const visits = [
    { id: 'v1', date: '2024-05-10', doctor: 'Dr. Anya Sharma', type: 'Routine Checkup', notes: 'BP stable, advised diet modification. Patient reports feeling well. Next follow-up in 3 months.' },
    { id: 'v2', date: '2024-02-15', doctor: 'Dr. Vikram Singh', type: 'Follow-up', notes: 'Reviewed lab reports, adjusted medication (Telmisartan increased to 80mg). Creatinine slightly elevated.' },
    { id: 'v3', date: '2023-11-20', doctor: 'Dr. Anya Sharma', type: 'Consultation', notes: 'Discussed new symptoms (ankle swelling), ordered UACR and KFT. Advised low salt diet.' },
  ];
  return (
    <Accordion type="single" collapsible className="w-full">
      {visits.map(visit => (
        <AccordionItem value={visit.id} key={visit.id} className="border-b last:border-b-0">
          <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 text-left">
            <div className="flex items-center gap-4 w-full">
              <CalendarDays className="w-5 h-5 text-primary flex-shrink-0"/>
              <div className="flex-grow">
                <p className="font-medium">{format(new Date(visit.date), 'PPP')} - {visit.type}</p>
                <p className="text-sm text-muted-foreground">With {visit.doctor}</p>
              </div>
              {/* Placeholder for delete visit button */}
              <Button variant="ghost" size="icon" disabled className="ml-auto opacity-50 cursor-not-allowed" title="Delete visit (feature under development)">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-0 pb-4 bg-muted/20 rounded-b-md">
            <p className="text-sm text-foreground mt-2 flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-1 text-primary shrink-0" />
                <span>{visit.notes || "No specific notes for this visit."}</span>
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
       {visits.length === 0 && (
        <p className="text-muted-foreground text-center py-4">No visit history recorded.</p>
      )}
      <CardDescription className="text-xs text-center pt-2 px-4">Note: Deleting individual visit records is currently under development.</CardDescription>
    </Accordion>
  );
};

const MockInvestigations = ({ patientId }: { patientId: string }) => {
  const investigations = [
    { id: 'i1', date: '2024-05-01', name: 'Serum Creatinine', result: '1.8 mg/dL', normalRange: '0.6-1.2 mg/dL', status: 'High' },
    { id: 'i2', date: '2024-05-01', name: 'eGFR', result: '40 mL/min/1.73m²', normalRange: '>60 mL/min/1.73m²', status: 'Low' },
    { id: 'i3', date: '2024-02-10', name: 'Urine Albumin-to-Creatinine Ratio (UACR)', result: '150 mg/g', normalRange: '<30 mg/g', status: 'High' },
  ];
  return (
     <div className="space-y-4">
      {investigations.map(inv => (
        <Card key={inv.id} className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium flex items-center"><FlaskConical className="w-5 h-5 mr-2 text-primary"/>{inv.name}</CardTitle>
            <CardDescription>{format(new Date(inv.date), 'PPP')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-sm">
            <div><span className="font-semibold">Result:</span> {inv.result}</div>
            <div><span className="font-semibold">Range:</span> {inv.normalRange}</div>
            <div><span className="font-semibold">Status:</span> <Badge variant={inv.status === 'Normal' ? 'default' : 'destructive'}>{inv.status}</Badge></div>
          </CardContent>
        </Card>
      ))}
       {investigations.length === 0 && (
        <p className="text-muted-foreground text-center py-4">No investigation results found.</p>
      )}
    </div>
  );
};

const MockDiagnosisRx = ({ patientId }: { patientId: string }) => {
   const history = [
    { id: 'd1', date: '2024-01-20', diagnosis: 'Chronic Kidney Disease Stage 3a', medication: 'Telmisartan 40mg OD, Atorvastatin 10mg OD', doctor: 'Dr. Anya Sharma' },
    { id: 'd2', date: '2023-07-15', diagnosis: 'Hypertension', medication: 'Amlodipine 5mg OD (discontinued)', doctor: 'Dr. Vikram Singh' },
  ];
  return (
    <div className="space-y-4">
      {history.map(item => (
        <Card key={item.id} className="shadow-sm">
           <CardHeader className="pb-3">
            <CardTitle className="text-md font-medium flex items-center"><Pill className="w-5 h-5 mr-2 text-primary"/>{item.diagnosis}</CardTitle>
            <CardDescription>{format(new Date(item.date), 'PPP')} - Prescribed by {item.doctor}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold">Medication:</p>
            <p className="text-sm text-muted-foreground">{item.medication}</p>
          </CardContent>
        </Card>
      ))}
      {history.length === 0 && (
        <p className="text-muted-foreground text-center py-4">No diagnosis or medication history found.</p>
      )}
    </div>
  );
};


export function PatientProfileView({ patient }: PatientProfileViewProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
        <TabsTrigger value="overview"><User className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Overview</TabsTrigger>
        <TabsTrigger value="visits"><FileText className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Visit History</TabsTrigger>
        <TabsTrigger value="investigations"><Microscope className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Investigations</TabsTrigger>
        <TabsTrigger value="diagnosis"><Pill className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Diagnosis/Rx</TabsTrigger>
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
              <DetailItem label="Date of Birth" value={patient.dob ? format(new Date(patient.dob), 'PPP') : 'N/A'} />
              <DetailItem label="Age" value={patient.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} years` : 'N/A'} />
              <DetailItem label="Gender" value={patient.gender} />
              <DetailItem label="Contact Number" value={patient.contact} />
              <DetailItem label="Email Address" value={patient.email} />
              <DetailItem label="Registration Date" value={patient.registrationDate ? format(new Date(patient.registrationDate), 'PPP') : 'N/A'} />
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
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Primary Diagnosis" value={patient.clinicalProfile.primaryDiagnosis} />
              <DetailItem label="Labels" value={patient.clinicalProfile.labels} />
              <DetailItem label="Clinical Tags" value={patient.clinicalProfile.tags} />
              <DetailItem label="Nutritional Status" value={patient.clinicalProfile.nutritionalStatus} />
              <DetailItem label="Disability Profile" value={patient.clinicalProfile.disability} />
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
          <CardContent className="px-0 sm:px-6">
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
    </Tabs>
  );
}

