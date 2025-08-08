
"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from 'react';
import type { InvestigationRecord, Visit } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { SGLT2_INHIBITORS, ARBS, ACE_INHIBITORS, FINERENONE } from '@/lib/constants';

const chartConfig = {
  protein: {
    label: "Proteinuria (mg/day)",
    color: "hsl(var(--chart-2))",
  },
  uacr: {
    label: "Urine ACR (mg/g)",
    color: "hsl(var(--chart-1))",
  }
} satisfies ChartConfig;

const medicationCategories: Record<string, { drugs: string[], color: string }> = {
    "ACEi/ARB": { drugs: [...ARBS, ...ACE_INHIBITORS], color: "hsl(var(--chart-1))" },
    "SGLT2i": { drugs: SGLT2_INHIBITORS, color: "hsl(var(--chart-2))" },
    "Finerenone": { drugs: [FINERENONE], color: "hsl(var(--chart-4))" }
};

const CustomLegend = ({ periods }: { periods: any[] }) => (
    <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
      {periods.map(period => (
        <div key={period.name} className="flex items-center gap-1">
          <div className="w-3 h-3" style={{ backgroundColor: period.color }} />
          <span>{period.name} Period</span>
        </div>
      ))}
    </div>
);


interface ProteinuriaTrendChartProps {
  investigationRecords: InvestigationRecord[];
  medicationHistory: Visit[];
}

export function ProteinuriaTrendChart({ investigationRecords, medicationHistory }: ProteinuriaTrendChartProps) {
  
  const chartData = useMemo(() => {
    if (!investigationRecords) return [];

    const proteinTests = investigationRecords
      .flatMap(record => record.tests.map(test => ({ ...test, date: record.date })))
      .filter(test => (test.name === '24-hour Urine Protein' || test.name === 'Urine for AC Ratio (mg/gm)') && !isNaN(parseFloat(test.result)));

    const groupedByDate: Record<string, { protein?: number; uacr?: number }> = {};
    
    proteinTests.forEach(test => {
        const dateKey = format(parseISO(test.date), 'yyyy-MM-dd');
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = {};
        }
        if(test.name === '24-hour Urine Protein') groupedByDate[dateKey].protein = parseFloat(test.result);
        if(test.name === 'Urine for AC Ratio (mg/gm)') groupedByDate[dateKey].uacr = parseFloat(test.result);
    });
    
    return Object.entries(groupedByDate)
        .map(([date, values]) => ({ date, ...values }))
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
        
  }, [investigationRecords]);

  const medicationPeriods = useMemo(() => {
    const periods: { name: string, start: string, end: string, color: string }[] = [];
    const allMedications = medicationHistory
        .flatMap(visit => visit.clinicalData?.medications?.map(med => ({ med, date: visit.date })) || [])
        .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    Object.entries(medicationCategories).forEach(([categoryName, { drugs, color }]) => {
        let periodStart: string | null = null;
        for (const { med, date } of allMedications) {
            if (drugs.some(drugName => med.name.toLowerCase().includes(drugName.toLowerCase()))) {
                if (!periodStart) {
                    periodStart = format(parseISO(date), 'yyyy-MM-dd');
                }
            } else {
                if (periodStart) {
                    periods.push({ name: categoryName, start: periodStart, end: format(parseISO(date), 'yyyy-MM-dd'), color });
                    periodStart = null;
                }
            }
        }
        if (periodStart) {
           periods.push({ name: categoryName, start: periodStart, end: format(new Date(), 'yyyy-MM-dd'), color });
        }
    });
    return periods;
  }, [medicationHistory]);
  
  if (chartData.length === 0) {
    return <div className="h-80 w-full flex items-center justify-center text-muted-foreground">No Proteinuria data available to display chart.</div>
  }

  return (
    <>
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => format(parseISO(value), 'MMM yy')}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          label={{ value: "Value", angle: -90, position: "insideLeft", offset: 10 }}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
          labelFormatter={(label) => format(parseISO(label), 'PPP')}
        />
        <Legend content={<CustomLegend periods={medicationPeriods} />} verticalAlign="bottom" wrapperStyle={{paddingTop: 10}} />
        
        {medicationPeriods.map(period => (
           <ReferenceArea key={period.name} yAxisId="left" x1={period.start} x2={period.end} strokeOpacity={0.3} fill={period.color} fillOpacity={0.1} />
        ))}
        
        <Bar
          dataKey="protein"
          fill="var(--color-protein)"
          radius={4}
          name="Proteinuria (mg/day)"
        />
        <Bar
          dataKey="uacr"
          fill="var(--color-uacr)"
          radius={4}
          name="Urine ACR (mg/g)"
        />
      </BarChart>
    </ChartContainer>
    </>
  );
}
