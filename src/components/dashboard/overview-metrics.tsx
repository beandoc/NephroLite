
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, FlaskConical, Hospital } from "lucide-react"; 
import { useState, useEffect, useMemo } from "react";
import { usePatientData } from "@/hooks/use-patient-data";
import { Skeleton } from "@/components/ui/skeleton"; 
import Link from "next/link";

type MetricDetail = {
  key: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColorClass: string; 
  borderColorClass: string; 
  loading?: boolean;
  href: string;
};

export function OverviewMetrics() {
  const { patients, isLoading: patientsLoading } = usePatientData();
  const [randomIncrease, setRandomIncrease] = useState<number | null>(null);
  
  const [dialysisSessions] = useState(42); // Mock
  const [labResults] = useState(18); // Mock

  useEffect(() => {
    // This effect now only runs once on the client to generate a random number.
    if (randomIncrease === null) {
      setRandomIncrease(Math.floor(Math.random() * 10) + 5);
    }
  }, [randomIncrease]);

  const { opdPatients, ipdPatients } = useMemo(() => {
    if (patientsLoading) {
      return { opdPatients: 0, ipdPatients: 0 };
    }
    const opd = patients.filter(p => p.patientStatus === 'OPD').length;
    const ipd = patients.filter(p => p.patientStatus === 'IPD').length;
    return { opdPatients: opd, ipdPatients: ipd };
  }, [patients, patientsLoading]);


  const metrics: MetricDetail[] = [
    { 
      key: "total-opd",
      title: "Total OPD Patients", 
      value: opdPatients, 
      subtitle: (randomIncrease !== null && !patientsLoading) ? `+${randomIncrease} this month (OPD)` : undefined,
      icon: Users,
      iconColorClass: "text-blue-500",
      borderColorClass: "border-blue-500",
      loading: patientsLoading || randomIncrease === null,
      href: "/patients"
    },
    { 
      key: "total-ipd",
      title: "Total IPD Patients", 
      value: ipdPatients, 
      subtitle: "Currently Admitted", 
      icon: Hospital,
      iconColorClass: "text-red-500",
      borderColorClass: "border-red-500",
      loading: patientsLoading,
      href: "/patients"
    },
    { 
      key: "dialysis",
      title: "Dialysis Sessions", 
      value: dialysisSessions, 
      subtitle: "Today's schedule", 
      icon: Activity, 
      iconColorClass: "text-green-500",
      borderColorClass: "border-green-500",
      loading: false,
      href: "/appointments"
    },
    { 
      key: "labs",
      title: "Lab Results", 
      value: labResults, 
      subtitle: "5 need review", 
      icon: FlaskConical, 
      iconColorClass: "text-purple-500",
      borderColorClass: "border-purple-500",
      loading: false,
      href: "/investigations"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Link href={metric.href} key={metric.key} className="hover:opacity-90 transition-opacity">
            <Card 
            className={`shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${metric.borderColorClass} h-full`}
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
                
                {metric.loading && metric.title.includes("OPD") ? (
                    <Skeleton className="h-3 w-3/4 mt-1 rounded-md" />
                ) : metric.subtitle ? (
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                ) : (
                <div className="h-[1rem] mt-1"></div> 
                )}
            </CardContent>
            </Card>
        </Link>
      ))}
    </div>
  );
}

    