"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDialysisSessions } from '@/hooks/use-dialysis-sessions';
import { usePatientData } from '@/hooks/use-patient-data';
import { Users, User, Scale, Activity, Wrench, Syringe, AlertCircle, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function DialysisRegistryAnalyticsPage() {
    const router = useRouter();
    const { sessions } = useDialysisSessions();
    const { patients } = usePatientData();

    // Analytics calculations
    const analytics = useMemo(() => {
        // Get patients with HD tag OR patients who have sessions
        const sessionPatientIds = new Set(sessions.map(s => s.patientId));
        const registryPatients = patients.filter(p =>
            p.clinicalProfile?.tags?.includes('HD') || sessionPatientIds.has(p.id)
        );

        // Demographics
        const totalPatients = registryPatients.length;
        const maleCount = registryPatients.filter(p => p.gender === 'Male').length;
        const femaleCount = registryPatients.filter(p => p.gender === 'Female').length;

        // Gender percentages
        const malePercentage = totalPatients > 0 ? Math.round((maleCount / totalPatients) * 100) : 0;
        const femalePercentage = totalPatients > 0 ? Math.round((femaleCount / totalPatients) * 100) : 0;

        // Vascular Access (Non-AVF)
        const nonAVFSessions = sessions.filter(s => s.vascularAccess?.accessType && s.vascularAccess.accessType !== 'AV Fistula');
        const nonAVFCount = new Set(nonAVFSessions.map(s => s.patientId)).size;

        // Clinical metrics - simplified
        let idwgAbnormal = 0;
        let albuminLow = 0;
        let calciumAbnormal = 0;
        let phosphorusHigh = 0;

        registryPatients.forEach(patient => {
            const patientSessions = sessions.filter(s => s.patientId === patient.id)
                .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

            if (patientSessions.length >= 2) {
                // IDWG calculation: Pre-HD current - Post-HD previous
                const currentSession = patientSessions[0];
                const previousSession = patientSessions[1];

                const preHDWeight = currentSession.hdParams?.weightBefore || 0;
                const postHDPrevious = previousSession.hdParams?.weightAfter || 0;

                if (preHDWeight > 0 && postHDPrevious > 0) {
                    const idwg = preHDWeight - postHDPrevious;
                    if (idwg > 2.5) idwgAbnormal++;
                }
            }

            // Get lab values from investigation records if available
            const latestRecord = patient.investigationRecords?.[0];
            if (latestRecord?.tests) {
                const getTestValue = (testName: string): number => {
                    const test = latestRecord.tests.find(t =>
                        t.name.toLowerCase().includes(testName.toLowerCase())
                    );
                    return test?.result ? parseFloat(test.result) : 0;
                };

                const albumin = getTestValue('albumin');
                if (albumin > 0 && albumin < 2.5) albuminLow++;

                const calcium = getTestValue('calcium');
                if (calcium > 0 && calcium < 8.5) calciumAbnormal++;

                const phosphorus = getTestValue('phosphorus');
                if (phosphorus > 5.5) phosphorusHigh++;
            }
        });

        // Today's sessions
        const today = new Date().toISOString().split('T')[0];
        const todaysSessions = sessions.filter(s => s.sessionDate === today).length;

        return {
            totalPatients,
            maleCount,
            femaleCount,
            malePercentage,
            femalePercentage,
            nonAVFCount,
            idwgAbnormal,
            albuminLow,
            calciumAbnormal,
            phosphorusHigh,
            todaysSessions,
            registryPatients
        };
    }, [sessions, patients]);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dialysis-registry/dashboard')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">HD Registry Analytics</h1>
                        <p className="text-muted-foreground mt-1">
                            Clinical insights and patient metrics from registry data
                        </p>
                    </div>
                </div>
            </div>

            {/* Demographics Row */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="text-4xl font-bold text-red-600">{analytics.totalPatients}</div>
                        <p className="text-sm text-gray-600 mt-1">Total Patients</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="text-4xl font-bold text-red-600">{analytics.maleCount}</div>
                        <p className="text-sm text-gray-600 mt-1">Male</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <User className="h-8 w-8 text-pink-600" />
                        </div>
                        <div className="text-4xl font-bold text-red-600">{analytics.femaleCount}</div>
                        <p className="text-sm text-gray-600 mt-1">Female</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Activity className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="text-4xl font-bold text-red-600">{analytics.nonAVFCount}</div>
                        <p className="text-sm text-gray-600 mt-1">Non-AVF Access</p>
                    </CardContent>
                </Card>
            </div>

            {/* Clinical Metrics Row */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Scale className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="text-4xl font-bold text-red-600">{analytics.idwgAbnormal}</div>
                        <p className="text-sm text-gray-600 mt-1">IDWG &gt; 2.5kg</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Activity className="h-8 w-8 text-cyan-600" />
                        </div>
                        <div className="text-4xl font-bold text-red-600">{analytics.albuminLow}</div>
                        <p className="text-sm text-gray-600 mt-1">Albumin &lt; 2.5g/dL</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Wrench className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="text-4xl font-bold text-red-600">{analytics.calciumAbnormal}</div>
                        <p className="text-sm text-gray-600 mt-1">Calcium &lt; 8.5mg/dL</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="text-4xl font-bold text-red-600">{analytics.phosphorusHigh}</div>
                        <p className="text-sm text-gray-600 mt-1">Phosphorus &gt; 5.5mg/dL</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alert Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Syringe className="h-6 w-6 text-yellow-600" />
                            <span className="font-semibold text-yellow-900">IV Iron Recommended</span>
                            <Badge className="ml-auto bg-red-500">{analytics.albuminLow}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Activity className="h-6 w-6 text-blue-600" />
                            <span className="font-semibold text-blue-900">Today's HD Patients</span>
                            <Badge className="ml-auto bg-blue-500">{analytics.todaysSessions}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-6 w-6 text-purple-600" />
                            <span className="font-semibold text-purple-900">High IDWG Alert</span>
                            <Badge className="ml-auto bg-purple-500">{analytics.idwgAbnormal}</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gender Distribution Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                {/* Female segment (red) */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="#EF4444"
                                    strokeWidth="20"
                                    strokeDasharray={`${analytics.femalePercentage * 2.51} 251`}
                                />
                                {/* Male segment (blue) */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="#3B82F6"
                                    strokeWidth="20"
                                    strokeDasharray={`${analytics.malePercentage * 2.51} 251`}
                                    strokeDashoffset={`-${analytics.femalePercentage * 2.51}`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{analytics.totalPatients}</div>
                                    <div className="text-xs text-gray-500">Patients</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-sm">Male ({analytics.malePercentage}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-sm">Female ({analytics.femalePercentage}%)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Back Button */}
            <div className="flex justify-center">
                <Link href="/dialysis-registry/dashboard">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
}
