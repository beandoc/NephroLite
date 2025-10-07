
"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useAppointmentData } from "@/hooks/use-appointment-data";
import { usePatientData } from "@/hooks/use-patient-data";
import { useMemo } from "react";
import { format, parseISO, startOfWeek, getWeek, getMonth, getYear } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "../ui/skeleton";


const chartConfig = {
  newVisits: {
    label: "New Patients",
    color: "hsl(var(--chart-1))",
  },
  followUpVisits: {
    label: "Follow-up Patients",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const processVisitData = (appointments: any[], patients: any[], period: 'weekly' | 'monthly') => {
    if (patients.length === 0 || appointments.length === 0) return [];

    // Create a map of patientId to their first visit date for efficient lookup
    const firstVisitDateByPatient = new Map<string, string>();
    patients.forEach(patient => {
        const patientAppointments = appointments
            .filter(a => a.patientId === patient.id)
            .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
        
        if(patientAppointments.length > 0) {
            firstVisitDateByPatient.set(patient.id, patientAppointments[0].date);
        }
    });

    const aggregatedData: { [key: string]: { date: string, newVisits: number, followUpVisits: number } } = {};

    appointments.forEach(appointment => {
        try {
            const visitDate = parseISO(appointment.date);
            let key: string;
            let formattedDate: string;

            if (period === 'weekly') {
                const weekStart = startOfWeek(visitDate, { weekStartsOn: 1 });
                const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });
                const year = getYear(weekStart);
                key = `${year}-W${String(weekNumber).padStart(2, '0')}`;
                formattedDate = `Week ${weekNumber}, ${year}`;
            } else { // monthly
                key = format(visitDate, 'yyyy-MM');
                formattedDate = format(visitDate, 'MMM yyyy');
            }

            if (!aggregatedData[key]) {
                aggregatedData[key] = { date: formattedDate, newVisits: 0, followUpVisits: 0 };
            }

            const firstVisitDate = firstVisitDateByPatient.get(appointment.patientId);
            const isNewPatientVisit = firstVisitDate === appointment.date;
            
            if (isNewPatientVisit) {
                aggregatedData[key].newVisits += 1;
            } else {
                aggregatedData[key].followUpVisits += 1;
            }
        } catch(e) {
            // Ignore appointments with invalid dates
        }
    });

    return Object.values(aggregatedData).sort((a,b) => {
        if(period === 'weekly') {
            const [aYear, aWeek] = a.date.replace('Week ', '').split(', ');
            const [bYear, bWeek] = b.date.replace('Week ', '').split(', ');
            if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
            return parseInt(aWeek) - parseInt(bWeek);
        } else {
            // For monthly, we can parse the date for sorting
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
    });
};


export function PatientVisitsChart() {
  const { appointments, isLoading: appointmentsLoading } = useAppointmentData();
  const { patients, isLoading: patientsLoading } = usePatientData();
  
  const weeklyData = useMemo(() => processVisitData(appointments, patients, 'weekly'), [appointments, patients]);
  const monthlyData = useMemo(() => processVisitData(appointments, patients, 'monthly'), [appointments, patients]);

  const isLoading = appointmentsLoading || patientsLoading;
  
  const renderChart = (data: any[]) => {
    if (data.length === 0) {
      return (
        <div className="h-80 w-full flex items-center justify-center text-muted-foreground bg-muted/50 rounded-md">
            <p>No visit data available to display chart.</p>
        </div>
      );
    }

    return (
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8}
            tickFormatter={(value) => value.startsWith('Week') ? value.split(',')[0] : value}
           />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="newVisits" stackId="a" fill="var(--color-newVisits)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="followUpVisits" stackId="a" fill="var(--color-followUpVisits)" radius={[4, 4, 0, 0]}/>
        </BarChart>
      </ChartContainer>
    );
  };
  
  if(isLoading){
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Patient Visit Trends</CardTitle>
        <CardDescription>New vs. Follow-up patient visits over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-none">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly" className="mt-4">
            {renderChart(weeklyData)}
          </TabsContent>
          <TabsContent value="monthly" className="mt-4">
            {renderChart(monthlyData)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
