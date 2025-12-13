"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Patient } from '@/lib/types';
import { BasicVisitForm } from './basic-visit-form';
import { ClinicalDetailsForm } from './clinical-details-form';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from '@/hooks/use-toast';

interface CreateVisitWizardProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient;
    onVisitCreated?: (patientId: string, visitId: string) => void;
}

export function CreateVisitWizard({
    isOpen,
    onOpenChange,
    patient,
    onVisitCreated,
}: CreateVisitWizardProps) {
    const [step, setStep] = useState(1);
    const [visitData, setVisitData] = useState<any>(null);
    const [createdVisitId, setCreatedVisitId] = useState<string | null>(null);
    const { addVisitToPatient, updateVisitData } = usePatientData();
    const { toast } = useToast();

    const progress = step === 1 ? 50 : 100;

    const handleBasicInfoComplete = async (data: any) => {
        try {
            // Create the visit with basic info
            const visitId = crypto.randomUUID();

            await addVisitToPatient(patient.id, {
                ...data,
                id: visitId,
            });

            setVisitData(data);
            setCreatedVisitId(visitId);
            setStep(2);

            toast({
                title: "Visit Created",
                description: "Now add clinical details for this visit.",
            });
        } catch (error) {
            console.error('Error creating visit:', error);
            toast({
                title: "Error",
                description: "Failed to create visit. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleClinicalDetailsComplete = async (clinicalData: any) => {
        if (!createdVisitId) return;

        try {
            await updateVisitData(patient.id, createdVisitId, clinicalData);

            toast({
                title: "Visit Complete",
                description: "Clinical details have been saved successfully.",
            });

            onVisitCreated?.(patient.id, createdVisitId);
            handleClose();
        } catch (error) {
            console.error('Error saving clinical data:', error);
            toast({
                title: "Error",
                description: "Failed to save clinical details. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleSkip = () => {
        toast({
            title: "Visit Created",
            description: "You can add clinical details later from the visit history.",
        });
        onVisitCreated?.(patient.id, createdVisitId!);
        handleClose();
    };

    const handleClose = () => {
        setStep(1);
        setVisitData(null);
        setCreatedVisitId(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Create New Visit for {patient.firstName} {patient.lastName}
                    </DialogTitle>
                    <DialogDescription>
                        Step {step} of 2: {step === 1 ? 'Basic Visit Information' : 'Clinical Details'}
                    </DialogDescription>
                    <Progress value={progress} className="mt-2" />
                </DialogHeader>

                <div className="mt-6">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-6 gap-4">
                        <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-primary text-white' : step > 1 ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                                {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                            </div>
                            <span>Visit Info</span>
                        </div>

                        <div className="w-12 h-px bg-border" />

                        <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
                                2
                            </div>
                            <span>Clinical Details</span>
                        </div>
                    </div>

                    {/* Step Content */}
                    {step === 1 ? (
                        <BasicVisitForm
                            patient={patient}
                            onSubmit={handleBasicInfoComplete}
                            onCancel={handleClose}
                        />
                    ) : (
                        <ClinicalDetailsForm
                            visitId={createdVisitId!}
                            patientId={patient.id}
                            patientGender={patient.gender}
                            onSubmit={handleClinicalDetailsComplete}
                            onBack={() => setStep(1)}
                            onSkip={handleSkip}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
