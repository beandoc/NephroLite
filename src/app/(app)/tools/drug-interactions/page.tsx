"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DrugInteractionChecker } from '@/components/medications/drug-interaction-checker';
import { Pill, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Medication {
    name: string;
    dosage: string;
    route: string;
}

export default function DrugInteractionTestPage() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [currentMed, setCurrentMed] = useState({ name: '', dosage: '', route: '' });
    const [allergies, setAllergies] = useState<string[]>([]);
    const [currentAllergy, setCurrentAllergy] = useState('');
    const [egfr, setEgfr] = useState<number | undefined>();
    const [age, setAge] = useState<number | undefined>();

    const addMedication = () => {
        if (currentMed.name.trim()) {
            setMedications([...medications, currentMed]);
            setCurrentMed({ name: '', dosage: '', route: '' });
        }
    };

    const removeMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const addAllergy = () => {
        if (currentAllergy.trim() && !allergies.includes(currentAllergy.trim())) {
            setAllergies([...allergies, currentAllergy.trim()]);
            setCurrentAllergy('');
        }
    };

    const removeAllergy = (allergy: string) => {
        setAllergies(allergies.filter(a => a !== allergy));
    };

    // Sample data for quick testing
    const loadSampleData = () => {
        setMedications([
            { name: 'Lisinopril', dosage: '10mg daily', route: 'PO' },
            { name: 'Metformin', dosage: '500mg BID', route: 'PO' },
            { name: 'Ibuprofen', dosage: '400mg PRN', route: 'PO' },
        ]);
        setAllergies(['Penicillin']);
        setEgfr(45);
        setAge(65);
    };

    return (
        <div className="container mx-auto py-2 space-y-6">
            <PageHeader
                title="Drug Interaction Checker"
                description="AI-powered medication interaction analysis with renal dosing guidance"
                backHref="/dashboard"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Medications</CardTitle>
                            <CardDescription>Enter patient medications to check for interactions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Medication Input */}
                            <div className="space-y-2">
                                <Label>Medication Name *</Label>
                                <Input
                                    placeholder="e.g., Lisinopril"
                                    value={currentMed.name}
                                    onChange={(e) => setCurrentMed({ ...currentMed, name: e.target.value })}
                                    onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Dosage</Label>
                                    <Input
                                        placeholder="e.g., 10mg daily"
                                        value={currentMed.dosage}
                                        onChange={(e) => setCurrentMed({ ...currentMed, dosage: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Route</Label>
                                    <Input
                                        placeholder="e.g., PO"
                                        value={currentMed.route}
                                        onChange={(e) => setCurrentMed({ ...currentMed, route: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button onClick={addMedication} className="w-full" disabled={!currentMed.name}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Medication
                            </Button>

                            {/* Medications List */}
                            {medications.length > 0 && (
                                <div className="space-y-2 pt-2 border-t">
                                    <Label>Current Medications ({medications.length})</Label>
                                    <div className="space-y-2">
                                        {medications.map((med, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{med.name}</p>
                                                    {med.dosage && <p className="text-xs text-muted-foreground">{med.dosage}</p>}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeMedication(idx)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                            <CardDescription>Optional context for more accurate analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Allergies */}
                            <div className="space-y-2">
                                <Label>Known Allergies</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g., Penicillin"
                                        value={currentAllergy}
                                        onChange={(e) => setCurrentAllergy(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                                    />
                                    <Button onClick={addAllergy} disabled={!currentAllergy}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {allergies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {allergies.map((allergy, idx) => (
                                            <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeAllergy(allergy)}>
                                                {allergy}
                                                <X className="h-3 w-3 ml-1" />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* eGFR */}
                            <div className="space-y-2">
                                <Label>eGFR (mL/min/1.73m²)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 45"
                                    value={egfr || ''}
                                    onChange={(e) => setEgfr(e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </div>

                            {/* Age */}
                            <div className="space-y-2">
                                <Label>Patient Age</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 65"
                                    value={age || ''}
                                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </div>

                            <Button onClick={loadSampleData} variant="outline" className="w-full">
                                Load Sample Data
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Checker Component */}
                <div>
                    <DrugInteractionChecker
                        medications={medications}
                        patientAllergies={allergies}
                        egfr={egfr}
                        age={age}
                    />
                </div>
            </div>
        </div>
    );
}
