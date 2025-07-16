
"use client";

import { useMemo, useEffect, useState } from 'react';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { isToday, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Users, Clock, PlayCircle } from 'lucide-react';

export default function OpdDisplayPage() {
    const { appointments, isLoading } = useAppointmentData();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 5000); // Update time every 5 seconds
        return () => clearInterval(timer);
    }, []);

    const { nowServing, waitingList } = useMemo(() => {
        const todaysAppointments = appointments.filter(app => {
            try {
                return isToday(parseISO(app.date));
            } catch {
                return false;
            }
        });

        const nowServing = todaysAppointments.find(app => app.status === 'Now Serving') || null;
        const waitingList = todaysAppointments
            .filter(app => app.status === 'Waiting')
            .sort((a, b) => a.time.localeCompare(b.time));

        return { nowServing, waitingList };
    }, [appointments]);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 p-4 bg-background rounded-lg shadow-md flex justify-between items-center">
                <h1 className="text-3xl md:text-4xl font-bold text-primary">OPD Status</h1>
                <div className="text-xl md:text-2xl font-semibold text-right">
                    <p>{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-muted-foreground">{currentTime.toLocaleTimeString()}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Now Serving Card */}
                <div className="lg:col-span-1">
                    <Card className="shadow-2xl border-4 border-green-500 bg-green-50">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-green-800 flex items-center">
                                <PlayCircle className="mr-3 h-10 w-10" />
                                Now Serving
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center py-8">
                            {nowServing ? (
                                <div className="space-y-4">
                                    <p className="text-5xl font-extrabold text-green-700 break-words">{nowServing.patientName}</p>
                                    <p className="text-2xl text-muted-foreground font-medium">Token: <span className="font-bold text-slate-600">{nowServing.nephroId}</span></p>
                                </div>
                            ) : (
                                <p className="text-4xl font-bold text-muted-foreground">No one is being served</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Waiting List Card */}
                <div className="lg:col-span-2">
                    <Card className="shadow-xl bg-background">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-primary flex items-center">
                                <Users className="mr-3 h-8 w-8" />
                                Waiting List
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {waitingList.length > 0 ? (
                                <ul className="space-y-4">
                                    {waitingList.map((app, index) => (
                                        <li key={app.id} className="flex items-center justify-between p-4 border-b-2 rounded-lg bg-blue-50/50 text-2xl">
                                            <div className="flex items-center">
                                                <span className="text-4xl font-bold text-primary mr-6">{index + 1}</span>
                                                <p className="font-semibold text-slate-800 break-words">{app.patientName}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <p className="font-bold text-primary flex items-center justify-end">
                                                    <Clock className="mr-2 h-6 w-6" />
                                                    Est. { (index + 1) * 10 } mins
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-24 text-muted-foreground">
                                    <p className="text-3xl font-semibold">The waiting list is currently empty.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

