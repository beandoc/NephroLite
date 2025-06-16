
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, AlertTriangle, Activity } from "lucide-react";
import { usePatientData } from "@/hooks/use-patient-data"; // Assuming appointments are not yet managed by a hook
import { useState, useEffect } from "react";

export function OverviewMetrics() {
  const { patients, isLoading: patientsLoading } = usePatientData();
  const [totalPatients, setTotalPatients] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState(0); // Placeholder
  const [criticalAlerts, setCriticalAlerts] = useState(0); // Placeholder

  useEffect(() => {
    if (!patientsLoading) {
      setTotalPatients(patients.length);
      // Simulate fetching other metrics
      setUpcomingAppointments(Math.floor(Math.random() * 20) + 5); // Random number between 5 and 24
      setCriticalAlerts(Math.floor(Math.random() * 5)); // Random number between 0 and 4
    }
  }, [patients, patientsLoading]);

  const metrics = [
    { title: "Total Patients", value: totalPatients, icon: Users, loading: patientsLoading },
    { title: "Upcoming Appointments", value: upcomingAppointments, icon: CalendarCheck, loading: patientsLoading },
    { title: "Critical Alerts", value: criticalAlerts, icon: AlertTriangle, loading: patientsLoading },
    { title: "Active Dialysis Patients", value: Math.floor(totalPatients * 0.3), icon: Activity, loading: patientsLoading }, // Example derived metric
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-headline">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metric.loading ? (
                 <div className="h-8 w-1/2 bg-muted animate-pulse rounded-md"></div>
            ) : (
              <div className="text-3xl font-bold">{metric.value}</div>
            )}
            {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
