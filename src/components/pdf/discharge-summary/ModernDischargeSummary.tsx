import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import type { Patient, Visit } from '@/lib/types';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        backgroundColor: '#ffffff',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563eb',
        textAlign: 'center',
        marginBottom: 5,
        letterSpacing: 2,
    },
    hospitalName: {
        fontSize: 14,
        color: '#1f2937',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 3,
    },
    hospitalInfo: {
        fontSize: 9,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 15,
    },
    divider: {
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#2563eb',
        padding: 8,
        marginBottom: 12,
        marginTop: 15,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    infoItem: {
        width: '50%',
        marginBottom: 10,
        paddingRight: 10,
    },
    infoLabel: {
        fontSize: 10,
        color: '#6b7280',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 11,
        color: '#1f2937',
    },
    textContent: {
        fontSize: 11,
        color: '#374151',
        lineHeight: 1.6,
        marginBottom: 15,
    },
    table: {
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        paddingVertical: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingVertical: 6,
    },
    tableCell: {
        fontSize: 10,
        paddingHorizontal: 8,
    },
});

interface ModernDischargeSummaryProps {
    patient: Patient;
    visit: Visit;
}

export const ModernDischargeSummary: React.FC<ModernDischargeSummaryProps> = ({
    patient,
    visit,
}) => {
    const clinicalData = visit.clinicalData || {};
    const age = patient.dob
        ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} years`
        : '-';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>DISCHARGE SUMMARY</Text>
                    <Text style={styles.hospitalName}>NephroLite Medical Center</Text>
                    <Text style={styles.hospitalInfo}>
                        Nephrology & Dialysis Center | Tel: +91 (XXX) XXX-XXXX | Email: info@nephrolite.com
                    </Text>
                    <View style={styles.divider} />
                </View>

                {/* Patient Information */}
                <Text style={styles.sectionTitle}>PATIENT INFORMATION</Text>
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Patient Name:</Text>
                        <Text style={styles.infoValue}>{patient.firstName} {patient.lastName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>MRN / Nephro ID:</Text>
                        <Text style={styles.infoValue}>{patient.nephroId}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Age / Gender:</Text>
                        <Text style={styles.infoValue}>{age} / {patient.gender}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Date of Birth:</Text>
                        <Text style={styles.infoValue}>
                            {patient.dob ? format(new Date(patient.dob), 'dd MMM yyyy') : '-'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Contact:</Text>
                        <Text style={styles.infoValue}>{patient.contact || '-'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{patient.email || '-'}</Text>
                    </View>
                    <View style={{ width: '100%', marginBottom: 10 }}>
                        <Text style={styles.infoLabel}>Address:</Text>
                        <Text style={styles.infoValue}>
                            {[
                                patient.address?.street,
                                patient.address?.city,
                                patient.address?.state,
                                patient.address?.pincode
                            ].filter(Boolean).join(', ') || '-'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Visit Date:</Text>
                        <Text style={styles.infoValue}>
                            {format(new Date(visit.date), 'dd MMM yyyy')}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Visit Type:</Text>
                        <Text style={styles.infoValue}>{visit.visitType}</Text>
                    </View>
                </View>

                {/* Clinical History */}
                {clinicalData.history && (
                    <>
                        <Text style={styles.sectionTitle}>CLINICAL HISTORY</Text>
                        <Text style={styles.textContent}>{clinicalData.history}</Text>
                    </>
                )}

                {/* Vital Signs */}
                {(clinicalData.systolicBP || clinicalData.pulse) && (
                    <>
                        <Text style={styles.sectionTitle}>VITAL SIGNS</Text>
                        <View style={styles.infoGrid}>
                            {clinicalData.systolicBP && (
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Blood Pressure:</Text>
                                    <Text style={styles.infoValue}>
                                        {clinicalData.systolicBP}/{clinicalData.diastolicBP} mmHg
                                    </Text>
                                </View>
                            )}
                            {clinicalData.pulse && (
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Pulse:</Text>
                                    <Text style={styles.infoValue}>{clinicalData.pulse} bpm</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}

                {/* Diagnosis */}
                <Text style={styles.sectionTitle}>DIAGNOSIS</Text>
                {clinicalData.diagnoses && clinicalData.diagnoses.length > 0 ? (
                    <View style={{ marginBottom: 15 }}>
                        {clinicalData.diagnoses.map((diag, index) => (
                            <Text key={index} style={styles.textContent}>
                                {index + 1}. {diag.name}
                            </Text>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.textContent}>No diagnosis recorded</Text>
                )}

                {/* Medications */}
                {clinicalData.medications && clinicalData.medications.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>MEDICATIONS PRESCRIBED</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableCell, { width: '40%', fontWeight: 'bold' }]}>Medication</Text>
                                <Text style={[styles.tableCell, { width: '30%', fontWeight: 'bold' }]}>Dosage</Text>
                                <Text style={[styles.tableCell, { width: '30%', fontWeight: 'bold' }]}>Frequency</Text>
                            </View>
                            {clinicalData.medications.map((med, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { width: '40%' }]}>{med.name}</Text>
                                    <Text style={[styles.tableCell, { width: '30%' }]}>{med.dosage || '-'}</Text>
                                    <Text style={[styles.tableCell, { width: '30%' }]}>{med.frequency || '-'}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Instructions */}
                {(clinicalData.dischargeInstructions || clinicalData.recommendations) && (
                    <>
                        <Text style={styles.sectionTitle}>DISCHARGE INSTRUCTIONS</Text>
                        <Text style={styles.textContent}>
                            {clinicalData.dischargeInstructions || clinicalData.recommendations}
                        </Text>
                    </>
                )}

                {/* Footer */}
                <View style={{ position: 'absolute', bottom: 30, left: 40, right: 40 }}>
                    <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 }}>
                        <Text style={{ fontSize: 9, color: '#6b7280', textAlign: 'center' }}>
                            Generated on: {format(new Date(), 'dd MMM yyyy, HH:mm')} | NephroLite Medical Center
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
