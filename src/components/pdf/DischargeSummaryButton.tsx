import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { DischargeSummary } from './discharge-summary/DischargeSummary';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Patient, Visit } from '@/lib/types';

interface DischargeSummaryButtonProps {
    patient: Patient;
    visit: Visit;
    disabled?: boolean;
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

export const DischargeSummaryButton: React.FC<DischargeSummaryButtonProps> = ({
    patient,
    visit,
    disabled = false,
    variant = "default",
    size = "default"
}) => {
    const fileName = `Discharge_Summary_${patient.nephroId}_${new Date().toISOString().split('T')[0]}.pdf`;

    return (
        <PDFDownloadLink
            document={<DischargeSummary patient={patient} visit={visit} />}
            fileName={fileName}
        >
            {({ loading }) => (
                <Button disabled={disabled || loading} variant={variant} size={size}>
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? 'Generating...' : 'Discharge Summary'}
                </Button>
            )}
        </PDFDownloadLink>
    );
};
