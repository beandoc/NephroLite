
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePatientData } from '@/hooks/use-patient-data';
import { useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Eye } from 'lucide-react';
import type { Patient, Intervention } from '@/lib/types';

interface InterventionRecord {
    patient: Patient;
    intervention: Intervention;
}

export default function InterventionTypePage() {
    const params = useParams();
    const router = useRouter();
    const { patients, isLoading } = usePatientData();
    const interventionType = useMemo(() => {
        const type = params.type;
        return typeof type === 'string' ? decodeURIComponent(type) : 'Unknown Intervention';
    }, [params.type]);

    const interventionRecords = useMemo(() => {
        if (isLoading) return [];
        
        const records: InterventionRecord[] = [];
        patients.forEach(patient => {
            patient.interventions?.forEach(intervention => {
                if (intervention.type === interventionType) {
                    records.push({ patient, intervention });
                }
            });
        });

        // Sort by date, most recent first
        return records.sort((a, b) => parseISO(b.intervention.date).getTime() - parseISO(a.intervention.date).getTime());

    }, [patients, isLoading, interventionType]);

    if (isLoading) {
        return (
            <div className="container mx-auto py-2">
                <PageHeader title={`Loading patients for ${interventionType}...`} backHref="/interventions" />
                 <Card className="mt-6">
                    <CardContent className="p-6">
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto py-2">
            <PageHeader 
                title={`Patients with Intervention: ${interventionType}`}
                description={`Found ${interventionRecords.length} record(s).`}
                backHref="/interventions"
            />
            <Card className="mt-6">
                <CardContent className="pt-6">
                    {interventionRecords.length > 0 ? (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date of Intervention</TableHead>
                                        <TableHead>Patient Name</TableHead>
                                        <TableHead>Nephro ID</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {interventionRecords.map(({ patient, intervention }) => (
                                        <TableRow key={`${patient.id}-${intervention.id}`}>
                                            <TableCell className="font-medium">{format(parseISO(intervention.date), 'PPP')}</TableCell>
                                            <TableCell>
                                                 <Link href={`/patients/${patient.id}`} className="text-primary hover:underline">
                                                    {patient.firstName} {patient.lastName}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{patient.nephroId}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{intervention.notes || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                 <Button variant="ghost" size="icon" asChild title="View Patient Profile">
                                                    <Link href={`/patients/${patient.id}`}><Eye className="h-4 w-4" /></Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground text-center">
                                No patients found for this intervention type.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

