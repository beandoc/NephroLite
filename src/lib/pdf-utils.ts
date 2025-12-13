import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { DischargeSummaryDocument } from '@/components/pdf/discharge-summary/DischargeSummaryDocument';
import type { Patient, Visit } from '@/lib/types';

/**
 * Generate PDF blob from patient and visit data
 */
export async function generateDischargeSummaryPDF(
    patient: Patient,
    visit: Visit,
    options?: {
        hospitalInfo?: {
            name: string;
            address: string;
            phone?: string;
            email?: string;
        };
        doctorInfo?: {
            name: string;
            qualification?: string;
        };
    }
): Promise<Blob> {
    const doc = React.createElement(DischargeSummaryDocument, {
        patient,
        visit,
        hospitalInfo: options?.hospitalInfo,
        doctorInfo: options?.doctorInfo,
    });

    const blob = await pdf(doc as any).toBlob();
    return blob;
}

/**
 * Download PDF to user's device
 */
export function downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate filename for discharge summary
 */
export function generateFilename(patient: Patient, visit: Visit): string {
    const patientName = `${patient.firstName}_${patient.lastName}`.replace(/\s+/g, '_');
    const date = visit.date.replace(/\//g, '-');
    return `Discharge_Summary_${patientName}_${date}.pdf`;
}

/**
 * Generate and download discharge summary in one step
 */
export async function generateAndDownloadDischargeSummary(
    patient: Patient,
    visit: Visit,
    options?: {
        hospitalInfo?: {
            name: string;
            address: string;
            phone?: string;
            email?: string;
        };
        doctorInfo?: {
            name: string;
            qualification?: string;
        };
    }
): Promise<void> {
    try {
        const blob = await generateDischargeSummaryPDF(patient, visit, options);
        const filename = generateFilename(patient, visit);
        downloadPDF(blob, filename);
    } catch (error) {
        console.error('Error generating discharge summary:', error);
        throw new Error('Failed to generate discharge summary PDF');
    }
}

/**
 * Open PDF in new tab for preview
 */
export async function previewDischargeSummary(
    patient: Patient,
    visit: Visit,
    options?: {
        hospitalInfo?: {
            name: string;
            address: string;
            phone?: string;
            email?: string;
        };
        doctorInfo?: {
            name: string;
            qualification?: string;
        };
    }
): Promise<void> {
    try {
        const blob = await generateDischargeSummaryPDF(patient, visit, options);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');

        // Clean up URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
        console.error('Error previewing discharge summary:', error);
        throw new Error('Failed to preview discharge summary PDF');
    }
}
