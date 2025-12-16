import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import type { Patient, Visit } from '@/lib/types';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 10 },
    title: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, textDecoration: 'underline' },
    subtitle: { fontSize: 10, textAlign: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', backgroundColor: '#d3d3d3', padding: 5, textAlign: 'center', marginTop: 10, marginBottom: 5 },
    table: { width: '100%', borderWidth: 1, borderColor: '#000', marginBottom: 10 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' },
    tableCell: { padding: 4, fontSize: 9 },
    tableCellBold: { padding: 4, fontSize: 9, fontWeight: 'bold' },
    textBlock: { padding: 8, fontSize: 9, lineHeight: 1.4, borderWidth: 1, borderColor: '#000', marginBottom: 5 },
    footer: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 9 },
});

interface SimpleDischargeSummaryProps {
    patient: Patient;
    visit: Visit;
    doctorName?: string;
    hospital?: string;
}

export const SimpleDischargeSummary: React.FC<SimpleDischargeSummaryProps> = ({
    patient,
    visit,
    doctorName = 'Lt Col SACHIN SRIVASTAVA, Cl Spl Medicine and Nephrologist',
    hospital = 'COMMAND HOSPITAL (SC)',
}) => {
    const clinicalData = visit.clinicalData || {};
    const age = patient.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()}` : '-';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={{ fontSize: 9, marginBottom: 5 }}>Nephro Id: {patient.nephroId}</Text>
                <Text style={styles.title}>DISCHARGE SUMMARY</Text>
                <Text style={styles.subtitle}>{doctorName}, {hospital}</Text>

                {/* Patient Particulars */}
                <Text style={styles.sectionTitle}>PATIENT'S PARTICULARS</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={{ width: '50%' }}><Text style={styles.tableCellBold}>Patient Name: {patient.firstName} {patient.lastName}</Text></View>
                        <View style={{ width: '50%' }}><Text style={styles.tableCell}>Age/Sex: {age} / {patient.gender}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={{ width: '50%' }}><Text style={styles.tableCellBold}>Name: {patient.firstName} {patient.lastName}</Text></View>
                        <View style={{ width: '50%' }}><Text style={styles.tableCell}>Relation: {patient.guardian?.relation || 'SELF'}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={{ width: '33%' }}><Text style={styles.tableCellBold}>Per's No: {patient.serviceNumber || '-'}</Text></View>
                        <View style={{ width: '33%' }}><Text style={styles.tableCell}>Rank: {patient.rank || '-'}</Text></View>
                        <View style={{ width: '34%' }}><Text style={styles.tableCell}>Unit: {patient.unitName || '-'}</Text></View>
                    </View>
                </View>

                {/* Summary */}
                {(clinicalData.history || clinicalData.courseInHospital) && (
                    <>
                        <Text style={styles.sectionTitle}>SUMMARY</Text>
                        <View style={styles.textBlock}>
                            <Text>{clinicalData.history || clinicalData.courseInHospital || 'No summary available'}</Text>
                        </View>
                    </>
                )}

                {/* Diagnosis */}
                {clinicalData.diagnoses && clinicalData.diagnoses.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>DIAGNOSIS</Text>
                        <View style={styles.textBlock}>
                            {clinicalData.diagnoses.map((diag, i) => (
                                <Text key={i}>{i + 1}. {diag.name}</Text>
                            ))}
                        </View>
                    </>
                )}

                {/* Treatment */}
                {clinicalData.medications && clinicalData.medications.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>TREATMENT UNDERTAKEN/ADVISED</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
                                <View style={{ width: '10%' }}><Text style={styles.tableCellBold}>No</Text></View>
                                <View style={{ width: '50%' }}><Text style={styles.tableCellBold}>Medication</Text></View>
                                <View style={{ width: '20%' }}><Text style={styles.tableCellBold}>Dosage</Text></View>
                                <View style={{ width: '20%' }}><Text style={styles.tableCellBold}>Remark</Text></View>
                            </View>
                            {clinicalData.medications.map((med, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <View style={{ width: '10%' }}><Text style={styles.tableCell}>{index + 1}</Text></View>
                                    <View style={{ width: '50%' }}><Text style={styles.tableCell}>{med.name}</Text></View>
                                    <View style={{ width: '20%' }}><Text style={styles.tableCell}>{med.dosage || '-'}</Text></View>
                                    <View style={{ width: '20%' }}><Text style={styles.tableCell}>{med.frequency || '-'}</Text></View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Instructions */}
                {(clinicalData.dischargeInstructions || clinicalData.recommendations) && (
                    <>
                        <Text style={styles.sectionTitle}>INSTRUCTIONS</Text>
                        <View style={styles.textBlock}>
                            <Text>{clinicalData.dischargeInstructions || clinicalData.recommendations}</Text>
                        </View>
                    </>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.footerText}>Date: {format(new Date(), 'dd/MM/yyyy')}</Text>
                        <Text style={styles.footerText}>Place: {hospital.split(' ').pop()}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={styles.footerText}>{doctorName.split(',')[0]}</Text>
                        <Text style={styles.footerText}>{doctorName.split(',')[1]?.trim()}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
