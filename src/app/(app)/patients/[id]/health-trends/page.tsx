
"use client";

import { useParams, useRouter } from 'next/navigation';
import { usePatientData } from '@/hooks/use-patient-data';
import { useAuth } from '@/context/auth-provider';
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
import { useMemo, useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { calculateKfre, calculateEgfrFromCreatinine } from '@/lib/kfre-calculator';
import { calculatePreventRisk } from '@/lib/prevent-calculator';
import type { PreventInput } from '@/lib/prevent-calculator';
import type { Patient } from '@/lib/types';

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

const getPreventRiskLevel = (value: number | null): PredictionCardProps['riskLevel'] => {
  if (value === null) return "N/A";
  if (value > 7.5) return "High Risk";
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
  const { isLoading: dataLoading } = usePatientData();
  const { user } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);

  // Fetch patient data directly from Firestore to avoid global state issues
  useEffect(() => {
    if (!patientId || !user) {
      setPatient(null);
      setIsLoadingPatient(false);
      return;
    }

    setIsLoadingPatient(true);
    import('@/lib/firestore-helpers')
      .then(({ getPatientWithSubcollections }) =>
        getPatientWithSubcollections(user.uid, patientId)
      )
      .then((fetchedPatient) => {
        console.log('📊 [Health Trends] Fetched patient directly:', fetchedPatient);
        console.log('📊 [Health Trends] Investigation records count:', fetchedPatient?.investigationRecords?.length || 0);
        setPatient(fetchedPatient);
        setIsLoadingPatient(false);
      })
      .catch((error) => {
        console.error('❌ [Health Trends] Error fetching patient:', error);
        setPatient(null);
        setIsLoadingPatient(false);
      });
  }, [patientId, user]);

  const latestLabData = useMemo(() => {
    console.log('🏥 [Health Trends] Patient data:', patient);
    console.log('🏥 [Health Trends] Investigation records:', patient?.investigationRecords);

    if (!patient?.investigationRecords) {
      console.log('❌ [Health Trends] No investigation records found');
      return { eGFR: null, UACR: null, totalCholesterol: null, hdlCholesterol: null, systolicBP: null, date: undefined };
    }

    console.log('✅ [Health Trends] Found', patient.investigationRecords.length, 'investigation records');

    // Helper to get latest from investigations
    const allTests = patient.investigationRecords
      .filter(rec => rec.date) // Skip records without dates
      .flatMap(rec => rec.tests.map(test => ({ ...test, date: rec.date })))
      .sort((a, b) => parseISO(b.date!).getTime() - parseISO(a.date!).getTime());

    const getLatestFromInvestigations = (name: string): { value: number; date: string } | null => {
      const test = allTests.find(t => t.name === name && t.result && !isNaN(parseFloat(t.result)));
      if (test && test.result) {
        return { value: parseFloat(test.result), date: test.date };
      }
      return null;
    };

    // Helper to get latest from visits
    const getLatestFromVisits = (field: keyof import('@/lib/types').ClinicalVisitData): { value: number; date: string } | null => {
      const visit = patient.visits
        .filter(v => v.clinicalData && v.clinicalData[field] && !isNaN(parseFloat(v.clinicalData[field] as string)))
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0];

      if (visit && visit.clinicalData) {
        return { value: parseFloat(visit.clinicalData[field] as string), date: visit.date };
      }
      return null;
    };

    const getLatestCombined = (invName: string, visitField: keyof import('@/lib/types').ClinicalVisitData | null): { value: number; date: string } | null => {
      const fromInv = getLatestFromInvestigations(invName);
      const fromVisit = visitField ? getLatestFromVisits(visitField) : null;

      if (!fromInv) return fromVisit;
      if (!fromVisit) return fromInv;

      // Return the more recent one
      return parseISO(fromVisit.date).getTime() > parseISO(fromInv.date).getTime() ? fromVisit : fromInv;
    };

    // 1. eGFR
    let latestEgfr = getLatestFromInvestigations('eGFR'); // Check explicit eGFR in labs

    // If no explicit eGFR, calculate from Creatinine (checking both sources)
    if (!latestEgfr) {
      const latestCreatinine = getLatestCombined('Serum Creatinine', 'serumCreatinine');
      if (latestCreatinine) {
        const age = new Date().getFullYear() - parseISO(patient.dob).getFullYear();
        const calculated = calculateEgfrFromCreatinine(latestCreatinine.value, age, patient.gender);
        if (calculated) {
          latestEgfr = { value: calculated, date: latestCreatinine.date };
        }
      }
    } else {
      // If we found eGFR in labs, check if we have a newer Creatinine in visits that we could calculate from
      const latestCreatinineFromVisit = getLatestFromVisits('serumCreatinine');
      if (latestCreatinineFromVisit && parseISO(latestCreatinineFromVisit.date).getTime() > parseISO(latestEgfr.date).getTime()) {
        const age = new Date().getFullYear() - parseISO(patient.dob).getFullYear();
        const calculated = calculateEgfrFromCreatinine(latestCreatinineFromVisit.value, age, patient.gender);
        if (calculated) {
          latestEgfr = { value: calculated, date: latestCreatinineFromVisit.date };
        }
      }
    }

    const latestUacr = getLatestCombined('Urine for AC Ratio (mg/gm)', 'uacr');
    const latestTotalCholesterol = getLatestCombined('Total Cholesterol', 'totalCholesterol');
    const latestHdlCholesterol = getLatestCombined('HDL Cholesterol', 'hdlCholesterol');
    const latestSystolicBP = getLatestFromVisits('systolicBP');

    const allDates = [
      latestEgfr?.date,
      latestUacr?.date,
      latestTotalCholesterol?.date,
      latestHdlCholesterol?.date,
      latestSystolicBP?.date
    ].filter(Boolean) as string[];

    const latestDate = allDates.length > 0 ? allDates.sort((a, b) => parseISO(b).getTime() - parseISO(a).getTime())[0] : undefined;

    return {
      eGFR: latestEgfr?.value || null,
      UACR: latestUacr?.value || null,
      totalCholesterol: latestTotalCholesterol?.value || null,
      hdlCholesterol: latestHdlCholesterol?.value || null,
      systolicBP: latestSystolicBP?.value || null,
      date: latestDate,
    }
  }, [patient]);


  const kfreScores = useMemo(() => {
    console.log('🧮 [KFRE] Starting calculation...');
    console.log('🧮 [KFRE] Patient:', patient);
    console.log('🧮 [KFRE] Latest Lab Data:', latestLabData);
    console.log('🧮 [KFRE] eGFR:', latestLabData.eGFR);
    console.log('🧮 [KFRE] UACR:', latestLabData.UACR);

    if (!patient) {
      console.log('❌ [KFRE] No patient data');
      return { twoYear: null, fiveYear: null };
    }

    if (!latestLabData.eGFR) {
      console.log('❌ [KFRE] Missing eGFR');
      return { twoYear: null, fiveYear: null };
    }

    if (!latestLabData.UACR) {
      console.log('❌ [KFRE] Missing UACR');
      return { twoYear: null, fiveYear: null };
    }

    const age = new Date().getFullYear() - parseISO(patient.dob).getFullYear();

    const kfreInput = {
      age: age,
      sex: patient.gender,
      egfr: latestLabData.eGFR,
      uacr: latestLabData.UACR,
    };

    console.log('✅ [KFRE] Input data:', kfreInput);
    const result = calculateKfre(kfreInput);
    console.log('✅ [KFRE] Result:', result);

    return result;
  }, [patient, latestLabData]);

  const preventScore = useMemo(() => {
    try {
      console.log('🩺 [PREVENT] Starting calculation...');
      console.log('🩺 [PREVENT] Patient:', patient);
      console.log('🩺 [PREVENT] Latest Lab Data:', latestLabData);

      if (!patient) {
        console.log('❌ [PREVENT] No patient data');
        return null;
      }

      if (!latestLabData.eGFR) {
        console.log('❌ [PREVENT] Missing eGFR:', latestLabData.eGFR);
        return null;
      }

      if (!latestLabData.totalCholesterol) {
        console.log('❌ [PREVENT] Missing totalCholesterol:', latestLabData.totalCholesterol);
        return null;
      }

      if (!latestLabData.hdlCholesterol) {
        console.log('❌ [PREVENT] Missing hdlCholesterol:', latestLabData.hdlCholesterol);
        return null;
      }

      if (!latestLabData.systolicBP) {
        console.log('❌ [PREVENT] Missing systolicBP:', latestLabData.systolicBP);
        return null;
      }

      const age = new Date().getFullYear() - parseISO(patient.dob).getFullYear();
      const lastVisit = patient.visits && patient.visits.length > 0
        ? patient.visits.sort((a: any, b: any) => parseISO(b.date || '').getTime() - parseISO(a.date || '').getTime())[0]
        : null;
      const bmi = lastVisit?.clinicalData?.bmi ? parseFloat(lastVisit.clinicalData.bmi) : null;

      console.log('🩺 [PREVENT] BMI from last visit:', bmi);

      if (!bmi) {
        console.log('❌ [PREVENT] Missing BMI');
        return null;
      }

      const preventInput: PreventInput = {
        age: age,
        sex: patient.gender,
        totalCholesterol: latestLabData.totalCholesterol,
        hdlCholesterol: latestLabData.hdlCholesterol,
        systolicBP: latestLabData.systolicBP,
        isSmoker: patient.clinicalProfile.smokingStatus === 'Yes',
        hasDiabetes: patient.clinicalProfile.hasDiabetes === true,
        onAntiHypertensiveMedication: patient.clinicalProfile.onAntiHypertensiveMedication === true,
        onStatinMedication: patient.clinicalProfile.onLipidLoweringMedication === true,
        egfr: latestLabData.eGFR,
        bmi: bmi,
      };

      console.log('✅ [PREVENT] Input data:', preventInput);
      const result = calculatePreventRisk(preventInput);
      console.log('✅ [PREVENT] Result:', result);

      return result;
    } catch (error) {
      console.error('❌ [PREVENT] Calculation error:', error);
      return null;
    }
  }, [patient, latestLabData]);

  const getKfreMissingData = (): string[] => {
    const missing = [];

    // Check if eGFR is too high for KFRE calculation
    if (latestLabData.eGFR && latestLabData.eGFR >= 60) {
      missing.push("eGFR ≥60 (KFRE only for eGFR <60)");
      return missing;
    }

    if (!latestLabData.eGFR) missing.push("eGFR");
    if (!latestLabData.UACR) missing.push("UACR");
    return missing;
  }

  const getPreventMissingData = (): string[] => {
    const missing = [];
    if (!latestLabData.eGFR) missing.push("eGFR");
    if (!latestLabData.totalCholesterol) missing.push("Total Cholesterol");
    if (!latestLabData.hdlCholesterol) missing.push("HDL Cholesterol");
    if (!latestLabData.systolicBP) missing.push("Latest SBP");
    if (!patient?.visits?.[0]?.clinicalData?.bmi) missing.push("Latest BMI");
    return missing;
  }

  const predictionData: PredictionCardProps[] = [
    {
      title: "2-Year Risk of Kidney Failure (KFRE)",
      value: kfreScores.twoYear !== null ? `${kfreScores.twoYear.toFixed(1)}%` : "N/A",
      riskLevel: getRiskLevel(kfreScores.twoYear),
      lastDataDate: latestLabData.date,
      missingData: getKfreMissingData(),
      icon: AlertTriangle,
      iconColorClass: "text-destructive"
    },
    {
      title: "5-Year Risk of Kidney Failure (KFRE)",
      value: kfreScores.fiveYear !== null ? `${kfreScores.fiveYear.toFixed(1)}%` : "N/A",
      riskLevel: getRiskLevel(kfreScores.fiveYear),
      lastDataDate: latestLabData.date,
      missingData: getKfreMissingData(),
      icon: AlertTriangle,
      iconColorClass: "text-destructive"
    },
    {
      title: "10-Year ASCVD Risk (PREVENT)",
      value: preventScore?.tenYearRisk !== null && preventScore?.tenYearRisk !== undefined ? `${preventScore.tenYearRisk.toFixed(1)}%` : "N/A",
      riskLevel: getPreventRiskLevel(preventScore?.tenYearRisk ?? null),
      lastDataDate: latestLabData.date,
      missingData: getPreventMissingData(),
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

  const patientFullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ');

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title={`Health Trends for ${patientFullName}`}
        description={`Advanced analytics for patient ID: ${patient.nephroId}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Button>
        }
      />

      <Card className="mb-6 mt-4">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Risk Predictions</CardTitle>
          <CardDescription>Risk scores are calculated based on the latest available lab data and clinical information.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictionData.map(data => <PredictionCard key={data.title} {...data} />)}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><LineChartIcon className="mr-2 h-5 w-5 text-primary" />eGFR Trend</CardTitle>
            <CardDescription>Chart showing eGFR values over time with medication periods highlighted.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <EgfrTrendChart patient={patient} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Albuminuria/ 24 hr Urine protein Trend</CardTitle>
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
            <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary" />Medications Timeline</CardTitle>
            <CardDescription>Visual representation of key medication history.</CardDescription>
          </CardHeader>
          <CardContent>
            <MedicationTimeline visits={patient.visits || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><CalendarClock className="mr-2 h-5 w-5 text-primary" />Patient Events</CardTitle>
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
