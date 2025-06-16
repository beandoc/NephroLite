
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, ShieldCheck, Stethoscope, Users, FileText, Microscope, Pill } from 'lucide-react';
import { format } from 'date-fns';

interface PatientProfileViewProps {
  patient: Patient;
}

const DetailItem = ({ label, value, icon: Icon }: { label: string; value?: string | string[] | null; icon?: React.ElementType }) => (
  <div>
    <h3 className="text-sm font-medium text-muted-foreground flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2 text-primary" />}
      {label}
    </h3>
    {Array.isArray(value) ? (
      <div className="flex flex-wrap gap-1 mt-1">
        {value.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
      </div>
    ) : (
      <p className="text-base">{value || 'N/A'}</p>
    )}
  </div>
);

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
            <CardDescription>Detailed records of past patient visits.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">Visit history feature coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="investigations">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Investigation Results</CardTitle>
            <CardDescription>Lab reports and other investigation findings.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">Investigation results feature coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="diagnosis">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Diagnosis & Medication</CardTitle>
            <CardDescription>History of diagnoses and prescribed medications.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">Diagnosis and medication management feature coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
