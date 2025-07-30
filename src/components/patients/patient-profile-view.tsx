
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Microscope, Pill, FileText, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { DemographicsCard } from './cards/DemographicsCard';
import { ClinicalProfileCard } from './cards/ClinicalProfileCard';
import { ServiceDetailsCard } from './cards/ServiceDetailsCard';
import { PatientVisitsTabContent } from './profile-tabs/PatientVisitsTabContent';
import { PatientInvestigationsTabContent } from './profile-tabs/PatientInvestigationsTabContent';
import { MockDiagnosisRx } from './profile-tabs/MockDiagnosisRx';
import { HealthTrendsTabContent } from './profile-tabs/HealthTrendsTabContent';
import { usePatientData } from '@/hooks/use-patient-data';
import { useSearchParams } from 'next/navigation';


interface PatientProfileViewProps {
  patient: Patient;
}

export function PatientProfileView({ patient: initialPatient }: PatientProfileViewProps) {
  const { getPatientById } = usePatientData();
  const searchParams = useSearchParams();
  
  // Use state to manage the patient data, which can be updated by child components
  const [patient, setPatient] = useState(initialPatient);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

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
  
  // Update active tab if URL param changes
  React.useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const hasServiceDetails = patient.serviceName || patient.serviceNumber || patient.rank || patient.unitName || patient.formation;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
        <TabsTrigger value="overview"><User className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Overview</TabsTrigger>
        <TabsTrigger value="visits"><FileText className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Visit History</TabsTrigger>
        <TabsTrigger value="investigations"><Microscope className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Investigations</TabsTrigger>
        <TabsTrigger value="diagnosis"><Pill className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Diagnosis/Rx</TabsTrigger>
        <TabsTrigger value="healthTrends"><TrendingUp className="w-4 h-4 mr-2 sm:hidden md:inline-block"/>Health Trends</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <DemographicsCard patient={patient} onUpdate={refreshPatientData} />
        {hasServiceDetails && <ServiceDetailsCard patient={patient} />}
        <ClinicalProfileCard patient={patient} />
      </TabsContent>

      <TabsContent value="visits">
        <PatientVisitsTabContent patient={patient} />
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
