"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, SkipForward } from "lucide-react";
import { ClinicalVisitDetails } from "./ClinicalVisitDetails";
import type { Visit } from "@/lib/types";

interface ClinicalDetailsFormProps {
    visitId: string;
    patientId: string;
    patientGender: string;
    onSubmit: (data: any) => void;
    onBack: () => void;
    onSkip: () => void;
}

export function ClinicalDetailsForm({
    visitId,
    patientId,
    patientGender,
    onSubmit,
    onBack,
    onSkip,
}: ClinicalDetailsFormProps) {
    // Create a minimal visit object for the ClinicalVisitDetails component
    const visit: Visit = {
        id: visitId,
        patientId: patientId,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        visitType: "Routine",
        visitRemark: "",
        groupName: "",
        diagnoses: [],
        clinicalData: undefined,
        patientGender: (patientGender as "Male" | "Female") || "Male",
    };

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Step 2:</strong> Add clinical details for this visit. You can fill in as much or as little as needed right now.
                    All fields are optional and can be updated later.
                </p>
            </div>

            {/* Clinical Details Form */}
            <ClinicalVisitDetails visit={visit} onSaveComplete={onSubmit} />

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
                <Button type="button" variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Visit Info
                </Button>

                <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={onSkip}>
                        <SkipForward className="mr-2 h-4 w-4" />
                        Skip for Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
