
"use client";

import { useEffect, useMemo } from 'react';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { isToday, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, Users, Tv2, Loader2 } from 'lucide-react';

const anonymizeName = (name: string) => {
    if (!name || name.length < 2) return "******";
    return `${name.charAt(0)}****${name.slice(-1)}`;
};


export default function OpdPublicDisplayPage() {
    const { appointments, isLoading: appointmentsLoading } = useAppointmentData();

    // Auto-refresh data every 10 seconds. In a real-world app with live data,
    // this would be handled by the Firestore onSnapshot listener.
    // Here we just trigger a state re-evaluation by using a dummy state update.
    const [_, setTick] =  useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 10000); // 10 seconds
        return () => clearInterval(interval);
    }, []);

    const { nowServing, waitingList, nowServingQueueNumber } = useMemo(() => {
        if (appointmentsLoading) return { nowServing: null, waitingList: [], nowServingQueueNumber: 0 };

        const todaysAppointments = appointments.filter(app => {
            try {
                return isToday(parseISO(app.date));
            } catch {
                return false;
            }
        });

        const nowServing = todaysAppointments.find(app => app.status === 'Now Serving') || null;
        
        const completedOrServing = todaysAppointments
            .filter(app => app.status === 'Completed' || app.status === 'Now Serving')
            .sort((a,b) => a.time.localeCompare(b.time));

        const nowServingQueueNumber = completedOrServing.findIndex(app => app.id === nowServing?.id) + 1;

        const waitingList = todaysAppointments
            .filter(app => app.status === 'Waiting')
            .sort((a, b) => a.time.localeCompare(b.time));

        return { nowServing, waitingList, nowServingQueueNumber };
    }, [appointments, appointmentsLoading]);

    if (appointmentsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
             <header className="text-center space-y-2 bg-white p-4 rounded-xl shadow-lg">
                <h1 className="text-4xl md:text-5xl font-extrabold text-primary flex items-center justify-center gap-4">
                    <Tv2 className="w-10 h-10 md:w-12 md:h-12"/> OPD Waiting Area Display
                </h1>
                <p className="text-muted-foreground text-lg">Welcome! Please keep an eye on the screen for your number.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="shadow-xl border-4 border-green-500 h-full">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl md:text-3xl font-bold text-green-600 flex items-center justify-center gap-3">
                                <PlayCircle className="w-8 h-8"/>Now Serving
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            {nowServing ? (
                                <p className="text-8xl md:text-9xl font-black text-green-600 animate-pulse">{nowServingQueueNumber > 0 ? nowServingQueueNumber : '--'}</p>
                            ) : (
                                <p className="text-4xl md:text-5xl font-bold text-muted-foreground py-12">Queue has not started</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                     <Card className="shadow-lg h-full">
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-3">
                                <Users className="w-7 h-7 text-primary"/>Up Next
                            </CardTitle>
                            <CardDescription>Patients waiting in the queue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {waitingList.length > 0 ? (
                                <ul className="space-y-3">
                                    {waitingList.slice(0, 5).map((app, index) => (
                                        <li key={app.id} className="flex items-center p-3 rounded-lg text-lg bg-slate-100">
                                            <span className="font-bold text-primary mr-4 text-2xl">
                                                {nowServingQueueNumber > 0 ? nowServingQueueNumber + index + 1 : index + 1}
                                            </span>
                                            <span className="font-semibold">{anonymizeName(app.patientName)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground py-10">The waiting list is currently empty.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
