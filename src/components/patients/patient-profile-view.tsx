
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Microscope, Pill, FileText, TrendingUp, FileClock, FolderOpen } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { DemographicsCard } from './cards/DemographicsCard';
import { ClinicalProfileCard } from './cards/ClinicalProfileCard';
import { ServiceDetailsCard } from './cards/ServiceDetailsCard';
import { PatientVisitsTabContent } from './profile-tabs/PatientVisitsTabContent';
import { PatientInvestigationsTabContent } from './profile-tabs/PatientInvestigationsTabContent';
import { PatientDiagnosisRx } from './profile-tabs/PatientDiagnosisRx';
import { HealthTrendsTabContent } from './profile-tabs/HealthTrendsTabContent';
import { PatientDocumentsTabContent } from './profile-tabs/PatientDocumentsTabContent';
import { useSearchParams } from 'next/navigation';
import { PatientInterventionsTabContent } from './profile-tabs/PatientInterventionsTabContent';
import { PatientPortalAccess } from '@/components/patient/patient-portal-access';

interface PatientProfileViewProps {
  patient: Patient;
}

export function PatientProfileView({ patient }: PatientProfileViewProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('overview');
    }
  }, [searchParams]);

  const hasServiceDetails = !!(patient.serviceName || patient.serviceNumber || patient.rank || patient.unitName || patient.formation);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 mb-6 h-auto">
        <TabsTrigger value="overview"><User className="w-4 h-4 mr-2 sm:hidden md:inline-block" />Overview</TabsTrigger>
        <TabsTrigger value="visits"><FileText className="w-4 h-4 mr-2 sm:hidden md:inline-block" />Visit History</TabsTrigger>
        <TabsTrigger value="interventions"><FileClock className="w-4 h-4 mr-2 sm:hidden md:inline-block" />Interventions</TabsTrigger>
        <TabsTrigger value="investigations"><Microscope className="w-4 h-4 mr-2 sm:hidden md:inline-block" />Investigations</TabsTrigger>
        <TabsTrigger value="diagnosis"><Pill className="w-4 h-4 mr-2 sm:hidden md:inline-block" />Diagnosis/Rx</TabsTrigger>
        <TabsTrigger value="documents"><FolderOpen className="w-4 h-4 mr-2 sm:hidden md:inline-block" />Documents</TabsTrigger>
        <TabsTrigger value="healthTrends"><TrendingUp className="w-4 h-4 mr-2 sm:hidden md:inline-block" />Trends</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <DemographicsCard patient={patient} />
        {hasServiceDetails && <ServiceDetailsCard patient={patient} />}
        <ClinicalProfileCard patient={patient} />
        <PatientPortalAccess
          patientId={patient.id}
          patientName={`${patient.firstName} ${patient.lastName}`}
          patientEmail={patient.email}
        />
      </TabsContent>

      <TabsContent value="visits">
        <PatientVisitsTabContent patient={patient} />
      </TabsContent>

      <TabsContent value="interventions">
        <PatientInterventionsTabContent patient={patient} />
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

      <TabsContent value="documents">
        <PatientDocumentsTabContent patientId={patient.id} />
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
