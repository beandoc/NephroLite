"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Users, CheckCircle, TrendingUp, User } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

const AVERAGE_CONSULTATION_TIME = 10; // minutes per patient

export function PatientQueueStatus() {
    const { user } = useAuth();
    const [queueData, setQueueData] = useState<{
        nowServing: any;
        myPosition: number | null;
        totalWaiting: number;
        estimatedWaitTime: number;
        myEntry: any;
    }>({
        nowServing: null,
        myPosition: null,
        totalWaiting: 0,
        estimatedWaitTime: 0,
        myEntry: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.patientId) {
            setLoading(false);
            return;
        }

        const today = format(new Date(), 'yyyy-MM-dd');
        const queueRef = collection(db, `opdQueue/${today}/patients`);
        const q = query(queueRef, orderBy('checkInTime', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allEntries: any[] = [];
            snapshot.forEach((doc) => {
                allEntries.push({ id: doc.id, ...doc.data() });
            });

            // Find currently serving
            const nowServing = allEntries.find(e => e.status === 'serving');

            // Find waiting patients
            const waiting = allEntries.filter(e => e.status === 'waiting');

            // Find my entry
            const myEntry = allEntries.find(e => e.patientId === user.patientId);

            // Calculate my position (only if I'm waiting)
            let myPosition: number | null = null;
            let estimatedWaitTime = 0;

            if (myEntry && myEntry.status === 'waiting') {
                myPosition = waiting.findIndex(e => e.patientId === user.patientId) + 1;
                if (myPosition > 0) {
                    estimatedWaitTime = myPosition * AVERAGE_CONSULTATION_TIME;
                }
            }

            setQueueData({
                nowServing,
                myPosition,
                totalWaiting: waiting.length,
                estimatedWaitTime,
                myEntry,
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.patientId]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Queue Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Loading queue status...</p>
                </CardContent>
            </Card>
        );
    }

    // Not checked in
    if (!queueData.myEntry) {
        return (
            <Card className="border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                        <Users className="mr-2 h-5 w-5" />
                        Queue Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert className="bg-blue-50 border-blue-200">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            You haven't checked in yet. Go to the Check-in page to join the queue.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    // Already served
    if (queueData.myEntry.status === 'completed') {
        return (
            <Card className="border-green-200 bg-green-50">
                <CardHeader>
                    <CardTitle className="flex items-center text-green-900">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Consultation Complete
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-green-800">Your consultation has been completed.</p>
                </CardContent>
            </Card>
        );
    }

    // Currently being served
    if (queueData.myEntry.status === 'serving') {
        return (
            <Card className="border-green-500 bg-green-50">
                <CardHeader>
                    <CardTitle className="flex items-center text-green-900">
                        <User className="mr-2 h-5 w-5" />
                        Your Turn!
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        <div className="text-5xl font-bold text-green-600 mb-2 animate-pulse">
                            NOW SERVING
                        </div>
                        <p className="text-lg text-green-800">
                            Please proceed to the consultation room
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Waiting in queue
    return (
        <Card className="border-primary">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    Live Queue Status
                </CardTitle>
                <CardDescription>
                    Real-time updates • Auto-refreshing
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Now Serving */}
                <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1 flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Currently Being Served
                    </p>
                    {queueData.nowServing ? (
                        <p className="text-lg font-semibold">
                            {queueData.nowServing.patientName}
                        </p>
                    ) : (
                        <p className="text-lg font-semibold text-muted-foreground">
                            Queue not started yet
                        </p>
                    )}
                </div>

                {/* My Position */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-center">
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                            Your Position
                        </p>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                            #{queueData.myPosition || '-'}
                        </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 text-center">
                        <p className="text-sm text-green-700 dark:text-green-300 mb-1 flex items-center justify-center">
                            <Clock className="mr-1 h-4 w-4" />
                            Est. Wait Time
                        </p>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                            {queueData.estimatedWaitTime}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">minutes</p>
                    </div>
                </div>

                {/* Total Waiting */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Total Patients Waiting
                    </span>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                        {queueData.totalWaiting}
                    </Badge>
                </div>

                {/* Info */}
                <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        Wait time is estimated at {AVERAGE_CONSULTATION_TIME} minutes per patient.
                        Your position updates automatically as the queue progresses.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}
