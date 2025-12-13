"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ClipboardList, FileText, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { PatientQueueStatus } from '@/components/patient/patient-queue-status';
import { PatientDashboardWidgets } from '@/components/patient/dashboard-widgets';

export default function PatientDashboard() {
    const { user } = useAuth();

    const quickActions = [
        {
            title: 'Log PD Data',
            description: 'Record your daily PD monitoring',
            icon: Activity,
            href: '/patient/pd-logs',
            color: 'bg-blue-500',
            priority: 1,
        },
        {
            title: 'Check-in to OPD',
            description: 'Join the queue for your appointment',
            icon: ClipboardList,
            href: '/patient/checkin',
            color: 'bg-green-500',
            priority: 2,
        },
        {
            title: 'View Results',
            description: 'See your investigation results',
            icon: FileText,
            href: '/patient/investigations',
            color: 'bg-purple-500',
            priority: 3,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Welcome back, {user?.displayName !== "undefined undefined" ? user?.displayName : 'Patient'}!
                    </CardTitle>
                    <CardDescription className="text-green-50">
                        Your health information at your fingertips
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-green-100">Nephro ID</p>
                            <p className="font-semibold text-lg">{user?.nephroId || 'Pending'}</p>
                        </div>
                        <div>
                            <p className="text-green-100">Patient ID</p>
                            <p className="font-semibold text-lg opacity-80 font-mono">
                                {user?.patientId?.slice(0, 8).toUpperCase() || 'N/A'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Live Queue Status */}
            <PatientQueueStatus />

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-4">{quickActions.filter(action => {
                    if (action.title === 'Log PD Data') {
                        return !!user?.isPD;
                    }
                    return true;
                }).map((action) => (
                    <Link key={action.title} href={action.href}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-2`}>
                                    <action.icon className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle>{action.title}</CardTitle>
                                <CardDescription>{action.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full">
                                    Go to {action.title}
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                </div>
            </div>

            {/* Dashboard Widgets (Meds, Visits, Docs, Messages) */}
            <PatientDashboardWidgets />

            {/* Important Notice */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <CardHeader>
                    <CardTitle className="text-blue-900 dark:text-blue-100">
                        Important Reminders
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 dark:text-blue-200">
                    <ul className="space-y-2 text-sm">
                        <li>• Log your PD data daily for best results</li>
                        <li>• Check-in early for your appointments to reduce wait time</li>
                        <li>• Contact your doctor if you notice unusual symptoms</li>
                        <li>• Keep your contact information up to date</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
