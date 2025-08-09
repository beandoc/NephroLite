
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Microscope, Pill, FileText, TrendingUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { DemographicsCard } from './cards/DemographicsCard';
import { ClinicalProfileCard } from './cards/ClinicalProfileCard';
import { ServiceDetailsCard } from './cards/ServiceDetailsCard';
import { PatientVisitsTabContent } from './profile-tabs/PatientVisitsTabContent';
import { PatientInvestigationsTabContent } from './profile-tabs/PatientInvestigationsTabContent';
import { PatientDiagnosisRx } from './profile-tabs/PatientDiagnosisRx';
import { HealthTrendsTabContent } from './profile-tabs/HealthTrendsTabContent';
import { usePatientData } from '@/hooks/use-patient-data';
import { useSearchParams } from 'next/navigation';


interface PatientProfileViewProps {
  patient: Patient;
}

export function PatientProfileView({ patient: initialPatient }: PatientProfileViewProps) {
  const { currentPatient } = usePatientData();
  const searchParams = useSearchParams();
  
  // Use currentPatient to ensure we always have the latest data from the reactive hook
  const patient = currentPatient(initialPatient.id) || initialPatient;
  
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // This effect runs on the client, preventing hydration mismatch
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('overview');
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
        <DemographicsCard patient={patient} />
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
            <CardDescription>Historical view of diagnoses and prescribed medications from all visits.</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientDiagnosisRx patient={patient} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="healthTrends">
        <Card className="shadow-md">
          <CardContent className="p-0">
             <HealthTrendsTabContent patient={patient} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
