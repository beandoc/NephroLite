
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, UserPlus, Eye, CalendarPlus, FileText } from 'lucide-react';
import { usePatientData } from '@/hooks/use-patient-data';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

type ActivityItem = {
    type: 'patient' | 'appointment' | 'visit';
    id: string;
    description: string;
    date: Date;
    href: string;
    icon: React.ElementType;
    iconColor: string;
}

export function RecentActivity() {
    const { patients, isLoading: patientsLoading } = usePatientData();

    const recentActivities = useMemo(() => {
        if (patientsLoading) return [];

        const allActivities: ActivityItem[] = [];

        patients.forEach(p => {
            // Patient registration event
            allActivities.push({
                type: 'patient',
                id: `patient-${p.id}`,
                description: `Patient ${[p.firstName, p.lastName].join(' ')} was registered.`,
                date: parseISO(p.createdAt),
                href: `/patients/${p.id}`,
                icon: UserPlus,
                iconColor: 'text-green-500',
            });

            // Patient visit events
            if (p.visits) {
                p.visits.forEach(v => {
                    allActivities.push({
                        type: 'visit' as const,
                        id: `visit-${v.id}`,
                        description: `New ${v.visitType.toLowerCase()} visit for ${[p.firstName, p.lastName].join(' ')}.`,
                        date: parseISO(v.createdAt),
                        href: `/patients/${p.id}?tab=visits`,
                        icon: FileText,
                        iconColor: 'text-indigo-500'
                    });
                });
            }
        });
        
        return allActivities
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5);

    }, [patients, patientsLoading]);

    if (patientsLoading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Recent Activity</CardTitle>
                    <CardDescription>Latest actions and updates in the system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Recent Activity</CardTitle>
        <CardDescription>Latest actions and updates in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentActivities.length > 0 ? (
            <div className="space-y-4">
                {recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-center">
                        <div className="flex-shrink-0">
                           <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
                        </div>
                        <div className="ml-3 flex-grow">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{format(activity.date, 'PPP, p')}</p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href={activity.href}><Eye className="h-4 w-4" /></Link>
                        </Button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground">
                <p>No recent activity to display.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
