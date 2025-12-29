"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface LabResult {
    id: string;
    dateRecorded: any;
    testsPerformed: Array<{
        name: string;
        result: string;
        unit: string;
        referenceRange?: string;
    }>;
}

interface LabTrendsChartProps {
    investigations: LabResult[];
}

// Key markers for CKD/Dialysis patients
const KEY_MARKERS = {
    eGFR: {
        name: 'eGFR',
        unit: 'mL/min/1.73m²',
        normal: { min: 90, max: 120 },
        color: '#10b981', // green
    },
    creatinine: {
        name: 'Creatinine',
        unit: 'mg/dL',
        normal: { min: 0.7, max: 1.3 },
        color: '#3b82f6', // blue
    },
    hemoglobin: {
        name: 'Hemoglobin',
        unit: 'g/dL',
        normal: { min: 12, max: 16 },
        color: '#ef4444', // red
    },
    albumin: {
        name: 'Albumin',
        unit: 'g/dL',
        normal: { min: 3.5, max: 5.5 },
        color: '#f59e0b', // amber
    },
    potassium: {
        name: 'Potassium',
        unit: 'mEq/L',
        normal: { min: 3.5, max: 5.0 },
        color: '#8b5cf6', // purple
    },
};

export function LabTrendsChart({ investigations }: LabTrendsChartProps) {
    // Extract trend data for all markers
    const trendData = useMemo(() => {
        if (!investigations || investigations.length === 0) return [];

        return investigations
            .map(record => {
                const date = record.dateRecorded?.toDate
                    ? format(record.dateRecorded.toDate(), 'MMM dd, yyyy')
                    : 'Unknown';

                const dataPoint: any = { date };

                // Extract values for each marker
                Object.keys(KEY_MARKERS).forEach(markerKey => {
                    const marker = KEY_MARKERS[markerKey as keyof typeof KEY_MARKERS];
                    const test = record.testsPerformed?.find(t =>
                        t.name.toLowerCase().includes(marker.name.toLowerCase())
                    );

                    if (test) {
                        const value = parseFloat(test.result);
                        if (!isNaN(value)) {
                            dataPoint[markerKey] = value;
                        }
                    }
                });

                return dataPoint;
            })
            .filter(point => Object.keys(point).length > 1) // Has at least date + one value
            .reverse(); // Oldest first for chart
    }, [investigations]);

    // Calculate trend direction for a marker
    const getTrend = (markerKey: string) => {
        const values = trendData
            .map(d => d[markerKey])
            .filter(v => v !== undefined);

        if (values.length < 2) return 'stable';

        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const change = ((lastValue - firstValue) / firstValue) * 100;

        if (Math.abs(change) < 5) return 'stable';
        return change > 0 ? 'improving' : 'declining';
    };

    const getLatestValue = (markerKey: string) => {
        const values = trendData
            .map(d => d[markerKey])
            .filter(v => v !== undefined);

        return values.length > 0 ? values[values.length - 1] : null;
    };

    const renderMarkerChart = (markerKey: string) => {
        const marker = KEY_MARKERS[markerKey as keyof typeof KEY_MARKERS];
        const trend = getTrend(markerKey);
        const latestValue = getLatestValue(markerKey);

        const hasData = trendData.some(d => d[markerKey] !== undefined);

        if (!hasData) {
            return (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>No {marker.name} data available</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Latest Value & Trend */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                        <p className="text-sm text-muted-foreground">Latest {marker.name}</p>
                        <p className="text-2xl font-bold">
                            {latestValue !== null ? latestValue.toFixed(1) : 'N/A'} {marker.unit}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Normal: {marker.normal.min}-{marker.normal.max} {marker.unit}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {trend === 'improving' && <TrendingUp className="h-6 w-6 text-green-600" />}
                        {trend === 'declining' && <TrendingDown className="h-6 w-6 text-red-600" />}
                        {trend === 'stable' && <Minus className="h-6 w-6 text-gray-600" />}
                        <span className={`text-sm font-medium ${trend === 'improving' ? 'text-green-600' :
                                trend === 'declining' ? 'text-red-600' :
                                    'text-gray-600'
                            }`}>
                            {trend === 'improving' ? 'Improving' :
                                trend === 'declining' ? 'Declining' :
                                    'Stable'}
                        </span>
                    </div>
                </div>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Legend />

                        {/* Reference lines for normal range */}
                        <ReferenceLine
                            y={marker.normal.min}
                            stroke="#22c55e"
                            strokeDasharray="3 3"
                            label={{ value: 'Min Normal', fontSize: 10 }}
                        />
                        <ReferenceLine
                            y={marker.normal.max}
                            stroke="#22c55e"
                            strokeDasharray="3 3"
                            label={{ value: 'Max Normal', fontSize: 10 }}
                        />

                        <Line
                            type="monotone"
                            dataKey={markerKey}
                            stroke={marker.color}
                            strokeWidth={2}
                            dot={{ fill: marker.color, r: 4 }}
                            name={marker.name}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    if (trendData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Lab Results Trends</CardTitle>
                    <CardDescription>No lab data available to display trends</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lab Results Trends</CardTitle>
                <CardDescription>
                    Track your kidney function and other key health markers over time
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="eGFR">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="eGFR">eGFR</TabsTrigger>
                        <TabsTrigger value="creatinine">Creatinine</TabsTrigger>
                        <TabsTrigger value="hemoglobin">Hemoglobin</TabsTrigger>
                        <TabsTrigger value="albumin">Albumin</TabsTrigger>
                        <TabsTrigger value="potassium">Potassium</TabsTrigger>
                    </TabsList>

                    {Object.keys(KEY_MARKERS).map(markerKey => (
                        <TabsContent key={markerKey} value={markerKey} className="mt-6">
                            {renderMarkerChart(markerKey)}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
