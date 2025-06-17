
"use client";

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Mock data for eGFR trends. In a real app, this would come from props or fetched data.
const mockDataMonthlyEgfr = [
  { month: "Jan", egfr: 75 },
  { month: "Feb", egfr: 72 },
  { month: "Mar", egfr: 70 },
  { month: "Apr", egfr: 68 },
  { month: "May", egfr: 65 },
  { month: "Jun", egfr: 67 },
  { month: "Jul", egfr: 64 },
  { month: "Aug", egfr: 60 },
  { month: "Sep", egfr: 58 },
  { month: "Oct", egfr: 55 },
  { month: "Nov", egfr: 57 },
  { month: "Dec", egfr: 53 },
];

const chartConfig = {
  egfr: {
    label: "eGFR (mL/min/1.73m²)",
    color: "hsl(var(--chart-3))", // Using chart-3 (dark teal from theme)
  },
} satisfies ChartConfig;

interface EgfrTrendChartProps {
  // Props to pass actual data in the future
  // data?: Array<{ month: string; egfr: number | null }>;
}

export function EgfrTrendChart({}: EgfrTrendChartProps) {
  // For now, use mock data
  const data = mockDataMonthlyEgfr;

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <AreaChart
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
          domain={[0, 'dataMax + 10']} // Adjust domain as needed
          label={{ value: "eGFR", angle: -90, position: "insideLeft", offset: -5 }}
        />
        <Tooltip
          cursor={true}
          content={<ChartTooltipContent indicator="dot" hideLabel />}
        />
        <Legend verticalAlign="top" height={36} />
        <defs>
          <linearGradient id="fillEgfrChart3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-egfr)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--color-egfr)" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="egfr"
          stroke="var(--color-egfr)"
          fillOpacity={1}
          fill="url(#fillEgfrChart3)"
          strokeWidth={2}
          dot={{
            r: 4,
            strokeWidth: 2,
          }}
          activeDot={{
            r: 6,
            strokeWidth: 2,
          }}
          name="eGFR (mL/min/1.73m²)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
