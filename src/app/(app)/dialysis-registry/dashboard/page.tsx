"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, UserCheck, UserPlus, Activity, RefreshCw, Plus, ArrowRight } from 'lucide-react';
import { useDialysisSessions } from '@/hooks/use-dialysis-sessions';
import { usePatientData } from '@/hooks/use-patient-data';
import { useSystemUsers } from '@/hooks/use-system-users';
import Link from 'next/link';
import { useMemo } from 'react';

export default function DialysisRegistryDashboard() {
    const { sessions, loading: sessionsLoading } = useDialysisSessions();
    const { patients } = usePatientData();
    const { users } = useSystemUsers();

    // Get doctors only
    const doctors = users.filter(u => u.role === 'doctor');

    // Calculate stats with real patient data
    const stats = useMemo(() => {
        // Get patients with HD tag OR patients who have sessions
        const sessionPatientIds = new Set(sessions.map(s => s.patientId));
        const registryPatients = patients.filter(p =>
            p.clinicalProfile?.tags?.includes('HD') || sessionPatientIds.has(p.id)
        );

        // Count total registry patients
        const totalPatients = registryPatients.length;

        // Count active/pending/inactive from sessions
        // Active = patients with at least one active session
        const patientsWithActiveSessions = new Set(
            sessions.filter(s => s.status === 'Active').map(s => s.patientId)
        );
        const activePatients = registryPatients.filter(p =>
            patientsWithActiveSessions.has(p.id)
        ).length;

        // For now, assume all registry patients without sessions are pending
        const pendingPatients = totalPatients - activePatients;
        const inactivePatients = 0;

        const totalProviders = doctors.length;
        const activeProviders = doctors.length;

        // Calculate percentages
        const activePercentage = totalPatients > 0 ? Math.round((activePatients / totalPatients) * 100) : 0;
        const pendingPercentage = totalPatients > 0 ? Math.round((pendingPatients / totalPatients) * 100) : 0;
        const inactivePercentage = totalPatients > 0 ? Math.round((inactivePatients / totalPatients) * 100) : 0;

        // Provider distribution
        const providerCounts = sessions.reduce((acc, session) => {
            acc[session.providerId] = (acc[session.providerId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const providerStats = doctors.map(doctor => ({
            id: doctor.uid,
            name: doctor.name,
            count: providerCounts[doctor.uid] || 0,
            percentage: totalPatients > 0 ? Math.round((providerCounts[doctor.uid] || 0) / totalPatients * 100) : 0
        }));

        return {
            totalPatients,
            activePatients,
            pendingPatients,
            inactivePatients,
            activePercentage,
            pendingPercentage,
            inactivePercentage,
            totalProviders,
            activeProviders,
            providerStats,
            totalSessions: sessions.length
        };
    }, [sessions, doctors, patients]);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Registry Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive overview of registry patients and healthcare providers
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-lg" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                    <Link href="/dialysis-registry/sessions/new">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            New Session
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards - Now Clickable */}
            <div className="grid gap-4 md:grid-cols-4">
                <Link href="/dialysis-registry/patients">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                            <Users className="h-6 w-6 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-blue-600">{stats.totalPatients}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {stats.activePatients} active • {stats.pendingPatients} pending
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dialysis-registry/patients?status=active">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Patients</CardTitle>
                            <div className="rounded-full bg-green-100 p-2">
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-green-600">{stats.activePatients}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {stats.activePercentage}% of total patients
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/system/users?role=doctor">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Healthcare<br />Providers</CardTitle>
                            <div className="rounded-lg bg-purple-100 p-2">
                                <UserPlus className="h-5 w-5 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-purple-600">{stats.totalProviders}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {stats.activeProviders} active • 0 pending
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dialysis-registry/sessions">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Providers</CardTitle>
                            <div className="rounded-full bg-green-100 p-2">
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-green-600">{stats.activeProviders}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                100% of total providers
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Distribution Panels */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Patient Status Distribution */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <CardTitle>Patient Status Distribution</CardTitle>
                            </div>
                            <Link href="/dialysis-registry/patients">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500" />
                                    <span className="text-sm font-medium">Active</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold">{stats.activePatients}</span>
                                    <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{stats.activePercentage}%</span>
                                </div>
                            </div>
                            <Progress value={stats.activePercentage} className="h-3" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                                    <span className="text-sm font-medium">Pending</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold">{stats.pendingPatients}</span>
                                    <span className="text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{stats.pendingPercentage}%</span>
                                </div>
                            </div>
                            <Progress value={stats.pendingPercentage} className="h-3 bg-gray-200" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500" />
                                    <span className="text-sm font-medium">Inactive</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold">{stats.inactivePatients}</span>
                                    <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{stats.inactivePercentage}%</span>
                                </div>
                            </div>
                            <Progress value={stats.inactivePercentage} className="h-3 bg-gray-200" />
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total Count</span>
                                <span className="text-3xl font-bold text-blue-600">{stats.totalPatients}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Healthcare Provider Status Distribution */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-purple-600" />
                                <CardTitle>Healthcare Provider Status Distribution</CardTitle>
                            </div>
                            <Link href="/system/users">
                                <Button variant="ghost" size="sm">
                                    Manage <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500" />
                                    <span className="text-sm font-medium">Active</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold">{stats.activeProviders}</span>
                                    <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">100%</span>
                                </div>
                            </div>
                            <Progress value={100} className="h-3" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                                    <span className="text-sm font-medium">Pending</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold">0</span>
                                    <span className="text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">0%</span>
                                </div>
                            </div>
                            <Progress value={0} className="h-3 bg-gray-200" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500" />
                                    <span className="text-sm font-medium">Inactive</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold">0</span>
                                    <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full">0%</span>
                                </div>
                            </div>
                            <Progress value={0} className="h-3 bg-gray-200" />
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total Count</span>
                                <span className="text-3xl font-bold text-purple-600">{stats.totalProviders}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap">
                        <Link href="/dialysis-registry/sessions/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Session
                            </Button>
                        </Link>
                        <Link href="/dialysis-registry/analytics">
                            <Button variant="secondary">
                                <Activity className="mr-2 h-4 w-4" />
                                View Analytics
                            </Button>
                        </Link>
                        <Link href="/dialysis-registry/sessions">
                            <Button variant="outline">
                                View All Sessions ({stats.totalSessions})
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
