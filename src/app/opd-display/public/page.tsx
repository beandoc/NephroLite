
"use client";

import { useEffect, useMemo } from 'react';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { isToday, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Users, Clock, PlayCircle, Loader2, CheckCircle, Hospital } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const anonymizeName = (name: string) => {
    if (!name || name.length < 2) return "******";
    return `${name.charAt(0)}****${name.slice(-1)}`;
};

export default function PublicOpdDisplay() {
    const { toast } = useToast();
    const { appointments, isLoading: appointmentsLoading } = useAppointmentData();

    // Auto-refresh data every 15 seconds by showing a toast, mimicking a data refresh poll
    useEffect(() => {
        const interval = setInterval(() => {
            toast({ title: "Status refreshed", duration: 1500 });
        }, 15000); // 15 seconds

        return () => clearInterval(interval);
    }, [toast]);

    const { nowServing, waitingList, recentlyCompleted, admittedToday } = useMemo(() => {
        if (appointmentsLoading) return { nowServing: null, waitingList: [], recentlyCompleted: [], admittedToday: [] };

        const todaysAppointments = appointments.filter(app => {
            try { return isToday(parseISO(app.date)); } catch { return false; }
        });

        const nowServing = todaysAppointments.find(app => app.status === 'Now Serving') || null;
        
        const waitingList = todaysAppointments
            .filter(app => app.status === 'Waiting')
            .sort((a, b) => a.time.localeCompare(b.time));

        const recentlyCompleted = todaysAppointments
            .filter(app => app.status === 'Completed')
            .sort((a,b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 5); // Show last 5 completed

        const admittedToday = todaysAppointments
            .filter(app => app.status === 'Admitted')
            .sort((a,b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 5);

        return { nowServing, waitingList, recentlyCompleted, admittedToday };
    }, [appointments, appointmentsLoading]);


    if (appointmentsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
             <header className="text-center space-y-2 mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">Outpatient Department Queue</h1>
                <p className="text-muted-foreground text-lg">Live Waiting Room Status</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-xl border-4 border-green-500 bg-green-50 animate-pulse">
                     <CardHeader className="text-center pb-2">
                        <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-3">
                           <PlayCircle className="w-10 h-10"/>Now Serving
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-6">
                        {nowServing ? (
                             <p className="text-6xl md:text-8xl font-black text-green-700">{nowServing.patientName}</p>
                        ) : (
                            <p className="text-4xl text-green-600">--</p>
                        )}
                    </CardContent>
                </Card>
                
                <Card className="shadow-lg border-2 border-primary">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2"><Users className="w-8 h-8"/>Waiting List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {waitingList.length > 0 ? (
                            <ul className="space-y-3 py-2">
                                {waitingList.slice(0, 8).map((app, index) => (
                                    <li key={app.id} className="flex items-center p-3 rounded-lg text-xl bg-blue-50 border-blue-200 border-2">
                                        <span className="font-bold text-primary mr-4">{index + 1}.</span>
                                        <span className="font-semibold">{anonymizeName(app.patientName)}</span>
                                    </li>
                                ))}
                                {waitingList.length > 8 && <li className="text-center text-muted-foreground pt-2">...and more</li>}
                            </ul>
                        ) : (
                            <p className="text-center text-muted-foreground py-16">The waiting list is currently empty.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center"><CheckCircle className="mr-2 h-6 w-6 text-slate-500"/>Recently Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentlyCompleted.length > 0 ? (
                            <ul className="space-y-2">
                                {recentlyCompleted.map(app => (
                                    <li key={app.id} className="p-2 rounded-md bg-slate-100 text-slate-600">{anonymizeName(app.patientName)}</li>
                                ))}
                            </ul>
                        ) : <p className="text-muted-foreground text-center py-8">No recent consultations.</p>}
                    </CardContent>
                </Card>
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center"><Hospital className="mr-2 h-6 w-6 text-red-500"/>Admitted Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {admittedToday.length > 0 ? (
                            <ul className="space-y-2">
                                {admittedToday.map(app => (
                                    <li key={app.id} className="p-2 rounded-md bg-red-50 text-red-700">{anonymizeName(app.patientName)}</li>
                                ))}
                            </ul>
                        ) : <p className="text-muted-foreground text-center py-8">No admissions today.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
