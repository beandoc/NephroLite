
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Microscope, Pill, FileText, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { DemographicsCard } from './cards/DemographicsCard';
import { ClinicalProfileCard } from './cards/ClinicalProfileCard';
import { ServiceDetailsCard } from './cards/ServiceDetailsCard';
import { MockVisitHistory } from './profile-tabs/MockVisitHistory';
import { PatientInvestigationsTabContent } from './profile-tabs/PatientInvestigationsTabContent';
import { MockDiagnosisRx } from './profile-tabs/MockDiagnosisRx';
import { HealthTrendsTabContent } from './profile-tabs/HealthTrendsTabContent';
import { usePatientData } from '@/hooks/use-patient-data';


interface PatientProfileViewProps {
  patient: Patient;
}

export function PatientProfileView({ patient: initialPatient }: PatientProfileViewProps) {
  const { getPatientById } = usePatientData();
  
  // Use state to manage the patient data, which can be updated by child components
  const [patient, setPatient] = useState(initialPatient);

  // Function to refresh patient data from the hook
  const refreshPatientData = () => {
    const freshPatientData = getPatientById(initialPatient.id);
    if (freshPatientData) {
      setPatient(freshPatientData);
    }
  };

  // Re-sync state if the initial prop changes
  React.useEffect(() => {
    setPatient(initialPatient);
  }, [initialPatient]);

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
          <DemographicsCard patient={patient} onUpdate={refreshPatientData} />
          { (patient.serviceName || patient.serviceNumber || patient.rank || patient.unitName || patient.formation) && (
            <ServiceDetailsCard patient={patient} />
          )}
          <ClinicalProfileCard patient={patient} />
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
          <HealthTrendsTabContent patient={patient} />
      </TabsContent>
    </Tabs>
  );
}
