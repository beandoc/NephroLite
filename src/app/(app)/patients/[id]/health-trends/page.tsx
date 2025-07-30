
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, AlertTriangle, Heart, Activity, CalendarClock, LineChart as LineChartIcon, BarChart3 } from 'lucide-react';
import { EgfrTrendChart } from '@/components/charts/EgfrTrendChart';
import { ProteinuriaTrendChart } from '@/components/charts/ProteinuriaTrendChart';
import { MedicationTimeline } from '@/components/patients/MedicationTimeline';
import { PatientEvents } from '@/components/patients/PatientEvents';

interface PredictionCardProps {
  title: string;
  value: string;
  riskLevel: "High Risk" | "Medium Risk" | "Low Risk";
  lastEgfrDate: string;
  icon: React.ElementType;
  iconColorClass: string;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ title, value, riskLevel, lastEgfrDate, icon: Icon, iconColorClass }) => {
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
        <p className={`text-sm font-semibold ${riskLevel === "High Risk" ? "text-destructive" : riskLevel === "Medium Risk" ? "text-yellow-500" : "text-green-500"}`}>
          {riskLevel}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Last eGFR Date: {lastEgfrDate}</p>
      </CardContent>
    </Card>
  );
};

export default function PatientHealthTrendsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = typeof params.id === 'string' ? params.id : 'N/A';

  const predictionData: PredictionCardProps[] = [
    { title: "2-Year Risk of Kidney Failure (KFRE)", value: "60%", riskLevel: "High Risk", lastEgfrDate: "10/02/23", icon: AlertTriangle, iconColorClass: "text-destructive" },
    { title: "5-Year Risk of Kidney Failure (KFRE)", value: "94%", riskLevel: "High Risk", lastEgfrDate: "10/02/23", icon: AlertTriangle, iconColorClass: "text-destructive" },
    { title: "2-Year Risk of Cardiovascular Disease", value: "40%", riskLevel: "Medium Risk", lastEgfrDate: "10/02/23", icon: Heart, iconColorClass: "text-red-500" },
  ];

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Patient Health Trends"
        description={`Advanced analytics and trends for patient ID: ${patientId}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Button>
        }
      />

      <Card className="mb-6 mt-4">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary"/>Risk Predictions</CardTitle>
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
            <EgfrTrendChart />
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Albuminuria / 24h Protein Trend</CardTitle>
            <CardDescription>Visualizing changes in proteinuria, with medication periods highlighted.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
             <ProteinuriaTrendChart />
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
            <MedicationTimeline />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><CalendarClock className="mr-2 h-5 w-5 text-primary"/>Patient Events</CardTitle>
            <CardDescription>Timeline of significant patient events.</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientEvents />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
