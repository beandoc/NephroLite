"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pill, Clock, CheckCircle2, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { usePatientPortal } from '@/hooks/use-patient-portal';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { PrescriptionRefillDialog } from '@/components/patient/PrescriptionRefillDialog';

export default function MedicationsPage() {
    const { user } = useAuth();
    const { medications, loading: portalLoading } = usePatientPortal();
    const { toast } = useToast();

    const [medicationLogs, setMedicationLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adherenceData, setAdherenceData] = useState<any>({});

    useEffect(() => {
        loadMedicationLogs();
    }, [user?.patientId]);

    const loadMedicationLogs = async () => {
        if (!user?.patientId) return;

        try {
            setLoading(true);

            // Get logs for the past 7 days
            const weekStart = startOfWeek(new Date());
            const logsRef = collection(db, `patients/${user.patientId}/medicationLogs`);

            const snapshot = await getDocs(logsRef);
            const logs: any[] = [];

            snapshot.forEach(doc => {
                logs.push({ id: doc.id, ...doc.data() });
            });

            setMedicationLogs(logs);

            // Calculate adherence by day
            const adherence: any = {};
            for (let i = 0; i < 7; i++) {
                const day = format(addDays(weekStart, i), 'yyyy-MM-dd');
                const dayLogs = logs.filter(log => log.date === day);
                const total = medications.length;
                const taken = dayLogs.filter(log => log.status === 'taken').length;

                adherence[day] = {
                    percentage: total > 0 ? Math.round((taken / total) * 100) : 0,
                    taken,
                    total
                };
            }

            setAdherenceData(adherence);
        } catch (error) {
            console.error('Error loading medication logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsTaken = async (medicationName: string) => {
        if (!user?.patientId) return;

        try {
            const today = format(new Date(), 'yyyy-MM-dd');

            await addDoc(collection(db, `patients/${user.patientId}/medicationLogs`), {
                medicationName,
                date: today,
                takenAt: serverTimestamp(),
                status: 'taken',
                patientId: user.patientId
            });

            toast({
                title: "Medication Logged",
                description: `${medicationName} marked as taken`,
            });

            // Reload logs
            await loadMedicationLogs();
        } catch (error) {
            console.error('Error marking medication:', error);
            toast({
                title: "Error",
                description: "Could not log medication",
                variant: "destructive"
            });
        }
    };

    const isTakenToday = (medicationName: string) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return medicationLogs.some(log =>
            log.medicationName === medicationName &&
            log.date === today &&
            log.status === 'taken'
        );
    };

    // Calculate overall adherence for the week
    const weeklyAdherence = Object.values(adherenceData).reduce((acc: number, day: any) =>
        acc + day.percentage, 0) / 7 || 0;

    if (loading || portalLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">My Medications</h1>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center">
                    <Pill className="mr-3 h-8 w-8 text-blue-500" />
                    My Medications
                </h1>
                <p className="text-muted-foreground mt-1">
                    Track your medications and adherence
                </p>
            </div>

            {/* Weekly Adherence Banner */}
            <Card className={`border-2 ${weeklyAdherence >= 80 ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
                <CardContent className="flex items-center justify-between p-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Weekly Adherence</p>
                        <p className="text-3xl font-bold">{weeklyAdherence.toFixed(0)}%</p>
                    </div>
                    <div className="text-right">
                        {weeklyAdherence >= 80 ? (
                            <>
                                <CheckCircle2 className="h-12 w-12 text-green-600 inline-block" />
                                <p className="text-sm font-medium text-green-700 mt-1">Great job!</p>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-12 w-12 text-orange-600 inline-block" />
                                <p className="text-sm font-medium text-orange-700 mt-1">Needs improvement</p>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="week">This Week</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                </TabsList>

                {/* Today's Medications */}
                <TabsContent value="today" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Medications - {format(new Date(), 'EEEE, MMM dd')}</CardTitle>
                            <CardDescription>
                                Mark medications as taken throughout the day
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {medications.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No active medications on record
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {medications.map((med, idx) => {
                                        const taken = isTakenToday(med.name);

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center justify-between p-4 rounded-lg border-2 ${taken ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Checkbox
                                                        checked={taken}
                                                        onCheckedChange={() => !taken && markAsTaken(med.name)}
                                                        disabled={taken}
                                                    />
                                                    <div>
                                                        <p className="font-semibold">{med.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {med.dosage} • {med.frequency}
                                                        </p>
                                                        {med.instructions && (
                                                            <p className="text-xs text-muted-foreground italic mt-1">
                                                                {med.instructions}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {taken && (
                                                    <Badge className="bg-green-500">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Taken
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Weekly Adherence */}
                <TabsContent value="week" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Adherence Calendar</CardTitle>
                            <CardDescription>Your medication tracking for the past 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-2">
                                {Object.keys(adherenceData).map(date => {
                                    const data = adherenceData[date];
                                    const dayName = format(new Date(date), 'EEE');
                                    const isCurrentDay = isToday(new Date(date));

                                    return (
                                        <div
                                            key={date}
                                            className={`text-center p-3 rounded-lg border-2 ${data.percentage >= 80 ? 'bg-green-100 border-green-300' :
                                                    data.percentage >= 50 ? 'bg-yellow-100 border-yellow-300' :
                                                        data.percentage > 0 ? 'bg-orange-100 border-orange-300' :
                                                            'bg-gray-100 border-gray-300'
                                                } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}`}
                                        >
                                            <p className="text-xs font-medium text-muted-foreground">{dayName}</p>
                                            <p className="text-lg font-bold mt-1">{data.percentage}%</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {data.taken}/{data.total}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Prescriptions & Refills */}
                <TabsContent value="prescriptions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Prescriptions</CardTitle>
                            <CardDescription>Manage your prescriptions and request refills</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {medications.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No active prescriptions
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {medications.map((med, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-semibold">{med.name}</p>
                                                <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                                            </div>
                                            <PrescriptionRefillDialog medication={med} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
