
"use client";

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const mockDataWeekly = [
  { day: "Mon", gfr: 60, creatinine: 1.2 },
  { day: "Tue", gfr: 58, creatinine: 1.3 },
  { day: "Wed", gfr: 62, creatinine: 1.1 },
  { day: "Thu", gfr: 55, creatinine: 1.4 },
  { day: "Fri", gfr: 59, creatinine: 1.2 },
  { day: "Sat", gfr: 61, creatinine: 1.1 },
  { day: "Sun", gfr: 57, creatinine: 1.3 },
];

const mockDataMonthly = [
  { month: "Jan", gfr: 65, creatinine: 1.1 },
  { month: "Feb", gfr: 62, creatinine: 1.2 },
  { month: "Mar", gfr: 60, creatinine: 1.2 },
  { month: "Apr", gfr: 58, creatinine: 1.3 },
  { month: "May", gfr: 55, creatinine: 1.4 },
  { month: "Jun", gfr: 57, creatinine: 1.3 },
];

const mockDataYearly = [
  { yearPeriod: "Q1", gfr: 70, creatinine: 1.0 },
  { yearPeriod: "Q2", gfr: 65, creatinine: 1.1 },
  { yearPeriod: "Q3", gfr: 60, creatinine: 1.2 },
  { yearPeriod: "Q4", gfr: 58, creatinine: 1.3 },
];


const chartConfig = {
  gfr: {
    label: "GFR (mL/min)",
    color: "hsl(var(--chart-1))",
  },
  creatinine: {
    label: "Creatinine (mg/dL)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface KidneyFunctionChartProps {
  period?: "weekly" | "monthly" | "yearly";
}

export function KidneyFunctionChart({ period = "weekly" }: KidneyFunctionChartProps) {
  let data;
  let xDataKey;
  switch (period) {
    case "monthly":
      data = mockDataMonthly;
      xDataKey = "month";
      break;
    case "yearly":
      data = mockDataYearly;
      xDataKey = "yearPeriod";
      break;
    case "weekly":
    default:
      data = mockDataWeekly;
      xDataKey = "day";
      break;
  }


  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey={xDataKey} 
          tickLine={false} 
          axisLine={false} 
          tickMargin={8}
          tickFormatter={(value) => value.slice(0,3)}
        />
        <YAxis 
          tickLine={false} 
          axisLine={false} 
          tickMargin={8}
          yAxisId="left"
          orientation="left"
          label={{ value: "GFR", angle: -90, position: "insideLeft", offset: -5 }}
        />
          <YAxis 
          tickLine={false} 
          axisLine={false} 
          tickMargin={8}
          yAxisId="right"
          orientation="right"
          domain={[0, 3]} // Typical range for creatinine
          label={{ value: "Creatinine", angle: 90, position: "insideRight", offset: -5 }}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent 
                      indicator="line" 
                      nameKey="name" 
                      hideLabel 
                  />}
        />
        <Legend verticalAlign="bottom" height={36} />
        <Line
          dataKey="gfr"
          type="monotone"
          stroke="var(--color-gfr)"
          strokeWidth={2}
          dot={true}
          yAxisId="left"
          name="GFR (mL/min)"
        />
        <Line
          dataKey="creatinine"
          type="monotone"
          stroke="var(--color-creatinine)"
          strokeWidth={2}
          dot={true}
          yAxisId="right"
          name="Creatinine (mg/dL)"
        />
      </LineChart>
    </ChartContainer>
  );
}
