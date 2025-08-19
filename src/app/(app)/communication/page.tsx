
"use client";

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Send, Users, FileImage, FileTextIcon, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePatientData } from '@/hooks/use-patient-data';
import { searchNotifications } from '@/ai/flows/search-notifications-flow';
import { generatePatientOutreach } from '@/ai/flows/generate-patient-outreach-flow';
import type { Patient, Visit } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

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
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    // State for Outreach
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [messageContext, setMessageContext] = useState('');
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
    const [generatedMessage, setGeneratedMessage] = useState('');

    const allVisits = useMemo(() => {
        if (patientsLoading) return [];
        return patients.flatMap(p => 
            (p.visits || []).map(v => ({...v, patientName: p.name, patientId: p.id }))
        );
    }, [patients, patientsLoading]);
    
    const selectedPatientForOutreach = useMemo(() => {
        return patients.find(p => p.id === selectedPatientId);
    }, [patients, selectedPatientId]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast({ title: "Search query cannot be empty.", variant: "destructive" });
            return;
        }
        setIsSearching(true);
        setSearchResults([]);
        try {
            const result = await searchNotifications({ query: searchQuery, visits: allVisits });
            setSearchResults(result.results);
             toast({ title: "Search Complete", description: `Found ${result.results.length} matching notifications.`});
        } catch (error) {
            console.error("Search failed:", error);
            toast({ title: "Search Failed", description: "An error occurred while searching.", variant: "destructive" });
        }
        setIsSearching(false);
    };

    const handleGenerateMessage = async () => {
        if (!selectedPatientForOutreach || !messageContext) {
            toast({ title: "Patient and context are required.", variant: "destructive" });
            return;
        }
        setIsGeneratingMessage(true);
        setGeneratedMessage('');
        try {
            const result = await generatePatientOutreach({
                patientName: selectedPatientForOutreach.name,
                primaryDiagnosis: selectedPatientForOutreach.clinicalProfile.primaryDiagnosis || 'N/A',
                messageContext: messageContext,
            });
            setGeneratedMessage(result.outreachMessage);
        } catch (error) {
            console.error("Message generation failed:", error);
            toast({ title: "Generation Failed", description: "An error occurred while generating the message.", variant: "destructive" });
        }
        setIsGeneratingMessage(false);
    };

    const handleAction = (feature: string) => {
        toast({
            title: "Feature Under Development",
            description: `The ${feature} feature is a work in progress.`
        });
    };

    return (
        <div className="container mx-auto py-2">
            <PageHeader title="Communication Hub" description="Manage internal messages, patient communication, and health feeds." />
            
            <Card className="mt-6 mb-6">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center"><Search className="mr-2 h-5 w-5 text-primary"/>Clinical Notification Search</CardTitle>
                    <CardDescription>Use AI to search for clinical events across all patient visit notes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="e.g., 'Find patients with fever and pedal edema' or 'Show me recent admissions'..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={isSearching || patientsLoading}>
                            {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Search
                        </Button>
                    </div>
                    {isSearching && <p className="text-muted-foreground text-sm mt-2">Searching...</p>}
                    {searchResults.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Search Results:</h3>
                            <ScrollArea className="h-64 border rounded-md p-2">
                                <ul className="space-y-3">
                                    {searchResults.map(result => (
                                        <li key={result.visitId} className="border-b pb-2">
                                            <p className="font-semibold">
                                                <Link href={`/patients/${result.patientId}`} className="text-primary hover:underline">{result.patientName}</Link>
                                                <span className="text-sm font-normal text-muted-foreground"> on {format(parseISO(result.visitDate), 'PPP')}</span>
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
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary"/>Internal Staff Messaging</CardTitle>
                        <CardDescription>Secure messaging between clinic staff members.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/40">
                             <p className="text-muted-foreground">Staff Chat (Planned Feature)</p>
                        </div>
                        <Button className="w-full" onClick={() => handleAction('Internal Messaging')} disabled>
                            <Send className="mr-2 h-4 w-4"/>Send Internal Message
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center"><Mail className="mr-2 h-5 w-5 text-primary"/>AI Patient Outreach</CardTitle>
                        <CardDescription>Generate and send messages to patients.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Select onValueChange={setSelectedPatientId} value={selectedPatientId} disabled={patientsLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Patient..." />
                            </SelectTrigger>
                            <SelectContent>
                                {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input 
                            placeholder="Message context, e.g., 'Dietary reminder'"
                            value={messageContext}
                            onChange={(e) => setMessageContext(e.target.value)}
                        />
                         <Button className="w-full" onClick={handleGenerateMessage} disabled={isGeneratingMessage || !selectedPatientId || !messageContext}>
                            {isGeneratingMessage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
                            Generate Message
                        </Button>
                        {generatedMessage && (
                            <Textarea value={generatedMessage} readOnly rows={4} className="bg-muted"/>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Health Feeds</CardTitle>
                        <CardDescription>Send PDF or image files to patient groups (e.g., educational material).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/40">
                            <p className="text-muted-foreground text-center">Health Feed upload area<br/>(Planned Feature)</p>
                        </div>
                        <div className="flex gap-2">
                            <Button className="flex-1" onClick={() => handleAction('Send Image')} disabled><FileImage className="mr-2 h-4 w-4"/>Send Image</Button>
                            <Button className="flex-1" onClick={() => handleAction('Send PDF')} disabled><FileTextIcon className="mr-2 h-4 w-4"/>Send PDF</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
