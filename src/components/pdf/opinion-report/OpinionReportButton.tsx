"use client";

import { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Button, ButtonProps } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Eye } from 'lucide-react';
import { OpinionReport } from './OpinionReport';
import type { Patient, Visit } from '@/lib/types';

interface OpinionReportButtonProps extends ButtonProps {
    patient: Patient;
    visit: Visit;
}

export const OpinionReportButton = ({ patient, visit, ...buttonProps }: OpinionReportButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const fileName = `Opinion_Report_${patient.firstName}_${patient.lastName}_${visit.date}.pdf`;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button {...buttonProps}>
                    <Eye className="mr-2 h-4 w-4" />
                    Opinion Report
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Opinion Report Preview</DialogTitle>
                    <DialogDescription>
                        {patient.firstName} {patient.lastName} - {visit.date}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden h-[calc(90vh-120px)]">
                    <PDFViewer width="100%" height="100%" className="border-0">
                        <OpinionReport patient={patient} visit={visit} />
                    </PDFViewer>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Close
                    </Button>
                    <PDFDownloadLink
                        document={<OpinionReport patient={patient} visit={visit} />}
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
