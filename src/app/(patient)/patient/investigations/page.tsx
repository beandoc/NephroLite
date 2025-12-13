"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, Beaker } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

export default function InvestigationsPage() {
    const { user } = useAuth();
    const [investigations, setInvestigations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvestigations();
    }, []);

    const loadInvestigations = async () => {
        if (!user?.patientId) return;

        try {
            setLoading(true);
            const investRef = collection(db, `patients/${user.patientId}/investigationRecords`);
            const q = query(investRef, orderBy('dateRecorded', 'desc'));
            const snapshot = await getDocs(q);

            const records: any[] = [];
            snapshot.forEach(doc => {
                records.push({ id: doc.id, ...doc.data() });
            });

            setInvestigations(records);
        } catch (error) {
            console.error('Error loading investigations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center">
                    <FileText className="mr-3 h-8 w-8 text-purple-500" />
                    Investigation Results
                </h1>
                <p className="text-muted-foreground mt-1">
                    View your lab test results and reports
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Investigation Records</CardTitle>
                    <CardDescription>
                        Your laboratory test results
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center text-muted-foreground py-8">Loading results...</p>
                    ) : investigations.length === 0 ? (
                        <div className="text-center py-8">
                            <Beaker className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No investigation records found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Your test results will appear here once they're recorded
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {investigations.map(record => (
                                <Card key={record.id} className="border-purple-100">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-md flex items-center">
                                                <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                                                {record.dateRecorded?.toDate
                                                    ? format(record.dateRecorded.toDate(), 'PPP')
                                                    : 'Date not available'}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {record.testsPerformed && record.testsPerformed.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Test Name</TableHead>
                                                        <TableHead>Result</TableHead>
                                                        <TableHead>Unit</TableHead>
                                                        <TableHead>Reference Range</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {record.testsPerformed.map((test: any, idx: number) => (
                                                        <TableRow key={idx}>
                                                            <TableCell className="font-medium">{test.name}</TableCell>
                                                            <TableCell>{test.result}</TableCell>
                                                            <TableCell>{test.unit}</TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {test.referenceRange || '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">No test details available</p>
                                        )}

                                        {record.notes && (
                                            <div className="mt-3 p-3 bg-muted rounded-lg">
                                                <p className="text-sm font-medium mb-1">Notes:</p>
                                                <p className="text-sm text-muted-foreground">{record.notes}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
