
"use client";

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from 'react';
import type { InvestigationRecord, Patient, Visit } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { SGLT2_INHIBITORS, ARBS, ACE_INHIBITORS, FINERENONE } from '@/lib/constants';
import { calculateEgfrFromCreatinine } from "@/lib/kfre-calculator"; 

const chartConfig = {
  egfr: {
    label: "eGFR",
    color: "hsl(var(--chart-1))",
  },
  creatinine: {
      label: "Creatinine",
      color: "hsl(var(--chart-2))"
  }
} satisfies ChartConfig;

const medicationCategories: Record<string, { drugs: string[], color: string }> = {
    "ACEi/ARB": { drugs: [...ARBS, ...ACE_INHIBITORS], color: "hsla(210, 90%, 55%, 0.1)" },
    "SGLT2i": { drugs: SGLT2_INHIBITORS, color: "hsla(0, 70%, 60%, 0.1)" },
    "Finerenone": { drugs: [FINERENONE], color: "hsla(43, 74%, 66%, 0.1)" }
};

const CustomLegend = ({ periods }: { periods: any[] }) => (
    <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
      {periods.map((period, index) => (
        <div key={`${period.name}-${index}`} className="flex items-center gap-1">
          <div className="w-3 h-3" style={{ backgroundColor: period.color.replace('0.1', '1') }} />
          <span>{period.name} Period</span>
        </div>
      ))}
    </div>
);


interface EgfrTrendChartProps {
  patient: Patient;
}

export function EgfrTrendChart({ patient }: EgfrTrendChartProps) {
  
  const chartData = useMemo(() => {
    if (!patient.investigationRecords) return [];

    const allTests = patient.investigationRecords
      .flatMap(record => record.tests.map(test => ({ ...test, date: record.date })))
      .filter(test => (test.name === 'eGFR' || test.name === 'Serum Creatinine') && !isNaN(parseFloat(test.result)));

    const groupedByDate: Record<string, { egfr?: number; creatinine?: number; egfr_calculated?: boolean }> = {};
    const age = new Date().getFullYear() - parseISO(patient.dob).getFullYear();

    allTests.forEach(test => {
        const dateKey = format(parseISO(test.date), 'yyyy-MM-dd');
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = {};
        }
        if(test.name === 'eGFR') groupedByDate[dateKey].egfr = parseFloat(test.result);
        if(test.name === 'Serum Creatinine') groupedByDate[dateKey].creatinine = parseFloat(test.result);
    });

    // Post-process to calculate eGFR if not present
    Object.keys(groupedByDate).forEach(dateKey => {
        const entry = groupedByDate[dateKey];
        if (entry.egfr === undefined && entry.creatinine) {
            const calculated = calculateEgfrFromCreatinine(entry.creatinine, age, patient.gender);
            if (calculated !== null) {
                entry.egfr = calculated;
                entry.egfr_calculated = true;
            }
        }
    });
    
    return Object.entries(groupedByDate)
        .filter(([date, values]) => values.egfr !== undefined) // Only include points with an eGFR value (logged or calculated)
        .map(([date, values]) => ({ date, ...values }))
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
        
  }, [patient]);
  
  const medicationPeriods = useMemo(() => {
    const periods: { name: string, start: string, end: string, color: string }[] = [];
    const allMedications = patient.visits
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
  }, [patient.visits]);


  if (chartData.length === 0) {
    return <div className="h-80 w-full flex items-center justify-center text-muted-foreground">No eGFR or Creatinine data available to display chart.</div>
  }

  return (
    <>
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
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
          domain={[0, 'dataMax + 15']}
          label={{ value: "eGFR (mL/min)", angle: -90, position: "insideLeft" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[0, 'dataMax + 1']}
          label={{ value: "Creatinine (mg/dL)", angle: 90, position: "insideRight" }}
        />
        <Tooltip
          cursor={true}
          content={
            <ChartTooltipContent 
                indicator="dot" 
                labelFormatter={(label) => format(parseISO(label), 'PPP')} 
                formatter={(value, name, item) => {
                    const { payload } = item;
                    if (name === "egfr") {
                       return (
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: 'hsl(var(--chart-1))'}} />
                            <div>
                                <div className="font-semibold">{Number(value).toFixed(0)} <span className="text-muted-foreground text-xs">mL/min</span></div>
                                <div className="text-xs text-muted-foreground">eGFR {payload.egfr_calculated && "(Calculated)"}</div>
                            </div>
                        </div>
                       );
                    }
                    if (name === "creatinine" && value) {
                        return (
                             <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: 'hsl(var(--chart-2))'}} />
                                <div>
                                    <div className="font-semibold">{Number(value).toFixed(2)} <span className="text-muted-foreground text-xs">mg/dL</span></div>
                                    <div className="text-xs text-muted-foreground">Creatinine</div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                }}
            />
          }
        />
        <Legend content={<CustomLegend periods={medicationPeriods} />} verticalAlign="bottom" wrapperStyle={{paddingTop: 10}} />
        <defs>
          <linearGradient id="fillEgfr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-egfr)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--color-egfr)" stopOpacity={0.1}/>
          </linearGradient>
           <linearGradient id="fillCreatinine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-creatinine)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--color-creatinine)" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        
        {medicationPeriods.map((period, index) => (
           <ReferenceArea key={`${period.name}-${index}`} yAxisId="left" x1={period.start} x2={period.end} strokeOpacity={0.3} fill={period.color} />
        ))}
        
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="egfr"
          stroke="hsl(var(--chart-1))"
          fill="url(#fillEgfr)"
          strokeWidth={2.5}
          dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
         <Area
          yAxisId="right"
          type="monotone"
          dataKey="creatinine"
          stroke="hsl(var(--chart-2))"
          fill="url(#fillCreatinine)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          dot={{ r: 3, strokeWidth: 1, fill: 'hsl(var(--background))' }}
          activeDot={{ r: 5, strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
    </>
  );
}
