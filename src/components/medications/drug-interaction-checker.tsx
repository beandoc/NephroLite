"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, ShieldAlert, Info, CheckCircle2, Pill } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkDrugInteractionsAction } from '@/lib/actions';
import type { CheckDrugInteractionsInput, CheckDrugInteractionsOutput } from '@/ai/flows/check-drug-interactions';

interface DrugInteractionCheckerProps {
    medications: Array<{
        name: string;
        dosage?: string;
        route?: string;
    }>;
    patientAllergies?: string[];
    egfr?: number;
    age?: number;
    onComplete?: (result: CheckDrugInteractionsOutput) => void;
}

export function DrugInteractionChecker({
    medications,
    patientAllergies,
    egfr,
    age,
    onComplete,
}: DrugInteractionCheckerProps) {
    const [result, setResult] = useState<CheckDrugInteractionsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCheck = async () => {
        if (medications.length === 0) {
            toast({
                title: "No Medications",
                description: "Please add at least one medication to check.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const input: CheckDrugInteractionsInput = {
                medications,
                patientAllergies,
                egfr,
                age,
            };

            const response = await checkDrugInteractionsAction(input);

            if (response.success && response.data) {
                setResult(response.data);
                onComplete?.(response.data);

                toast({
                    title: "Analysis Complete",
                    description: `Found ${response.data.interactions.length} interaction(s)`,
                });
            } else {
                toast({
                    title: "Check Failed",
                    description: response.error || "Unknown error occurred",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Drug interaction check error:', error);
            toast({
                title: "Error",
                description: "Failed to check drug interactions. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Severe':
                return 'destructive';
            case 'Moderate':
                return 'default';
            case 'Minor':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'Severe':
                return <ShieldAlert className="h-4 w-4" />;
            case 'Moderate':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Drug Interaction Checker
                </CardTitle>
                <CardDescription>
                    AI-powered analysis of medication interactions and renal dosing
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Medication Summary */}
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Medications to Check ({medications.length})</h3>
                    <div className="flex flex-wrap gap-2">
                        {medications.map((med, idx) => (
                            <Badge key={idx} variant="outline">
                                {med.name}
                                {med.dosage && ` - ${med.dosage}`}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Patient Context */}
                {(patientAllergies || egfr || age) && (
                    <div className="text-sm text-muted-foreground space-y-1">
                        {egfr && <p>• eGFR: {egfr} mL/min/1.73m²</p>}
                        {age && <p>• Age: {age} years</p>}
                        {patientAllergies && patientAllergies.length > 0 && (
                            <p>• Allergies: {patientAllergies.join(', ')}</p>
                        )}
                    </div>
                )}

                {/* Check Button */}
                <Button
                    onClick={handleCheck}
                    disabled={isLoading || medications.length === 0}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        'Check for Interactions'
                    )}
                </Button>

                {/* Results */}
                {result && (
                    <div className="space-y-4 mt-6">
                        {/* Overall Summary */}
                        <Alert variant={result.overallRisk === 'Severe' ? 'destructive' : 'default'}>
                            <AlertTitle className="flex items-center gap-2">
                                {result.overallRisk === 'None' ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    getSeverityIcon(result.overallRisk)
                                )}
                                Overall Risk: {result.overallRisk}
                            </AlertTitle>
                            <AlertDescription>{result.summary}</AlertDescription>
                        </Alert>

                        {/* Drug-Drug Interactions */}
                        {result.interactions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm">Drug-Drug Interactions</h3>
                                {result.interactions.map((interaction, idx) => (
                                    <Alert key={idx} variant={interaction.severity === 'Severe' ? 'destructive' : 'default'}>
                                        <div className="flex items-start gap-2">
                                            {getSeverityIcon(interaction.severity)}
                                            <div className="flex-1 space-y-1">
                                                <AlertTitle className="text-sm">
                                                    <Badge variant={getSeverityColor(interaction.severity)} className="mr-2">
                                                        {interaction.severity}
                                                    </Badge>
                                                    {interaction.drug1} + {interaction.drug2}
                                                </AlertTitle>
                                                <AlertDescription className="text-xs space-y-1">
                                                    <p><strong>Interaction:</strong> {interaction.description}</p>
                                                    {interaction.mechanism && (
                                                        <p><strong>Mechanism:</strong> {interaction.mechanism}</p>
                                                    )}
                                                    <p><strong>Recommendation:</strong> {interaction.recommendation}</p>
                                                </AlertDescription>
                                            </div>
                                        </div>
                                    </Alert>
                                ))}
                            </div>
                        )}

                        {/* Allergy Warnings */}
                        {result.allergyWarnings && result.allergyWarnings.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-destructive">Allergy Warnings</h3>
                                {result.allergyWarnings.map((warning, idx) => (
                                    <Alert key={idx} variant="destructive">
                                        <ShieldAlert className="h-4 w-4" />
                                        <AlertTitle className="text-sm">
                                            {warning.medication} - {warning.allergen}
                                        </AlertTitle>
                                        <AlertDescription className="text-xs">
                                            <p><strong>Severity:</strong> {warning.severity}</p>
                                            <p><strong>Action:</strong> {warning.recommendation}</p>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        )}

                        {/* Renal Adjustments */}
                        {result.renalAdjustments && result.renalAdjustments.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-amber-600">Renal Dose Adjustments</h3>
                                {result.renalAdjustments.map((adjustment, idx) => (
                                    <Alert key={idx} className="border-amber-200 bg-amber-50">
                                        <Info className="h-4 w-4 text-amber-600" />
                                        <AlertTitle className="text-sm text-amber-900">
                                            {adjustment.medication}
                                        </AlertTitle>
                                        <AlertDescription className="text-xs text-amber-800 space-y-1">
                                            {adjustment.currentDose && (
                                                <p><strong>Current Dose:</strong> {adjustment.currentDose}</p>
                                            )}
                                            <p><strong>Recommendation:</strong> {adjustment.recommendedAction}</p>
                                            {adjustment.egfrThreshold && (
                                                <p><strong>eGFR Threshold:</strong> {adjustment.egfrThreshold}</p>
                                            )}
                                            <p><strong>Rationale:</strong> {adjustment.rationale}</p>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        )}

                        {/* No Issues Found */}
                        {result.interactions.length === 0 &&
                            (!result.allergyWarnings || result.allergyWarnings.length === 0) &&
                            (!result.renalAdjustments || result.renalAdjustments.length === 0) && (
                                <Alert>
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-green-700">No Issues Found</AlertTitle>
                                    <AlertDescription>
                                        No significant drug interactions, allergy conflicts, or renal adjustments were identified.
                                    </AlertDescription>
                                </Alert>
                            )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
