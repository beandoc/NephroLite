import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { OpinionReport } from './OpinionReport';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Patient, Visit } from '@/lib/types';

interface OpinionReportButtonProps {
    patient: Patient;
    visit: Visit;
    disabled?: boolean;
}

export const OpinionReportButton: React.FC<OpinionReportButtonProps> = ({
    patient,
    visit,
    disabled = false
}) => {
    const fileName = `Opinion_Report_${patient.nephroId}_${new Date().toISOString().split('T')[0]}.pdf`;

    return (
        <PDFDownloadLink
            document={<OpinionReport patient={patient} visit={visit} />}
            fileName={fileName}
        >
            {({ loading }) => (
                <Button disabled={disabled || loading} variant="default">
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? 'Generating...' : 'Opinion Report'}
                </Button>
            )}
        </PDFDownloadLink>
    );
};
