
"use client";

import { useParams, useRouter } from 'next/navigation';
import { usePatientData } from '@/hooks/use-patient-data';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, AlertTriangle, Heart, Activity, CalendarClock, LineChart as LineChartIcon, BarChart3, Loader2 } from 'lucide-react';
import { EgfrTrendChart } from '@/components/charts/EgfrTrendChart';
import { ProteinuriaTrendChart } from '@/components/charts/ProteinuriaTrendChart';
import { MedicationTimeline } from '@/components/patients/MedicationTimeline';
import { PatientEvents } from '@/components/patients/PatientEvents';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { calculateKfre } from '@/lib/kfre-calculator';

interface PredictionCardProps {
  title: string;
  value: string;
  riskLevel: "High Risk" | "Medium Risk" | "Low Risk" | "N/A";
  lastDataDate?: string;
  missingData?: string[];
  icon: React.ElementType;
  iconColorClass: string;
}

const getRiskLevel = (value: number | null): PredictionCardProps['riskLevel'] => {
    if (value === null) return "N/A";
    if (value > 20) return "High Risk";
    if (value > 5) return "Medium Risk";
    return "Low Risk";
};


const PredictionCard: React.FC<PredictionCardProps> = ({ title, value, riskLevel, lastDataDate, missingData, icon: Icon, iconColorClass }) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className={`h-6 w-6 ${iconColorClass}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
        <p className={`text-sm font-semibold ${riskLevel === "High Risk" ? "text-destructive" : riskLevel === "Medium Risk" ? "text-yellow-500" : riskLevel === "Low Risk" ? "text-green-500" : ""}`}>
          {riskLevel}
        </p>
         {missingData && missingData.length > 0 ? (
            <p className="text-xs text-destructive mt-1">
                Missing: {missingData.join(', ')}
            </p>
         ) : (
            <p className="text-xs text-muted-foreground mt-1">
            {lastDataDate ? `Last Data: ${lastDataDate}` : "Data needed for prediction."}
            </p>
         )}
      </CardContent>
    </Card>
  );
};

export default function PatientHealthTrendsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = typeof params.id === 'string' ? params.id : undefined;
  const { getPatientById, isLoading: dataLoading } = usePatientData();
  
  const patient = useMemo(() => {
    if (!patientId || dataLoading) return null;
    return getPatientById(patientId);
  }, [patientId, getPatientById, dataLoading]);
  
  const latestLabData = useMemo(() => {
    if (!patient?.investigationRecords) return { eGFR: null, UACR: null, date: null };
    
    const allTests = patient.investigationRecords
      .flatMap(rec => rec.tests.map(test => ({ ...test, date: rec.date })))
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
      
    const latestEgfrTest = allTests.find(t => t.name === 'eGFR' && t.result);
    const latestUacrTest = allTests.find(t => t.name === 'Urine for AC Ratio (mg/gm)' && t.result);
    
    const date = latestEgfrTest?.date || latestUacrTest?.date;

    return {
        eGFR: latestEgfrTest ? parseFloat(latestEgfrTest.result) : null,
        UACR: latestUacrTest ? parseFloat(latestUacrTest.result) : null,
        date: date ? format(parseISO(date), 'PPP') : undefined,
    }
  }, [patient]);


  const kfreScores = useMemo(() => {
    if (!patient || !latestLabData.eGFR || !latestLabData.UACR) {
        return { twoYear: null, fiveYear: null };
    }
    
    const age = new Date().getFullYear() - parseISO(patient.dob).getFullYear();

    return calculateKfre({
        age: age,
        sex: patient.gender,
        egfr: latestLabData.eGFR,
        uacr: latestLabData.UACR,
    });
  }, [patient, latestLabData]);
  
  const getMissingData = (): string[] => {
      const missing = [];
      if (!latestLabData.eGFR) missing.push("eGFR");
      if (!latestLabData.UACR) missing.push("UACR");
      return missing;
  }

  const predictionData: PredictionCardProps[] = [
    { 
        title: "2-Year Risk of Kidney Failure (KFRE)", 
        value: kfreScores.twoYear !== null ? `${kfreScores.twoYear.toFixed(2)}%` : "N/A", 
        riskLevel: getRiskLevel(kfreScores.twoYear), 
        lastDataDate: latestLabData.date, 
        missingData: getMissingData(),
        icon: AlertTriangle, 
        iconColorClass: "text-destructive" 
    },
    { 
        title: "5-Year Risk of Kidney Failure (KFRE)", 
        value: kfreScores.fiveYear !== null ? `${kfreScores.fiveYear.toFixed(2)}%` : "N/A", 
        riskLevel: getRiskLevel(kfreScores.fiveYear), 
        lastDataDate: latestLabData.date,
        missingData: getMissingData(),
        icon: AlertTriangle, 
        iconColorClass: "text-destructive" 
    },
    { 
        title: "2-Year Risk of Cardiovascular Disease", 
        value: "N/A", 
        riskLevel: "N/A", 
        lastDataDate: latestLabData.date, 
        missingData: ["Model Not Implemented"],
        icon: Heart, 
        iconColorClass: "text-red-500" 
    },
  ];

  if (dataLoading) {
    return (
        <div className="container mx-auto py-2">
            <PageHeader title="Loading Health Trends..." description="Fetching patient data..." />
            <div className="space-y-6 mt-6">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
      </div>
    );
  }

  if (!patient) {
     return (
      <div className="container mx-auto py-2">
        <PageHeader title="Patient Not Found" description="Could not find health trends for the specified patient." />
        <Button variant="outline" onClick={() => router.push('/patients')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients List
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title={`Health Trends for ${patient.name}`}
        description={`Advanced analytics for patient ID: ${patient.nephroId}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Button>
        }
      />

      <Card className="mb-6 mt-4">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary"/>Risk Predictions</CardTitle>
          <CardDescription>Calculated using the 8-variable Kidney Failure Risk Equation (Tangri et al., 2016). Requires latest eGFR and UACR values.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictionData.map(data => <PredictionCard key={data.title} {...data} />)}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><LineChartIcon className="mr-2 h-5 w-5 text-primary"/>eGFR Trend</CardTitle>
            <CardDescription>Chart showing eGFR values over time with medication periods highlighted.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <EgfrTrendChart patient={patient} />
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Albuminuria / 24h Protein Trend</CardTitle>
            <CardDescription>Visualizing changes in proteinuria, with medication periods highlighted.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
             <ProteinuriaTrendChart investigationRecords={patient.investigationRecords || []} medicationHistory={patient.visits || []} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Medications Timeline</CardTitle>
            <CardDescription>Visual representation of key medication history.</CardDescription>
          </CardHeader>
          <CardContent>
            <MedicationTimeline visits={patient.visits || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><CalendarClock className="mr-2 h-5 w-5 text-primary"/>Patient Events</CardTitle>
            <CardDescription>Timeline of significant patient events.</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientEvents patient={patient} />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
