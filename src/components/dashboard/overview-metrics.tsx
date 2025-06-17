
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, FlaskConical, AlertTriangle, TrendingUp, CalendarClock, FileText } from "lucide-react"; // Using Activity for Dialysis Sessions
import { useState, useEffect } from "react";
import { usePatientData } from "@/hooks/use-patient-data";
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton for subtitle loading

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
  const [randomIncrease, setRandomIncrease] = useState<number | null>(null);
  
  // Mock data for other metrics as per the image
  const [dialysisSessions] = useState(42);
  const [labResults] = useState(18);
  const [criticalAlerts] = useState(3);

  useEffect(() => {
    if (!patientsLoading) {
      setTotalPatients(patients.length);
      // Generate random number only on the client, after mount
      setRandomIncrease(Math.floor(Math.random() * 10) + 5);
    }
  }, [patients, patientsLoading]);

  const metrics: MetricDetail[] = [
    { 
      title: "Total Patients", 
      value: totalPatients, 
      subtitle: randomIncrease !== null ? `+${randomIncrease} this month` : undefined, 
      icon: Users,
      iconColorClass: "text-blue-500",
      borderColorClass: "border-blue-500",
      loading: patientsLoading || randomIncrease === null
    },
    { 
      title: "Dialysis Sessions", 
      value: dialysisSessions, 
      subtitle: "Today's schedule", 
      icon: Activity, // Representing dialysis machine activity
      iconColorClass: "text-green-500",
      borderColorClass: "border-green-500",
      loading: false // Assuming this data is static or loaded differently
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
    { 
      title: "Critical Alerts", 
      value: criticalAlerts, 
      subtitle: "Requires attention", 
      icon: AlertTriangle,
      iconColorClass: "text-yellow-500",
      borderColorClass: "border-yellow-500",
      loading: false
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
            {metric.loading && metric.title === "Total Patients" ? ( // Show skeleton only for value if metric is loading
                 <Skeleton className="h-8 w-1/2 rounded-md my-1" /> // Adjusted skeleton for value
            ) : (
              <div className="text-3xl font-bold">{metric.value}</div>
            )}
            
            {/* Subtitle handling */}
            {metric.title === "Total Patients" && (patientsLoading || randomIncrease === null) ? (
                <Skeleton className="h-3 w-3/4 mt-1 rounded-md" /> // Skeleton for subtitle
            ) : metric.subtitle ? (
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
            ) : (
                 <div className="h-3 mt-1"></div> // Placeholder to maintain layout if no subtitle
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
