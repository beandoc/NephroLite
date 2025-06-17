
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, FlaskConical, AlertTriangle, TrendingUp, CalendarClock, FileText, Hospital, Building } from "lucide-react"; 
import { useState, useEffect } from "react";
import { usePatientData } from "@/hooks/use-patient-data";
import { Skeleton } from "@/components/ui/skeleton"; 

type MetricDetail = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColorClass: string; 
  borderColorClass: string; 
  loading?: boolean;
};

export function OverviewMetrics() {
  const { patients, isLoading: patientsLoading } = usePatientData();
  const [opdPatients, setOpdPatients] = useState(0);
  const [ipdPatients, setIpdPatients] = useState(0);
  const [randomIncrease, setRandomIncrease] = useState<number | null>(null);
  
  const [dialysisSessions] = useState(42); // Mock
  const [labResults] = useState(18); // Mock
  const [criticalAlerts] = useState(3); // Mock

  useEffect(() => {
    if (!patientsLoading) {
      setOpdPatients(patients.filter(p => p.patientStatus === 'OPD').length);
      setIpdPatients(patients.filter(p => p.patientStatus === 'IPD').length);
      if (randomIncrease === null) { // Generate only once on client mount
        setRandomIncrease(Math.floor(Math.random() * 10) + 5);
      }
    }
  }, [patients, patientsLoading, randomIncrease]);

  const metrics: MetricDetail[] = [
    { 
      title: "Total OPD Patients", 
      value: opdPatients, 
      subtitle: (randomIncrease !== null && !patientsLoading) ? `+${randomIncrease} this month (OPD)` : undefined,
      icon: Users,
      iconColorClass: "text-blue-500",
      borderColorClass: "border-blue-500",
      loading: patientsLoading || randomIncrease === null
    },
    { 
      title: "Total IPD Patients", 
      value: ipdPatients, 
      subtitle: "Currently Admitted", 
      icon: Hospital,
      iconColorClass: "text-red-500",
      borderColorClass: "border-red-500",
      loading: patientsLoading
    },
    { 
      title: "Dialysis Sessions", 
      value: dialysisSessions, 
      subtitle: "Today's schedule", 
      icon: Activity, 
      iconColorClass: "text-green-500",
      borderColorClass: "border-green-500",
      loading: false
    },
    { 
      title: "Lab Results", 
      value: labResults, 
      subtitle: "5 need review", 
      icon: FlaskConical, 
      iconColorClass: "text-purple-500",
      borderColorClass: "border-purple-500",
      loading: false 
    },
    // { // This was critical alerts, can be re-added if needed.
    //   title: "Critical Alerts", 
    //   value: criticalAlerts, 
    //   subtitle: "Requires attention", 
    //   icon: AlertTriangle,
    //   iconColorClass: "text-yellow-500",
    //   borderColorClass: "border-yellow-500",
    //   loading: false
    // },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card 
          key={metric.title} 
          className={`shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${metric.borderColorClass}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-headline">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-5 w-5 ${metric.iconColorClass}`} />
          </CardHeader>
          <CardContent>
            {metric.loading ? (
                 <Skeleton className="h-8 w-1/2 rounded-md my-1" />
            ) : (
              <div className="text-3xl font-bold">{metric.value}</div>
            )}
            
            {metric.loading && metric.title === "Total OPD Patients" ? (
                <Skeleton className="h-3 w-3/4 mt-1 rounded-md" />
            ) : metric.subtitle ? (
              <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
            ) : (
              <div className="h-3 mt-1"></div> 
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
