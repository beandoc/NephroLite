
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, FlaskConical, Hospital } from "lucide-react"; 
import { useState, useEffect, useMemo } from "react";
import { usePatientData } from "@/hooks/use-patient-data";
import { Skeleton } from "@/components/ui/skeleton"; 
import Link from "next/link";
import { useAppointmentData } from "@/hooks/use-appointment-data";
import { isToday, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
  const { appointments, isLoading: appointmentsLoading } = useAppointmentData();
  const { toast } = useToast();
  
  const metricsData = useMemo(() => {
    if (patientsLoading || appointmentsLoading) {
      return {
        opdPatients: 0,
        ipdPatients: 0,
        dialysisSessionsToday: 0,
        labResultsToReview: 0,
        totalLabRecords: 0,
      };
    }

    const opd = patients.filter(p => p.patientStatus === 'OPD').length;
    const ipd = patients.filter(p => p.patientStatus === 'IPD').length;
    const dialysisToday = appointments.filter(a => isToday(parseISO(a.date)) && a.type === 'Dialysis Session').length;
    const totalLabs = patients.reduce((acc, p) => acc + (p.investigationRecords?.length || 0), 0);
    
    // This is a placeholder for a real implementation of "needs review"
    const labsToReview = patients.reduce((acc, p) => {
        const critical = p.investigationRecords?.some(rec => rec.tests.some(t => {
            if (!t.result || !t.normalRange || t.normalRange === 'N/A') return false;
            const resultValue = parseFloat(t.result);
            if (isNaN(resultValue)) return false;
            const rangeMatch = t.normalRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
            if(rangeMatch) return resultValue < parseFloat(rangeMatch[1]) || resultValue > parseFloat(rangeMatch[2]);
            return false;
        }));
        return critical ? acc + 1 : acc;
    }, 0);

    return {
      opdPatients: opd,
      ipdPatients: ipd,
      dialysisSessionsToday: dialysisToday,
      labResultsToReview: labsToReview,
      totalLabRecords: totalLabs,
    };
  }, [patients, appointments, patientsLoading, appointmentsLoading]);

  const metrics: MetricDetail[] = [
    { 
      key: "total-opd",
      title: "Total OPD Patients", 
      value: metricsData.opdPatients, 
      subtitle: `${patients.length} total patients registered`,
      icon: Users,
      iconColorClass: "text-blue-500",
      borderColorClass: "border-blue-500",
      loading: patientsLoading,
      href: "/patients?status=OPD"
    },
    { 
      key: "total-ipd",
      title: "Total IPD Patients", 
      value: metricsData.ipdPatients, 
      subtitle: "Currently Admitted", 
      icon: Hospital,
      iconColorClass: "text-red-500",
      borderColorClass: "border-red-500",
      loading: patientsLoading,
      href: "/patients?status=IPD"
    },
    { 
      key: "dialysis",
      title: "Dialysis Sessions Today", 
      value: metricsData.dialysisSessionsToday, 
      subtitle: "Scheduled for today", 
      icon: Activity, 
      iconColorClass: "text-green-500",
      borderColorClass: "border-green-500",
      loading: appointmentsLoading,
      href: "/appointments"
    },
    { 
      key: "labs",
      title: "Total Lab Records", 
      value: metricsData.totalLabRecords, 
      subtitle: `${metricsData.labResultsToReview} patient(s) need review`, 
      icon: FlaskConical, 
      iconColorClass: "text-purple-500",
      borderColorClass: "border-purple-500",
      loading: patientsLoading,
      href: "/lab-results"
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
                
                {metric.loading ? (
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
