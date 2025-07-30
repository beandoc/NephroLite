
"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Mock data for eGFR trends. In a real app, this would come from props or fetched data.
const mockDataMonthlyProteinuria = [
  { month: "Jan", protein: 300 },
  { month: "Feb", protein: 450 },
  { month: "Mar", protein: 400 },
  { month: "Apr", protein: 500 },
  { month: "May", protein: 350 },
  { month: "Jun", protein: 250 },
  { month: "Jul", protein: 200 },
  { month: "Aug", protein: 180 },
  { month: "Sep", protein: 150 },
  { month: "Oct", protein: 120 },
  { month: "Nov", protein: 100 },
  { month: "Dec", protein: 90 },
];

const mockMedicationPeriods = [
    { name: "ACEi/ARB", start: "Mar", end: "Dec", color: "rgba(3, 105, 161, 0.1)" }, 
    { name: "SGLT2i", start: "Jun", end: "Sep", color: "rgba(5, 150, 105, 0.1)" }, 
];

const chartConfig = {
  protein: {
    label: "Proteinuria (mg/day)",
    color: "hsl(var(--chart-2))", // Using chart-2 (reddish)
  },
} satisfies ChartConfig;

const CustomLegend = () => (
    <div className="flex justify-center items-center gap-4 mt-2 text-sm">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3" style={{ backgroundColor: 'rgba(3, 105, 161, 0.4)' }} />
        <span>ACEi/ARB Period</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3" style={{ backgroundColor: 'rgba(5, 150, 105, 0.4)' }} />
        <span>SGLT2i Period</span>
      </div>
    </div>
);


interface ProteinuriaTrendChartProps {
  // Props to pass actual data in the future
}

export function ProteinuriaTrendChart({}: ProteinuriaTrendChartProps) {
  const data = mockDataMonthlyProteinuria;

  return (
    <>
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          label={{ value: "Proteinuria", angle: -90, position: "insideLeft", offset: -5 }}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" hideLabel />}
        />
        <Legend verticalAlign="top" height={36} />
        
        {/* Render medication periods as reference areas */}
        {mockMedicationPeriods.map(period => (
           <ReferenceArea key={period.name} x1={period.start} x2={period.end} strokeOpacity={0.3} fill={period.color} />
        ))}
        
        <Bar
          dataKey="protein"
          fill="var(--color-protein)"
          radius={4}
          name="Proteinuria (mg/day)"
        />
      </BarChart>
    </ChartContainer>
    <CustomLegend />
    </>
  );
}

