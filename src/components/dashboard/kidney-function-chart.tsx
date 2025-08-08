
"use client";

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

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
  
  const noData = true; // This is now a placeholder until a specific patient/group is selected.

  if (noData) {
    return (
        <div className="h-80 w-full flex items-center justify-center text-muted-foreground bg-muted/50 rounded-md">
            <p>Kidney function chart requires a patient or group to be selected.</p>
        </div>
    );
  }

  // All mock data has been removed. The following code is kept for when real data is plumbed in.
  const data: any[] = [];
  const xDataKey = "date";

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
