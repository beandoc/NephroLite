
"use client";

import { useEffect, useMemo } from 'react';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, PlayCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const anonymizeName = (name: string) => {
    if (!name || name.length < 2) return "******";
    return `${name.charAt(0)}****${name.slice(-1)}`;
};

export default function PublicOpdDisplay() {
    const { toast } = useToast();
    const { appointments, isLoading: appointmentsLoading } = useAppointmentData(true);

    useEffect(() => {
        const interval = setInterval(() => {
            // This is a placeholder for a potential refetch.
            // onSnapshot in the hook handles real-time updates.
             toast({ title: "Status refreshed", duration: 1500 });
        }, 10000); // Refresh data every 10 seconds

        return () => clearInterval(interval);
    }, [toast]);

    const { nowServing, waitingList, nowServingQueueNumber } = useMemo(() => {
        if (appointmentsLoading) return { nowServing: null, waitingList: [], nowServingQueueNumber: 0 };

        const nowServing = appointments.find(app => app.status === 'Now Serving') || null;

        const waitingList = appointments
            .filter(app => app.status === 'Waiting')
            .sort((a, b) => a.time.localeCompare(b.time));

        const completedOrServing = appointments
            .filter(app => app.status === 'Completed' || app.status === 'Now Serving')
            .sort((a,b) => a.time.localeCompare(b.time));

        const nowServingQueueNumber = completedOrServing.findIndex(app => app.id === nowServing?.id) + 1;

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
        <div className="p-4 bg-slate-100 min-h-screen">
            <header className="text-center py-4 border-b-2 border-slate-300 mb-6">
                <h1 className="text-4xl font-extrabold text-primary tracking-tight">OPD Waiting Room Display</h1>
                <p className="text-xl text-muted-foreground mt-1">{format(new Date(), 'PPP')}</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 shadow-xl border-4 border-green-500">
                    <CardHeader className="text-center bg-green-500 text-white p-4">
                        <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                           <PlayCircle className="w-8 h-8"/> NOW SERVING
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center text-center h-56">
                        {nowServing && nowServingQueueNumber > 0 ? (
                            <p className="text-8xl font-black text-green-700">{nowServingQueueNumber}</p>
                        ) : (
                            <p className="text-4xl font-bold text-muted-foreground">--</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-lg">
                    <CardHeader className="text-center bg-slate-200 p-4">
                         <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                            <Users className="w-8 h-8"/> WAITING LIST
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {waitingList.length > 0 ? (
                            <ul className="space-y-3">
                                {waitingList.slice(0, 5).map((app, index) => (
                                    <li key={app.id} className="flex items-center justify-between p-3 rounded-lg text-2xl font-semibold bg-slate-100">
                                        <span className="text-primary w-16">{nowServingQueueNumber > 0 ? nowServingQueueNumber + index + 1 : index + 1}</span>
                                        <span>{anonymizeName(app.patientName)}</span>
                                        <span className="text-muted-foreground">{app.time}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="flex items-center justify-center h-56">
                                <p className="text-2xl text-muted-foreground">The waiting list is currently empty.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
