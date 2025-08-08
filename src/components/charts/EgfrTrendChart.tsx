
"use client";

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from 'react';
import type { InvestigationRecord, Visit } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { SGLT2_INHIBITORS, ARBS, ACE_INHIBITORS, FINERENONE } from '@/lib/constants';

const chartConfig = {
  egfr: {
    label: "eGFR",
    color: "hsl(var(--chart-3))",
  },
  creatinine: {
      label: "Creatinine",
      color: "hsl(var(--chart-2))"
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


interface EgfrTrendChartProps {
  investigationRecords: InvestigationRecord[];
  medicationHistory: Visit[];
}

export function EgfrTrendChart({ investigationRecords, medicationHistory }: EgfrTrendChartProps) {
  
  const chartData = useMemo(() => {
    if (!investigationRecords) return [];

    const egfrAndCreatinineTests = investigationRecords
      .flatMap(record => record.tests.map(test => ({ ...test, date: record.date })))
      .filter(test => (test.name === 'eGFR' || test.name === 'Serum Creatinine') && !isNaN(parseFloat(test.result)));

    const groupedByDate: Record<string, { egfr?: number; creatinine?: number }> = {};
    
    egfrAndCreatinineTests.forEach(test => {
        const dateKey = format(parseISO(test.date), 'yyyy-MM-dd');
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = {};
        }
        if(test.name === 'eGFR') groupedByDate[dateKey].egfr = parseFloat(test.result);
        if(test.name === 'Serum Creatinine') groupedByDate[dateKey].creatinine = parseFloat(test.result);
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
    return <div className="h-80 w-full flex items-center justify-center text-muted-foreground">No eGFR or Creatinine data available to display chart.</div>
  }

  return (
    <>
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <AreaChart
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
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[0, 'dataMax + 10']}
          label={{ value: "eGFR", angle: -90, position: "insideLeft", offset: 10 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[0, 'dataMax + 1']}
          label={{ value: "Creatinine", angle: 90, position: "insideRight", offset: 10 }}
        />
        <Tooltip
          cursor={true}
          content={<ChartTooltipContent indicator="dot" />}
          formatter={(value, name) => {
              if (name === 'egfr') return [`${(value as number).toFixed(0)} mL/min`, 'eGFR'];
              if (name === 'creatinine') return [`${(value as number).toFixed(2)} mg/dL`, 'Creatinine'];
              return [value, name];
          }}
          labelFormatter={(label) => format(parseISO(label), 'PPP')}
        />
        <Legend content={<CustomLegend periods={medicationPeriods} />} verticalAlign="bottom" wrapperStyle={{paddingTop: 10}} />
        <defs>
          <linearGradient id="fillEgfrChart3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-egfr)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--color-egfr)" stopOpacity={0.1}/>
          </linearGradient>
           <linearGradient id="fillCreatinineChart2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-creatinine)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--color-creatinine)" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        
        {medicationPeriods.map(period => (
           <ReferenceArea key={period.name} yAxisId="left" x1={period.start} x2={period.end} strokeOpacity={0.3} fill={period.color} fillOpacity={0.1} />
        ))}
        
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="egfr"
          stroke="var(--color-egfr)"
          fillOpacity={1}
          fill="url(#fillEgfrChart3)"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
          name="eGFR (mL/min/1.73m²)"
        />
         <Area
          yAxisId="right"
          type="monotone"
          dataKey="creatinine"
          stroke="var(--color-creatinine)"
          fillOpacity={1}
          fill="url(#fillCreatinineChart2)"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
          name="Creatinine (mg/dL)"
        />
      </AreaChart>
    </ChartContainer>
    </>
  );
}
