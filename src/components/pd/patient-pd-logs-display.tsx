"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    UserCheck,
    Calendar,
    Activity,
    Droplets,
    Heart,
    TrendingUp,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

interface PDLogEntry {
    id: string;
    date: string;
    weight?: string;
    bloodPressureSystolic?: string;
    bloodPressureDiastolic?: string;
    urineOutput?: string;
    ultrafiltration?: string;
    symptoms?: string;
    notes?: string;
    enteredBy: 'patient' | 'staff';
    createdAt: Timestamp;
}

interface PatientPDLogsDisplayProps {
    patientId: string;
}

export function PatientPDLogsDisplay({ patientId }: PatientPDLogsDisplayProps) {
    const [logs, setLogs] = useState<PDLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'patient' | 'staff'>('all');

    useEffect(() => {
        if (!patientId) {
            setLoading(false);
            return;
        }

        // Listen to PD daily monitoring logs
        // Using nested 'baseline' document to ensure valid odd-number segment path:
        // patients(1)/pid(2)/pdData(3)/baseline(4)/dailyMonitoring(5)
        const logsRef = collection(db, `patients/${patientId}/pdData/baseline/dailyMonitoring`);
        const q = query(logsRef, orderBy('createdAt', 'desc'), limit(30));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const entries: PDLogEntry[] = [];
                snapshot.forEach((doc) => {
                    entries.push({
                        id: doc.id,
                        ...doc.data(),
                    } as PDLogEntry);
                });
                setLogs(entries);
                setLoading(false);
            },
            (error) => {
                console.error('Error loading PD logs:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [patientId]);

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        return log.enteredBy === filter;
    });

    const patientEnteredCount = logs.filter(l => l.enteredBy === 'patient').length;
    const staffEnteredCount = logs.filter(l => l.enteredBy === 'staff').length;

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Activity className="mr-2 h-5 w-5" />
                        PD Daily Monitoring Logs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Loading patient logs...</p>
                </CardContent>
            </Card>
        );
    }

    if (logs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Activity className="mr-2 h-5 w-5" />
                        PD Daily Monitoring Logs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No PD monitoring logs found for this patient. Patient can log data via the patient portal.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    PD Daily Monitoring Logs
                </CardTitle>
                <CardDescription>
                    Last 30 days of patient PD monitoring data
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="bg-blue-50 dark:bg-blue-950">
                        <CardContent className="pt-4">
                            <p className="text-sm text-blue-700 dark:text-blue-300">Total Entries</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{logs.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 dark:bg-green-950">
                        <CardContent className="pt-4">
                            <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                                <UserCheck className="mr-1 h-3 w-3" />
                                Patient-Entered
                            </p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{patientEnteredCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 dark:bg-purple-950">
                        <CardContent className="pt-4">
                            <p className="text-sm text-purple-700 dark:text-purple-300 flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                Staff-Entered
                            </p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{staffEnteredCount}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All ({logs.length})</TabsTrigger>
                        <TabsTrigger value="patient">
                            <UserCheck className="mr-1 h-4 w-4" />
                            Patient ({patientEnteredCount})
                        </TabsTrigger>
                        <TabsTrigger value="staff">
                            <User className="mr-1 h-4 w-4" />
                            Staff ({staffEnteredCount})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Logs Display */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredLogs.map((log) => (
                        <Card key={log.id} className={`
                            ${log.enteredBy === 'patient' ? 'border-green-200 bg-green-50/50 dark:bg-green-950/30' : 'border-purple-200 bg-purple-50/50 dark:bg-purple-950/30'}
                        `}>
                            <CardContent className="pt-4">
                                {/* Header with Date and Badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-semibold">{log.date}</span>
                                    </div>
                                    <Badge
                                        variant={log.enteredBy === 'patient' ? 'default' : 'secondary'}
                                        className={log.enteredBy === 'patient' ? 'bg-green-500' : 'bg-purple-500'}
                                    >
                                        {log.enteredBy === 'patient' ? (
                                            <>
                                                <UserCheck className="mr-1 h-3 w-3" />
                                                Patient-Entered
                                            </>
                                        ) : (
                                            <>
                                                <User className="mr-1 h-3 w-3" />
                                                Staff-Entered
                                            </>
                                        )}
                                    </Badge>
                                </div>

                                {/* Vitals Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    {log.weight && (
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Weight</p>
                                                <p className="font-medium">{log.weight} kg</p>
                                            </div>
                                        </div>
                                    )}
                                    {(log.bloodPressureSystolic && log.bloodPressureDiastolic) && (
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-red-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">BP</p>
                                                <p className="font-medium">{log.bloodPressureSystolic}/{log.bloodPressureDiastolic}</p>
                                            </div>
                                        </div>
                                    )}
                                    {log.urineOutput && (
                                        <div className="flex items-center gap-2">
                                            <Droplets className="h-4 w-4 text-yellow-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Urine Output</p>
                                                <p className="font-medium">{log.urineOutput} ml</p>
                                            </div>
                                        </div>
                                    )}
                                    {log.ultrafiltration && (
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">UF</p>
                                                <p className="font-medium">{log.ultrafiltration} ml</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Symptoms and Notes */}
                                {(log.symptoms || log.notes) && (
                                    <div className="mt-3 pt-3 border-t space-y-2">
                                        {log.symptoms && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Symptoms:</p>
                                                <p className="text-sm">{log.symptoms}</p>
                                            </div>
                                        )}
                                        {log.notes && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Notes:</p>
                                                <p className="text-sm">{log.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Logged: {log.createdAt?.toDate ? format(log.createdAt.toDate(), 'PPp') : 'N/A'}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredLogs.length === 0 && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No {filter === 'patient' ? 'patient-entered' : 'staff-entered'} logs found.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
