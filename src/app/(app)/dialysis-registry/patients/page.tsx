"use client";

import { Suspense } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDialysisSessions } from '@/hooks/use-dialysis-sessions';
import { usePatientData } from '@/hooks/use-patient-data';
import { ArrowLeft, Search, UserPlus, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

function DialysisRegistryPatientsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status');

    const { sessions } = useDialysisSessions();
    const { patients } = usePatientData();
    const [searchTerm, setSearchTerm] = useState('');

    // Get patients who have HD sessions
    const registryPatients = useMemo(() => {
        const patientSessionMap = new Map();

        sessions.forEach(session => {
            if (!patientSessionMap.has(session.patientId)) {
                patientSessionMap.set(session.patientId, {
                    sessionCount: 0,
                    lastSession: null,
                    status: session.status
                });
            }
            const data = patientSessionMap.get(session.patientId);
            data.sessionCount++;
            if (!data.lastSession || session.sessionDate > data.lastSession) {
                data.lastSession = session.sessionDate;
            }
        });

        return patients
            .filter(p => patientSessionMap.has(p.id))
            .map(p => ({
                ...p,
                ...patientSessionMap.get(p.id)
            }))
            .filter(p => {
                if (statusFilter === 'active') return p.status === 'Active';
                return true;
            })
            .filter(p => {
                if (!searchTerm) return true;
                const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase()) ||
                    p.nephroId?.toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [sessions, patients, statusFilter, searchTerm]);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dialysis-registry/dashboard')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Registry Patients</h1>
                        <p className="text-muted-foreground mt-1">
                            Patients enrolled in the Hemodialysis Registry
                        </p>
                    </div>
                </div>
                <Link href="/dialysis-registry/sessions/new">
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Session
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or Nephro ID..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Patients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Patients ({registryPatients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {registryPatients.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No patients in registry</p>
                            <p className="text-sm">Create a dialysis session to enroll a patient</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nephro ID</TableHead>
                                    <TableHead>Patient Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sessions</TableHead>
                                    <TableHead>Last Session</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registryPatients.map(patient => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-medium">{patient.nephroId}</TableCell>
                                        <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                                        <TableCell>
                                            <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>
                                                {patient.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{patient.sessionCount}</TableCell>
                                        <TableCell>{patient.lastSession || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/patients/${patient.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/dialysis-registry/sessions/new?patientId=${patient.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <UserPlus className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Wrap with Suspense to fix Next.js build error
export default function Page() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <DialysisRegistryPatientsPage />
        </Suspense>
    );
}
