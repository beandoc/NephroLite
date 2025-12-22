"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, UserCheck, UserPlus, Activity, RefreshCw, Plus } from 'lucide-react';
import { useDialysisSessions } from '@/hooks/use-dialysis-sessions';
import { useSystemUsers } from '@/hooks/use-system-users';
import { usePatientData } from '@/hooks/use-patient-data';
import Link from 'next/link';
import { useMemo } from 'react';

export default function DialysisSessionsPage() {
    const { sessions, loading } = useDialysisSessions();
    const { users } = useSystemUsers();
    const { patients } = usePatientData();

    // Get doctors only
    const doctors = users.filter(u => u.role === 'doctor');

    // Calculate stats
    const stats = useMemo(() => {
        const totalPatients = new Set(sessions.map(s => s.patientId)).size;
        const activePatients = sessions.filter(s => s.status === 'Active').length;
        const totalProviders = new Set(sessions.map(s => s.providerId)).size;
        const activeProviders = doctors.length;

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
            totalProviders,
            activeProviders,
            providerStats
        };
    }, [sessions, doctors]);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Registry Dashboard"
                    description="Comprehensive overview of registry patients and healthcare providers"
                />
                <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Link href="/dialysis-registry/sessions/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Session
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{stats.totalPatients}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.activePatients} active • 0 pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                        <UserCheck className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats.activePatients}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            100% of total patients
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Healthcare Providers</CardTitle>
                        <UserPlus className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">{doctors.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.activeProviders} active • 0 pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
                        <Activity className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats.activeProviders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            100% of total providers
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Distribution Panels */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Patient Status Distribution */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <CardTitle>Patient Status Distribution</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span className="text-sm">Active</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold">{stats.activePatients}</span>
                                <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded">100%</span>
                            </div>
                        </div>
                        <Progress value={100} className="h-2 bg-gray-100" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-amber-500" />
                                <span className="text-sm">Pending</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold">0</span>
                                <span className="text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded">0%</span>
                            </div>
                        </div>
                        <Progress value={0} className="h-2 bg-gray-100" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span className="text-sm">Inactive</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold">0</span>
                                <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded">0%</span>
                            </div>
                        </div>
                        <Progress value={0} className="h-2 bg-gray-100" />

                        <div className="pt-2 border-t">
                            <div className="flex items-center justify-between font-semibold">
                                <span>Total Count</span>
                                <span className="text-2xl text-blue-600">{stats.totalPatients}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Healthcare Provider Status Distribution */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            <CardTitle>Healthcare Provider Status Distribution</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats.providerStats.map((provider, index) => (
                            <div key={provider.id}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-green-500' :
                                                index === 1 ? 'bg-blue-500' :
                                                    'bg-purple-500'
                                            }`} />
                                        <span className="text-sm">{provider.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold">{provider.count}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${provider.count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {provider.percentage}%
                                        </span>
                                    </div>
                                </div>
                                <Progress value={provider.percentage} className="h-2 bg-gray-100" />
                            </div>
                        ))}

                        <div className="pt-2 border-t">
                            <div className="flex items-center justify-between font-semibold">
                                <span>Total Count</span>
                                <span className="text-2xl text-purple-600">{doctors.length}</span>
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
                    <div className="flex gap-4">
                        <Link href="/dialysis-registry/sessions/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Session
                            </Button>
                        </Link>
                        <Link href="/dialysis-registry/sessions">
                            <Button variant="outline">
                                View All Sessions
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
