import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Header } from './Header';
import { PatientInfo } from './PatientInfo';
import { ClinicalSummary } from './ClinicalSummary';
import { DiagnosesList } from './DiagnosesList';
import { MedicationsTable } from './MedicationsTable';
import { DischargeInstructions } from './DischargeInstructions';
import { Footer } from './Footer';
import { styles } from './styles';
import type { Visit, Patient } from '@/lib/types';

interface DischargeSummaryDocumentProps {
    patient: Patient;
    visit: Visit;
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

export function DischargeSummaryDocument({
    patient,
    visit,
    hospitalInfo,
    doctorInfo
}: DischargeSummaryDocumentProps) {
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    return (
        <Document
            title={`Discharge Summary - ${patient.firstName} ${patient.lastName}`}
            author={doctorInfo?.name || 'NephroLite Medical Center'}
            subject="Patient Discharge Summary"
        >
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <Header hospitalInfo={hospitalInfo} />

                {/* Patient Information */}
                <PatientInfo patient={patient} visit={visit} />

                {/* Clinical Summary (History, Vitals, Examination) */}
                <ClinicalSummary visit={visit} />

                {/* Diagnosis */}
                <DiagnosesList visit={visit} />

                {/* Medications */}
                {visit.clinicalData?.medications && visit.clinicalData.medications.length > 0 && (
                    <MedicationsTable medications={visit.clinicalData.medications} />
                )}

                {/* Discharge Instructions & Recommendations */}
                <DischargeInstructions visit={visit} />

                {/* Footer with Signature */}
                <Footer
                    doctorName={doctorInfo?.name}
                    doctorQualification={doctorInfo?.qualification}
                    date={currentDate}
                />

                {/* Page Number */}
                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
}
