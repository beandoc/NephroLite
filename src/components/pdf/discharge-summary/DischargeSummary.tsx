import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import type { Patient, Visit } from '@/lib/types';
import { format } from 'date-fns';

// Register fonts (optional, for better typography)
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Roboto',
    },
    nephroId: {
        fontSize: 9,
        marginBottom: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        textDecoration: 'underline',
    },
    subtitle: {
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#e0e0e0',
        padding: 6,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 8,
        border: '1pt solid #000',
    },
    table: {
        width: '100%',
        border: '1pt solid #000',
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1pt solid #000',
    },
    tableRowLast: {
        flexDirection: 'row',
    },
    tableCell: {
        padding: 5,
        fontSize: 10,
        borderRight: '1pt solid #000',
    },
    tableCellLast: {
        padding: 5,
        fontSize: 10,
    },
    tableCellBold: {
        padding: 5,
        fontSize: 10,
        fontWeight: 'bold',
        borderRight: '1pt solid #000',
    },
    textBlock: {
        padding: 10,
        fontSize: 10,
        lineHeight: 1.5,
        border: '1pt solid #000',
        marginBottom: 12,
        minHeight: 50,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerLeft: {
        fontSize: 10,
    },
    footerRight: {
        fontSize: 10,
        textAlign: 'right',
    },
});

interface DischargeSummaryProps {
    patient: Patient;
    visit: Visit;
    doctorName?: string;
    hospital?: string;
}

export const DischargeSummary: React.FC<DischargeSummaryProps> = ({
    patient,
    visit,
    doctorName = 'Lt Col SACHIN SRIVASTAVA',
    hospital = 'COMMAND HOSPITAL (SC)',
}) => {
    const clinicalData = visit.clinicalData || {};
    const age = patient.dob
        ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()}`
        : '';
    const relation = patient.guardian?.relation || 'SELF';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header - Nephro ID */}
                <Text style={styles.nephroId}>
                    Nephro Id:  {patient.nephroId}
                </Text>

                {/* Title */}
                <Text style={styles.title}>DISCHARGE SUMMARY</Text>

                {/* Doctor and Hospital Info */}
                <Text style={styles.subtitle}>
                    {doctorName}, Cl Spl Medicine and Nephrologist, {hospital}
                </Text>

                {/* Patient Particulars */}
                <Text style={styles.sectionTitle}>PATIENT'S PARTICULARS</Text>
                <View style={styles.table}>
                    {/* Row 1 */}
                    <View style={styles.tableRow}>
                        <View style={{ width: '60%' }}>
                            <Text style={styles.tableCellBold}>
                                Patient Name:  {patient.firstName} {patient.lastName}
                            </Text>
                        </View>
                        <View style={{ width: '40%' }}>
                            <Text style={styles.tableCellLast}>
                                Age/Sex:  {age} / {patient.gender === 'Male' ? 'Male' : patient.gender === 'Female' ? 'Female' : patient.gender}
                            </Text>
                        </View>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.tableRow}>
                        <View style={{ width: '60%' }}>
                            <Text style={styles.tableCellBold}>
                                Name:  {patient.firstName} {patient.lastName}
                            </Text>
                        </View>
                        <View style={{ width: '40%' }}>
                            <Text style={styles.tableCellLast}>
                                Relation:  {relation}
                            </Text>
                        </View>
                    </View>

                    {/* Row 3 */}
                    <View style={styles.tableRowLast}>
                        <View style={{ width: '33%' }}>
                            <Text style={styles.tableCellBold}>
                                Per's No:  {patient.serviceNumber || ''}
                            </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={styles.tableCell}>
                                Rank:  {patient.rank || ''}
                            </Text>
                        </View>
                        <View style={{ width: '34%' }}>
                            <Text style={styles.tableCellLast}>
                                Unit:  {patient.unitName || ''}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Summary Section */}
                <Text style={styles.sectionTitle}>SUMMARY</Text>
                <View style={styles.textBlock}>
                    <Text>
                        {clinicalData.history || clinicalData.courseInHospital || 'No summary available'}
                    </Text>
                </View>

                {/* Diagnosis Section */}
                <Text style={styles.sectionTitle}>DIAGNOSIS</Text>
                <View style={styles.textBlock}>
                    {clinicalData.diagnoses && clinicalData.diagnoses.length > 0 ? (
                        clinicalData.diagnoses.map((diag, index) => (
                            <Text key={index}>
                                {index + 1}. {diag.name}
                            </Text>
                        ))
                    ) : (
                        <Text>No diagnosis recorded</Text>
                    )}
                </View>

                {/* Treatment Table */}
                <Text style={styles.sectionTitle}>TREATMENT UNDERTAKEN/ADVISED</Text>
                {clinicalData.medications && clinicalData.medications.length > 0 ? (
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
                            <View style={{ width: '10%' }}>
                                <Text style={styles.tableCellBold}>No</Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={styles.tableCellBold}>Medication</Text>
                            </View>
                            <View style={{ width: '20%' }}>
                                <Text style={styles.tableCellBold}>Dosage</Text>
                            </View>
                            <View style={{ width: '20%' }}>
                                <Text style={styles.tableCellLast}>Remark</Text>
                            </View>
                        </View>

                        {/* Medication Rows */}
                        {clinicalData.medications.map((med, index) => {
                            const isLast = index === clinicalData.medications!.length - 1;
                            return (
                                <View key={index} style={isLast ? styles.tableRowLast : styles.tableRow}>
                                    <View style={{ width: '10%' }}>
                                        <Text style={styles.tableCell}>{index + 1}</Text>
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={styles.tableCell}>{med.name}</Text>
                                    </View>
                                    <View style={{ width: '20%' }}>
                                        <Text style={styles.tableCell}>{med.dosage || '-'}</Text>
                                    </View>
                                    <View style={{ width: '20%' }}>
                                        <Text style={styles.tableCellLast}>{med.frequency || '-'}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.textBlock}>
                        <Text>No medications recorded</Text>
                    </View>
                )}

                {/* Instructions Section */}
                <Text style={styles.sectionTitle}>INSTRUCTIONS</Text>
                <View style={styles.textBlock}>
                    <Text>
                        {clinicalData.dischargeInstructions || clinicalData.recommendations || 'No specific instructions'}
                    </Text>
                </View>

                {/* Footer with Date and Doctor Signature */}
                <View style={styles.footer}>
                    <View style={styles.footerLeft}>
                        <Text>Date: {format(new Date(), 'dd/MM/yyyy')}</Text>
                        <Text>Place: {hospital.includes('(') ? hospital.match(/\(([^)]+)\)/)?.[1] : 'CH (SC)'}</Text>
                    </View>
                    <View style={styles.footerRight}>
                        <Text>{doctorName}</Text>
                        <Text>Cl Spl Medicine & Nephrology</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
