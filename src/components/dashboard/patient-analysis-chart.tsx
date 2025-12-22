
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { usePatientData } from "@/hooks/use-patient-data";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

type ChartDataPoint = {
  diagnosis: string;
  count: number;
  fill?: string;
};

const chartConfig = {
  count: {
    label: "Patients",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function PatientAnalysisChart() {
  const { patients, isLoading: patientsLoading } = usePatientData();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patientsLoading) {
      const diagnosisCounts: Record<string, number> = {};
      patients.forEach(patient => {
        const diagnosis = patient.clinicalProfile?.primaryDiagnosis;
        if (diagnosis) {
          diagnosisCounts[diagnosis] = (diagnosisCounts[diagnosis] || 0) + 1;
        }
      });

      const formattedData: ChartDataPoint[] = Object.entries(diagnosisCounts)
        .map(([diagnosis, count]) => ({ diagnosis, count }))
        .sort((a, b) => b.count - a.count) // Sort by count descending
        .slice(0, 5); // Take top 5 for brevity

      setChartData(formattedData);
      setIsLoading(false);
    }
  }, [patients, patientsLoading]);

  if (isLoading || patientsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Patient Analysis by Diagnosis</CardTitle>
          <CardDescription>Distribution of patients by primary diagnosis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Patient Analysis by Diagnosis</CardTitle>
          <CardDescription>Distribution of patients by primary diagnosis.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No patient data available for analysis.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Patient Analysis by Diagnosis</CardTitle>
        <CardDescription>Top 5 primary diagnoses by patient count.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis
                dataKey="diagnosis"
                type="category"
                tickLine={false}
                axisLine={false}
                width={150}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Legend />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}


