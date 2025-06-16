
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, FlaskConical, AlertTriangle, TrendingUp, CalendarClock, FileText } from "lucide-react"; // Using Activity for Dialysis Sessions
import { useState, useEffect } from "react";
import { usePatientData } from "@/hooks/use-patient-data";

// Define a type for individual metric for clarity
type MetricDetail = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColorClass: string; // Tailwind class for icon color
  borderColorClass: string; // Tailwind class for left border color
  loading?: boolean;
};

export function OverviewMetrics() {
  const { patients, isLoading: patientsLoading } = usePatientData();
  const [totalPatients, setTotalPatients] = useState(0);
  
  // Mock data for other metrics as per the image
  const [dialysisSessions] = useState(42);
  const [labResults] = useState(18);
  const [criticalAlerts] = useState(3);

  useEffect(() => {
    if (!patientsLoading) {
      setTotalPatients(patients.length);
    }
  }, [patients, patientsLoading]);

  const metrics: MetricDetail[] = [
    { 
      title: "Total Patients", 
      value: totalPatients, 
      subtitle: `+${Math.floor(Math.random()*10) + 5} this month`, // Dynamic random subtitle
      icon: Users,
      iconColorClass: "text-blue-500",
      borderColorClass: "border-blue-500",
      loading: patientsLoading 
    },
    { 
      title: "Dialysis Sessions", 
      value: dialysisSessions, 
      subtitle: "Today's schedule", 
      icon: Activity, // Representing dialysis machine activity
      iconColorClass: "text-green-500",
      borderColorClass: "border-green-500",
      loading: patientsLoading 
    },
    { 
      title: "Lab Results", 
      value: labResults, 
      subtitle: "5 need review", 
      icon: FlaskConical, 
      iconColorClass: "text-purple-500",
      borderColorClass: "border-purple-500",
      loading: patientsLoading 
    },
    { 
      title: "Critical Alerts", 
      value: criticalAlerts, 
      subtitle: "Requires attention", 
      icon: AlertTriangle,
      iconColorClass: "text-yellow-500",
      borderColorClass: "border-yellow-500",
      loading: patientsLoading 
    },
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
                 <div className="h-8 w-1/2 bg-muted animate-pulse rounded-md"></div>
            ) : (
              <div className="text-3xl font-bold">{metric.value}</div>
            )}
            {metric.subtitle && <p className="text-xs text-muted-foreground">{metric.subtitle}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
