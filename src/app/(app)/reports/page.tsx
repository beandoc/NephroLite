"use client";

import { useState, useMemo } from 'react';
import { usePatientData } from '@/hooks/use-patient-data';
import { useAuth } from '@/context/auth-provider';
import { getPatientWithSubcollections } from '@/lib/firestore-helpers';
import { logError } from '@/lib/logger';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, Download, Calendar, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DischargeSummaryButton } from '@/components/pdf/DischargeSummaryButton';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/lib/types';

export default function ReportsPage() {
    const { user } = useAuth();
    const { patients, isLoading } = usePatientData();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedPatientFull, setSelectedPatientFull] = useState<Patient | null>(null);
    const [loadingFullData, setLoadingFullData] = useState(false);

    const filteredPatients = useMemo(() => {
        if (!searchQuery || searchQuery.length < 2) return [];
        const query = searchQuery.toLowerCase();
        return patients.filter(p =>
            p.firstName.toLowerCase().includes(query) ||
            p.lastName.toLowerCase().includes(query) ||
            p.nephroId.toLowerCase().includes(query)
        ).slice(0, 5); // Limit results
    }, [patients, searchQuery]);

    const handlePatientSelect = async (patient: Patient) => {
        setSelectedPatient(patient);
        setSearchQuery(""); // Clear search to focus on selected
        setLoadingFullData(true);
        setSelectedPatientFull(null);

        try {
            if (!user?.uid) {
                logError('No user ID available for fetching patient data');
                setLoadingFullData(false);
                return;
            }

            // Fetch full patient data including visits subcollection
            const fullPatient = await getPatientWithSubcollections(user.uid, patient.id);
            setSelectedPatientFull(fullPatient);
        } catch (error) {
            logError('Error fetching full patient data', error);
        } finally {
            setLoadingFullData(false);
        }
    };

    const displayPatient = selectedPatientFull || selectedPatient;

    return (
        <div className="container mx-auto py-2 space-y-6">
            <PageHeader
                title="Reports Center"
                description="Generate and download PDF reports for patients."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Find Patient</CardTitle>
                    <CardDescription>Search by name or Nephro ID to access reports.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search patient..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value === "") {
                                    setSelectedPatient(null);
                                    setSelectedPatientFull(null);
                                }
                            }}
                        />
                        {searchQuery.length >= 2 && filteredPatients.length > 0 && !selectedPatient && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover text-popover-foreground shadow-md rounded-md border">
                                {filteredPatients.map(patient => (
                                    <button
                                        key={patient.id}
                                        className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                                        onClick={() => handlePatientSelect(patient)}
                                    >
                                        <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                                        <div className="text-xs text-muted-foreground">ID: {patient.nephroId}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {searchQuery.length >= 2 && filteredPatients.length === 0 && !selectedPatient && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover text-popover-foreground shadow-md rounded-md border p-2 text-sm text-muted-foreground text-center">
                                No patients found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedPatient && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-l-4 border-l-primary">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{selectedPatient.firstName} {selectedPatient.lastName}</CardTitle>
                                    <CardDescription>ID: {selectedPatient.nephroId} | {selectedPatient.gender} | {new Date().getFullYear() - parseISO(selectedPatient.dob).getFullYear()} yrs</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedPatient(null);
                                    setSelectedPatientFull(null);
                                }}>Change Patient</Button>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Discharge Summaries</CardTitle>
                            <CardDescription>Generate discharge summaries from previous visits.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingFullData ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    <p className="text-muted-foreground mt-2">Loading visit data...</p>
                                </div>
                            ) : displayPatient?.visits && displayPatient.visits.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Diagnosis</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayPatient.visits
                                            .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
                                            .map(visit => (
                                                <TableRow key={visit.id}>
                                                    <TableCell className="font-medium flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {format(parseISO(visit.date), 'PPP')}
                                                    </TableCell>
                                                    <TableCell>{visit.visitType}</TableCell>
                                                    <TableCell>
                                                        {visit.diagnoses?.map(d => <Badge key={d.id || d.name} variant="secondary" className="mr-1">{d.name}</Badge>) || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DischargeSummaryButton
                                                            patient={displayPatient}
                                                            visit={visit}
                                                            variant="outline"
                                                            size="sm"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No visits recorded for this patient.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
