"use client";

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, FileText, Activity, UserPlus, UserX, Search, X } from 'lucide-react';
import { usePatientData } from '@/hooks/use-patient-data';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Patient, Visit } from '@/lib/types';

interface TimelineEvent {
    id: string;
    type: 'visit' | 'admission' | 'discharge';
    date: string;
    title: string;
    description: string;
    details?: string;
    icon: any;
    colorClass: string;
}

export default function KeyEventLogPage() {
    const { patients, isLoading } = usePatientData();
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [isSearchActive, setIsSearchActive] = useState(false);

    // Boolean search function for diagnosis and tags
    const performBooleanSearch = (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearchActive(false);
            return;
        }

        const queryUpper = query.toUpperCase();

        // Split by AND/OR operators
        let terms: string[] = [];
        let operator: 'AND' | 'OR' = 'OR';

        if (queryUpper.includes(' AND ')) {
            terms = queryUpper.split(' AND ').map(t => t.trim());
            operator = 'AND';
        } else if (queryUpper.includes(' OR ')) {
            terms = queryUpper.split(' OR ').map(t => t.trim());
            operator = 'OR';
        } else {
            terms = [queryUpper];
        }

        const results = patients.filter(patient => {
            const allDiagnoses = patient.visits?.flatMap(v =>
                v.diagnoses?.map(d => d.name.toUpperCase()) || []
            ) || [];

            const allTags = patient.clinicalProfile?.tags?.map(t => t.toUpperCase()) || [];
            const searchableTerms = [...allDiagnoses, ...allTags];

            if (operator === 'AND') {
                return terms.every(term =>
                    searchableTerms.some(searchable => searchable.includes(term))
                );
            } else {
                return terms.some(term =>
                    searchableTerms.some(searchable => searchable.includes(term))
                );
            }
        });

        setSearchResults(results.filter(p => p.firstName && p.lastName));
        setIsSearchActive(true);
    };

    const handleSearch = () => {
        performBooleanSearch(searchQuery);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchActive(false);
        setSelectedPatientId('');
    };

    const selectedPatient = useMemo(() => {
        return patients.find(p => p.id === selectedPatientId);
    }, [patients, selectedPatientId]);

    // Build timeline events from patient data
    const timelineEvents = useMemo((): TimelineEvent[] => {
        if (!selectedPatient) return [];

        const events: TimelineEvent[] = [];

        // Add registration date as first event
        events.push({
            id: `registration-${selectedPatient.id}`,
            type: 'visit',
            date: selectedPatient.createdAt || selectedPatient.dob, // Use createdAt or DOB as fallback
            title: 'Patient Registration',
            description: `Registered as ${selectedPatient.nephroId}`,
            details: `Gender: ${selectedPatient.gender}, DOB: ${format(parseISO(selectedPatient.dob), 'PPP')}`,
            icon: UserPlus,
            colorClass: 'border-green-500 bg-green-50'
        });

        // Add visits
        selectedPatient.visits?.forEach(visit => {
            events.push({
                id: `visit-${visit.id}`,
                type: 'visit',
                date: visit.date,
                title: `${visit.visitType} Visit`,
                description: visit.visitRemark || 'No remarks recorded',
                details: visit.diagnoses?.map(d => d.name).join(', ') || 'No diagnoses recorded',
                icon: FileText,
                colorClass: 'border-blue-500 bg-blue-50'
            });
        });

        // Sort by date (most recent first)
        return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedPatient]);

    return (
        <div className="container mx-auto py-2">
            <PageHeader
                title="Key Event Log Summary"
                description="View significant patient events including visits, admissions, and discharges."
            />

            {/* Boolean Search */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center">
                        <Search className="mr-2 h-5 w-5 text-primary" />
                        Search Patients by Diagnosis & Tags
                    </CardTitle>
                    <CardDescription>
                        Use boolean operators (AND/OR) to find patients. Examples: "CKD AND DIABETES", "HD OR PD"
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                placeholder="e.g., CKD AND DIABETES  or  HD OR PD"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                        {isSearchActive && (
                            <Button variant="outline" onClick={clearSearch}>
                                <X className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>

                    {isSearchActive && (
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">
                                Search Results: {searchResults.length} patient{searchResults.length !== 1 ? 's' : ''} found
                            </Label>
                            {searchResults.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {searchResults.map(p => (
                                        <Button
                                            key={p.id}
                                            variant={selectedPatientId === p.id ? "default" : "outline"}
                                            className="justify-start"
                                            onClick={() => setSelectedPatientId(p.id)}
                                        >
                                            {`${p.firstName} ${p.lastName}`}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Patient Selection */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Select Patient</CardTitle>
                    <CardDescription>Choose a patient to view their event timeline.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={setSelectedPatientId} value={selectedPatientId} disabled={isLoading}>
                        <SelectTrigger className="w-full max-w-md">
                            <SelectValue placeholder="Select patient..." />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.filter(p => p.firstName && p.lastName).map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                    {`${p.firstName} ${p.lastName}`} ({p.nephroId})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Timeline Display */}
            {selectedPatient && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center">
                            <Activity className="mr-2 h-5 w-5 text-primary" />
                            Event Timeline for {selectedPatient.firstName} {selectedPatient.lastName}
                        </CardTitle>
                        <CardDescription>
                            Chronological record of all visits, admissions, and discharges
                            {timelineEvents.length > 0 && ` (${timelineEvents.length} events)`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {timelineEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No events recorded for this patient yet.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[600px] pr-4">
                                <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-[20px] top-0 bottom-0 w-0.5 bg-border" />

                                    {/* Events */}
                                    <div className="space-y-6">
                                        {timelineEvents.map((event) => {
                                            const Icon = event.icon;
                                            return (
                                                <div key={event.id} className="relative pl-12">
                                                    {/* Icon */}
                                                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-2 ${event.colorClass} flex items-center justify-center`}>
                                                        <Icon className="h-5 w-5 text-primary" />
                                                    </div>

                                                    {/* Event Card */}
                                                    <Card className={`border-l-4 ${event.colorClass}`}>
                                                        <CardContent className="pt-4 pb-4">
                                                            {/* Date and Time */}
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h3 className="font-semibold text-lg">{event.title}</h3>
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>{format(parseISO(event.date), 'PPP')}</span>
                                                                        <Clock className="h-3 w-3 ml-2" />
                                                                        <span>{format(parseISO(event.date), 'p')}</span>
                                                                    </div>
                                                                </div>
                                                                <Badge variant={
                                                                    event.type === 'visit' ? 'default' :
                                                                        event.type === 'admission' ? 'secondary' :
                                                                            'outline'
                                                                }>
                                                                    {event.type.toUpperCase()}
                                                                </Badge>
                                                            </div>

                                                            {/* Description */}
                                                            <p className="text-sm mb-2">
                                                                <span className="font-medium">Remarks: </span>
                                                                {event.description}
                                                            </p>

                                                            {/* Additional Details */}
                                                            {event.details && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    <span className="font-medium">Details: </span>
                                                                    {event.details}
                                                                </p>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Summary Stats */}
            {selectedPatient && timelineEvents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Visits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{timelineEvents.filter(e => e.type === 'visit').length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Admissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{timelineEvents.filter(e => e.type === 'admission').length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Discharges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{timelineEvents.filter(e => e.type === 'discharge').length}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
