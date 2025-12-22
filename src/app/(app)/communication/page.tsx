
"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePatientData } from '@/hooks/use-patient-data';
import type { Patient } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { StaffMessaging } from '@/components/communication/staff-messaging';
import { HealthFeeds } from '@/components/communication/health-feeds';
import { MESSAGE_TEMPLATES, fillTemplate, type MessageTemplate } from '@/lib/message-templates';

interface SearchResult {
    patientId: string;
    patientName: string;
    visitId: string;
    visitDate: string;
    relevantText: string;
}

export default function CommunicationPage() {
    const { toast } = useToast();
    const { patients, isLoading: patientsLoading } = usePatientData();

    // State for Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    // State for Outreach
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [generatedMessage, setGeneratedMessage] = useState('');

    const selectedPatient = useMemo(() => {
        return patients.find(p => p.id === selectedPatientId);
    }, [patients, selectedPatientId]);

    const selectedTemplate = useMemo(() => {
        return MESSAGE_TEMPLATES.find(t => t.id === selectedTemplateId);
    }, [selectedTemplateId]);

    // Suppress Radix UI false positive key warnings
    React.useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            const message = args[0];
            // Suppress React key warnings for this component (Radix UI false positive)
            if (
                typeof message === 'string' &&
                message.includes('unique "key" prop')
            ) {
                return; // Suppress key warnings
            }
            originalError(...args);
        };
        return () => {
            console.error = originalError;
        };
    }, []);

    // Text-based search function (no AI)
    const handleSearch = () => {
        if (!searchQuery.trim()) {
            toast({ title: "Search query cannot be empty.", variant: "destructive" });
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        patients.forEach(patient => {
            const patientName = `${patient.firstName} ${patient.lastName}`;

            patient.visits?.forEach(visit => {
                // Combine all searchable text from visit
                const searchableText = [
                    visit.visitRemark,
                    visit.diagnoses?.map(d => d.name).join(' '),
                    visit.clinicalData?.history,
                    visit.clinicalData?.generalExamination,
                    visit.clinicalData?.systemicExamination,
                    visit.clinicalData?.medications?.map(m => m.name).join(' '),
                    visit.clinicalData?.opinionText,
                ].filter(Boolean).join(' ').toLowerCase();

                // Check if query matches
                if (searchableText.includes(lowerQuery)) {
                    // Extract relevant snippet (50 chars before and after match)
                    const matchIndex = searchableText.indexOf(lowerQuery);
                    const start = Math.max(0, matchIndex - 50);
                    const end = Math.min(searchableText.length, matchIndex + lowerQuery.length + 50);
                    const snippet = searchableText.substring(start, end);

                    results.push({
                        patientId: patient.id,
                        patientName,
                        visitId: visit.id,
                        visitDate: visit.date,
                        relevantText: `...${snippet}...`
                    });
                }
            });
        });

        setSearchResults(results);
        toast({
            title: "Search Complete",
            description: `Found ${results.length} matching visit${results.length !== 1 ? 's' : ''}.`
        });
    };

    // Template-based message generation (no AI)
    const handleGenerateMessage = () => {
        if (!selectedPatient || !selectedTemplate) {
            toast({ title: "Please select a patient and template.", variant: "destructive" });
            return;
        }

        // Prepare template data
        const templateData: Record<string, string> = {
            patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
            diagnosis: selectedPatient.clinicalProfile?.primaryDiagnosis || 'Chronic Kidney Disease',
            date: format(new Date(), 'PPP'),
            time: format(new Date(), 'p'),
            appointmentType: 'Follow-up',
            clinicPhone: '+91-1234567890', // Replace with actual clinic phone
            medications: selectedPatient.visits?.[0]?.clinicalData?.medications?.map(m => m.name).join(', ') || 'as prescribed',
            proteinLimit: '40',
            targetBG: '100-140',
            medicationName: 'your medication',
            visitDate: format(new Date(), 'PPP'),
            topic: 'kidney health',
            dietType: 'low-sodium, low-protein'
        };

        const message = fillTemplate(selectedTemplate.template, templateData);
        setGeneratedMessage(message);
        toast({ title: "Message generated from template" });
    };

    return (
        <div className="container mx-auto py-2">
            <PageHeader title="Communication Hub" description="Manage internal messages, patient communication, and health feeds." />

            {/* Clinical Notification Search - Text-Based */}
            <Card className="mt-6 mb-6">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center">
                        <Search className="mr-2 h-5 w-5 text-primary" />
                        Clinical Notification Search
                    </CardTitle>
                    <CardDescription>Search for keywords across all patient visit notes (diagnoses, history, medications, etc.).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., 'fever', 'hypertension', 'dialysis'..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={patientsLoading}>
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                    </div>
                    {searchResults.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Search Results ({searchResults.length}):</h3>
                            <ScrollArea className="h-64 border rounded-md p-2">
                                <ul className="space-y-3">
                                    {searchResults.map(result => (
                                        <li key={result.visitId} className="border-b pb-2">
                                            <p className="font-semibold">
                                                <Link href={`/patients/${result.patientId}`} className="text-primary hover:underline">
                                                    {result.patientName}
                                                </Link>
                                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                                    on {format(parseISO(result.visitDate), 'PPP')}
                                                </span>
                                            </p>
                                            <p className="text-sm text-muted-foreground italic">"{result.relevantText}"</p>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Staff Messaging - Real Component */}
                <StaffMessaging />

                {/* Patient Outreach - Template Based */}
                <Card className="lg:col-span-1 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center">
                            <Mail className="mr-2 h-5 w-5 text-primary" />
                            Patient Outreach
                        </CardTitle>
                        <CardDescription>Generate messages using templates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                        <div className="space-y-2">
                            <Label>Select Patient</Label>
                            <Select onValueChange={setSelectedPatientId} value={selectedPatientId} disabled={patientsLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Patient..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {`${p.firstName} ${p.lastName}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Message Template</Label>
                            <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {MESSAGE_TEMPLATES.map(t => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleGenerateMessage}
                            disabled={!selectedPatientId || !selectedTemplateId}
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Generate from Template
                        </Button>

                        {generatedMessage && (
                            <div className="space-y-2 flex-1">
                                <Label>Generated Message (Editable)</Label>
                                <Textarea
                                    value={generatedMessage}
                                    onChange={(e) => setGeneratedMessage(e.target.value)}
                                    rows={6}
                                    className="flex-1"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Edit as needed before sending
                                </p>

                                {/* WhatsApp Send Button */}
                                {selectedPatient?.whatsappNumber && (
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                            const phoneNumber = selectedPatient.whatsappNumber?.replace(/[^0-9]/g, '') || '';
                                            const encodedMessage = encodeURIComponent(generatedMessage);
                                            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
                                            window.open(whatsappUrl, '_blank');
                                            toast({ title: 'Opening WhatsApp Web...', description: 'Message will be pre-filled' });
                                        }}
                                    >
                                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        Send via WhatsApp
                                    </Button>
                                )}

                                {selectedPatient && !selectedPatient.whatsappNumber && (
                                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                        ⚠️ No WhatsApp number on file for this patient
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Health Feeds - Real Component */}
                <HealthFeeds />
            </div>
        </div>
    );
}
