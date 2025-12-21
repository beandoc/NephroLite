"use client";

import { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Button, ButtonProps } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Eye } from 'lucide-react';
import { DischargeSummary } from './discharge-summary/DischargeSummary';
import type { Patient, Visit } from '@/lib/types';

interface DischargeSummaryButtonProps extends ButtonProps {
    patient: Patient;
    visit: Visit;
}

export const DischargeSummaryButton = ({ patient, visit, ...buttonProps }: DischargeSummaryButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const fileName = `Discharge_Summary_${patient.firstName}_${patient.lastName}_${visit.date}.pdf`;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button {...buttonProps}>
                    <Eye className="mr-2 h-4 w-4" />
                    Discharge Summary
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Discharge Summary Preview</DialogTitle>
                    <DialogDescription>
                        {patient.firstName} {patient.lastName} - {visit.date}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden h-[calc(90vh-120px)]">
                    <PDFViewer width="100%" height="100%" className="border-0">
                        <DischargeSummary patient={patient} visit={visit} />
                    </PDFViewer>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Close
                    </Button>
                    <PDFDownloadLink
                        document={<DischargeSummary patient={patient} visit={visit} />}
                        fileName={fileName}
                    >
                        {({ loading }) => (
                            <Button disabled={loading}>
                                <Download className="mr-2 h-4 w-4" />
                                {loading ? 'Generating...' : 'Download PDF'}
                            </Button>
                        )}
                    </PDFDownloadLink>
                </div>
            </DialogContent>
        </Dialog>
    );
};
