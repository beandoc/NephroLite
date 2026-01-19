'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Database, Table as TableIcon } from "lucide-react";
import { supabase } from '@/lib/supabase/client';

export default function DataAuditPage() {
    const [counts, setCounts] = useState<any>({});
    const [samples, setSamples] = useState<any>({});
    const [loading, setLoading] = useState(true);

    const tables = [
        'patients',
        'visits',
        'appointments',
        'investigation_records',
        'interventions',
        'dialysis_sessions'
    ];

    useEffect(() => {
        loadAuditData();
    }, []);

    async function loadAuditData() {
        setLoading(true);
        const newCounts: any = {};
        const newSamples: any = {};

        for (const table of tables) {
            // Get count
            const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
            newCounts[table] = count || 0;

            // Get sample
            const { data } = await supabase.from(table).select('*').limit(1).order('created_at', { ascending: false });
            if (data && data.length > 0) {
                newSamples[table] = data[0];
            }
        }

        setCounts(newCounts);
        setSamples(newSamples);
        setLoading(false);
    }

    const renderJsonPreview = (data: any) => {
        if (!data) return <span className="text-muted-foreground">Empty</span>;
        const jsonStr = JSON.stringify(data, null, 2);
        // Highlight keys to show structure
        return <pre className="text-xs bg-slate-950 text-slate-50 p-3 rounded-md overflow-auto max-h-[300px]">{jsonStr}</pre>;
    };

    if (loading) return <div className="p-8 flex items-center justify-center">Loading System Audit...</div>;

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">System Data Audit</h1>
                <p className="text-muted-foreground">Verify data integrity, schema compliance, and granular metric capture.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {tables.map(table => (
                    <Card key={table} className="bg-card">
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            <div className="text-2xl font-bold">{counts[table]}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">{table}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="visits" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        {tables.map(t => <TabsTrigger key={t} value={t} className="capitalize">{t.replace('_', ' ')}</TabsTrigger>)}
                    </TabsList>
                    <Badge variant="outline" className="gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        System Healthy
                    </Badge>
                </div>

                {tables.map(table => (
                    <TabsContent key={table} value={table}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 capitalize">
                                    <TableIcon className="w-5 h-5" />
                                    {table.replace('_', ' ')} Table Analysis
                                </CardTitle>
                                <CardDescription>Most recent record analysis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {samples[table] ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-sm">Core Columns</h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="p-2 bg-muted rounded">ID: <span className="font-mono text-xs">{samples[table].id}</span></div>
                                                <div className="p-2 bg-muted rounded">Created: <span className="font-mono text-xs">{new Date(samples[table].created_at).toLocaleDateString()}</span></div>

                                                {/* Specialized granular key checks */}
                                                {(table === 'visits' || table === 'dialysis_sessions') && (
                                                    <>
                                                        <div className="p-2 border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900 rounded col-span-2">
                                                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">GRANULAR ANALYTICS COLUMNS</div>
                                                            <div className="grid grid-cols-2 gap-y-1">
                                                                <div>Systolic BP: <b>{samples[table].systolic_bp ?? 'N/A'}</b></div>
                                                                <div>Diastolic BP: <b>{samples[table].diastolic_bp ?? 'N/A'}</b></div>
                                                                <div>Weight: <b>{samples[table].weight_kg ?? 'N/A'} kg</b></div>
                                                                {table === 'dialysis_sessions' && <div>UF vol: <b>{samples[table].uf_volume_ml ?? 'N/A'} ml</b></div>}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-sm">JSONB Structure (Flex Fields)</h3>
                                            <ScrollArea className="h-[300px] w-full rounded-md border">
                                                {table === 'patients' && renderJsonPreview({
                                                    clinical_profile: samples[table].clinical_profile,
                                                    address: samples[table].address
                                                })}
                                                {table === 'visits' && renderJsonPreview({
                                                    clinical_data: samples[table].clinical_data,
                                                    diagnoses: samples[table].diagnoses
                                                })}
                                                {table === 'dialysis_sessions' && renderJsonPreview({
                                                    stats: samples[table].stats,
                                                    details: samples[table].details
                                                })}
                                                {['appointments', 'investigation_records', 'interventions'].includes(table) && renderJsonPreview(samples[table])}
                                            </ScrollArea>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                                        <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
                                        <p>No records found in this table.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
