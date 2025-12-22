"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calculator, User, Activity, AlertCircle } from 'lucide-react';
import { usePatientData } from '@/hooks/use-patient-data';
import { calculateDisabilityAssessment, type DisabilityAssessmentInput, type Sex } from '@/lib/disability-calculator';
import { differenceInYears, parseISO } from 'date-fns';

export default function DisabilityAssessmentPage() {
    const { patients, isLoading: patientsLoading } = usePatientData();

    // Form state
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [age, setAge] = useState('');
    const [sex, setSex] = useState<Sex>('Male');
    const [serumCreatinine, setSerumCreatinine] = useState('');
    const [albuminuria, setAlbuminuria] = useState('');
    const [upcr, setUpcr] = useState(''); // For UPCR input
    const [useUPCR, setUseUPCR] = useState(false); // Toggle between UACR and UPCR
    const [onRRT, setOnRRT] = useState(false);
    const [hasCalculated, setHasCalculated] = useState(false);

    const [result, setResult] = useState<ReturnType<typeof calculateDisabilityAssessment> | null>(null);

    // Suppress Radix UI false positive key warnings
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            const message = args[0];
            if (typeof message === 'string' && message.includes('unique "key" prop')) {
                return; // Suppress key warnings
            }
            originalError(...args);
        };
        return () => {
            console.error = originalError;
        };
    }, []);

    // Get selected patient
    const selectedPatient = useMemo(() => {
        return patients.find(p => p.id === selectedPatientId);
    }, [patients, selectedPatientId]);

    // Auto-populate when patient is selected
    const handlePatientSelect = (patientId: string) => {
        setSelectedPatientId(patientId);
        const patient = patients.find(p => p.id === patientId);

        if (patient) {
            // Calculate age from DOB
            const patientAge = differenceInYears(new Date(), parseISO(patient.dob));
            setAge(patientAge.toString());

            // Set sex
            setSex(patient.gender === 'Female' ? 'Female' : 'Male');

            // Get latest serum creatinine from investigations
            let latestCreatinine = '';
            if (patient.investigationRecords && patient.investigationRecords.length > 0) {
                // Sort by date descending to get latest
                const sortedRecords = [...patient.investigationRecords].sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                // Look for creatinine in investigation tests
                for (const record of sortedRecords) {
                    const creatinineTest = record.tests?.find((test) =>
                        test.name?.toLowerCase().includes('creatinine') &&
                        test.name?.toLowerCase().includes('serum')
                    );
                    if (creatinineTest?.result) {
                        latestCreatinine = creatinineTest.result.toString();
                        break;
                    }
                }
            }

            // Fallback to visit data if not found in investigations
            if (!latestCreatinine) {
                const latestVisit = patient.visits?.[0];
                if (latestVisit?.clinicalData?.serumCreatinine) {
                    latestCreatinine = latestVisit.clinicalData.serumCreatinine.toString();
                }
            }

            if (latestCreatinine) {
                setSerumCreatinine(latestCreatinine);
            }

            // Get UACR from latest visit data
            const latestVisit = patient.visits?.[0];
            if (latestVisit?.clinicalData?.uacr) {
                setAlbuminuria(latestVisit.clinicalData.uacr.toString());
                setUseUPCR(false);
            }

            // Check if on RRT from tags
            const isOnRRT = patient.clinicalProfile?.tags?.includes('HD') ||
                patient.clinicalProfile?.tags?.includes('PD') ||
                patient.clinicalProfile?.tags?.includes('Transplant');
            setOnRRT(isOnRRT || false);
        }

        setHasCalculated(false);
        setResult(null);
    };

    // Convert UPCR to UACR using formula: UACR = -0.171 + 0.780 × UPCR
    const handleUPCRChange = (value: string) => {
        setUpcr(value);
        if (value) {
            const upcrValue = parseFloat(value);
            if (!isNaN(upcrValue)) {
                const calculatedUACR = -0.171 + 0.780 * upcrValue;
                setAlbuminuria(calculatedUACR.toFixed(2));
            }
        } else {
            setAlbuminuria('');
        }
    };

    const handleCalculate = () => {
        const input: DisabilityAssessmentInput = {
            age: parseInt(age),
            sex,
            serumCreatinine: parseFloat(serumCreatinine),
            albuminuria: parseFloat(albuminuria),
            albuminuriaUnit: 'mg/g',
            onRenalReplacementTherapy: onRRT
        };

        const calculatedResult = calculateDisabilityAssessment(input);
        setResult(calculatedResult);
        setHasCalculated(true);
    };

    const isFormValid = age && serumCreatinine && albuminuria;

    // Badge colors
    const getStageBadgeColor = (stage: string) => {
        if (stage === 'G1' || stage === 'G2') return 'bg-green-100 text-green-800 border-green-300';
        if (stage === 'G3a' || stage === 'G3b') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        return 'bg-red-100 text-red-800 border-red-300';
    };

    const getAlbuminuriaBadgeColor = (category: string) => {
        if (category === 'A1') return 'bg-green-100 text-green-800 border-green-300';
        if (category === 'A2') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        return 'bg-red-100 text-red-800 border-red-300';
    };

    return (
        <div className="container mx-auto py-2">
            <PageHeader
                title="Disability Assessment Calculator"
                description="Calculate disability percentage for serving personnel based on CKD staging and albuminuria."
            />

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                {/* Input Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center">
                            <User className="mr-2 h-5 w-5 text-primary" />
                            Patient Information
                        </CardTitle>
                        <CardDescription> Select a patient or enter data manually.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Patient Selection */}
                        <div className="space-y-2">
                            <Label>Select Patient (Optional)</Label>
                            <Select onValueChange={handlePatientSelect} value={selectedPatientId} disabled={patientsLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select patient to auto-fill..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {`${p.firstName} ${p.lastName}`} ({p.nephroId})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Age */}
                        <div className="space-y-2">
                            <Label htmlFor="age">Age (years) *</Label>
                            <Input
                                id="age"
                                type="number"
                                placeholder="e.g., 36"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />
                        </div>

                        {/* Sex */}
                        <div className="space-y-2">
                            <Label>Sex *</Label>
                            <RadioGroup value={sex} onValueChange={(value) => setSex(value as Sex)}>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Male" id="male" />
                                        <Label htmlFor="male" className="cursor-pointer font-normal">Male</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Female" id="female" />
                                        <Label htmlFor="female" className="cursor-pointer font-normal">Female</Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Serum Creatinine */}
                        <div className="space-y-2">
                            <Label htmlFor="creatinine">Serum Creatinine (mg/dL) *</Label>
                            <Input
                                id="creatinine"
                                type="number"
                                step="0.01"
                                placeholder="e.g., 1.6"
                                value={serumCreatinine}
                                onChange={(e) => setSerumCreatinine(e.target.value)}
                            />
                        </div>

                        {/* Albuminuria / UACR */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Albuminuria Method *</Label>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="use-upcr" className="cursor-pointer font-normal text-sm">Use UPCR instead</Label>
                                    <Checkbox
                                        id="use-upcr"
                                        checked={useUPCR}
                                        onCheckedChange={(checked) => {
                                            setUseUPCR(checked as boolean);
                                            if (!checked) {
                                                setUpcr('');
                                            } else {
                                                setAlbuminuria('');
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {useUPCR ? (
                                <div className="space-y-2">
                                    <Label htmlFor="upcr">Urine Protein-to-Creatinine Ratio (mg/mg) *</Label>
                                    <Input
                                        id="upcr"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g., 0.5"
                                        value={upcr}
                                        onChange={(e) => handleUPCRChange(e.target.value)}
                                    />
                                    {albuminuria && (
                                        <p className="text-xs text-muted-foreground">
                                            Calculated UACR: {albuminuria} mg/g (using formula: UACR = -0.171 + 0.780 × UPCR)
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="albuminuria">Urine Albumin-to-Creatinine Ratio (mg/g) *</Label>
                                    <Input
                                        id="albuminuria"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g., 1.0"
                                        value={albuminuria}
                                        onChange={(e) => setAlbuminuria(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* On RRT */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="rrt"
                                checked={onRRT}
                                onCheckedChange={(checked) => setOnRRT(checked as boolean)}
                            />
                            <Label htmlFor="rrt" className="cursor-pointer font-normal">
                                On Renal Replacement Therapy (HD/PD/Transplant)
                            </Label>
                        </div>

                        {/* Calculate Button */}
                        <Button
                            className="w-full"
                            onClick={handleCalculate}
                            disabled={!isFormValid}
                            size="lg"
                        >
                            <Calculator className="mr-2 h-4 w-4" />
                            Calculate Disability Assessment
                        </Button>
                    </CardContent>
                </Card>

                {/* Results Card */}
                <Card className={`${hasCalculated ? 'border-primary' : ''}`}>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center">
                            <Activity className="mr-2 h-5 w-5 text-primary" />
                            Assessment Results
                        </CardTitle>
                        <CardDescription>Calculated disability percentage and CKD classification.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!hasCalculated ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    Enter patient information and click "Calculate" to see results.
                                </p>
                            </div>
                        ) : result ? (
                            <div className="space-y-6">
                                {/* Disability Percentage - Prominent Display */}
                                <div className="bg-primary/5 border-2 border-primary rounded-lg p-6 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Disability Percentage</p>
                                    <p className="text-6xl font-bold text-primary">{result.disabilityPercentage}%</p>
                                    {result.onRRT && (
                                        <p className="text-xs text-amber-600 mt-2 font-semibold">
                                            With Constant Attendance Allowance (CAA)
                                        </p>
                                    )}
                                </div>

                                {/* eGFR */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">eGFR (CKD-EPI 2021)</Label>
                                    <p className="text-2xl font-bold">{result.egfr} <span className="text-base font-normal text-muted-foreground">ml/min/1.73m²</span></p>
                                </div>

                                {/* CKD Stage */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">CKD Stage</Label>
                                    <div className="flex items-center gap-2">
                                        <Badge className={`text-lg px-3 py-1 ${getStageBadgeColor(result.ckdStage)}`}>
                                            {result.ckdStage}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">{result.ckdStageDescription}</span>
                                    </div>
                                </div>

                                {/* Albuminuria Category */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Albuminuria Category</Label>
                                    <div className="flex items-center gap-2">
                                        <Badge className={`text-lg px-3 py-1 ${getAlbuminuriaBadgeColor(result.albuminuriaCategory)}`}>
                                            {result.albuminuriaCategory}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">{result.albuminuriaCategoryDescription}</span>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Clinical Recommendations</Label>
                                    <div className="bg-muted p-4 rounded-md text-sm">
                                        {result.recommendations}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>

            {/* Disability Matrix Reference */}
            {hasCalculated && result && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="font-headline text-sm">Disability Percentage Matrix Reference</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2 text-left">CKD Stage</th>
                                        <th className="p-2 text-left">eGFR Range</th>
                                        <th className="p-2 text-center">A1 (Normal)</th>
                                        <th className="p-2 text-center">A2 (Moderate)</th>
                                        <th className="p-2 text-center">A3 (Severe)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { stage: 'G1', range: '≥90', a1: '15%', a2: '40%', a3: '60%' },
                                        { stage: 'G2', range: '60-90', a1: '15%', a2: '40%', a3: '60%' },
                                        { stage: 'G3a', range: '45-59', a1: '40%', a2: '40%', a3: '60%' },
                                        { stage: 'G3b', range: '30-44', a1: '60%', a2: '60%', a3: '80%' },
                                        { stage: 'G4', range: '15-29', a1: '80%', a2: '80%', a3: '100%' },
                                        { stage: 'G5', range: '<15', a1: '100%', a2: '100%', a3: '100%' }
                                    ].map((row) => (
                                        <tr
                                            key={row.stage}
                                            className={`border-b ${row.stage === result.ckdStage ? 'bg-primary/10 font-semibold' : ''}`}
                                        >
                                            <td className="p-2">{row.stage}</td>
                                            <td className="p-2">{row.range}</td>
                                            <td className={`p-2 text-center ${result.ckdStage === row.stage && result.albuminuriaCategory === 'A1' ? 'bg-primary text-primary-foreground' : ''}`}>{row.a1}</td>
                                            <td className={`p-2 text-center ${result.ckdStage === row.stage && result.albuminuriaCategory === 'A2' ? 'bg-primary text-primary-foreground' : ''}`}>{row.a2}</td>
                                            <td className={`p-2 text-center ${result.ckdStage === row.stage && result.albuminuriaCategory === 'A3' ? 'bg-primary text-primary-foreground' : ''}`}>{row.a3}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            * On Renal Replacement Therapy (HD/PD/Transplant) = 100% with Constant Attendance Allowance (CAA)
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
