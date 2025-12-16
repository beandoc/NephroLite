import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import type { Patient, Visit } from '@/lib/types';
import { format } from 'date-fns';

// Register fonts
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Roboto',
    },
    header: {
        marginBottom: 10,
    },
    nephroId: {
        fontSize: 9,
        marginBottom: 5,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 3,
        textDecoration: 'underline',
    },
    subtitle: {
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#d3d3d3',
        padding: 5,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    tableCell: {
        padding: 4,
        fontSize: 9,
    },
    tableCellBold: {
        padding: 4,
        fontSize: 9,
        fontWeight: 'bold',
    },
    textBlock: {
        padding: 8,
        fontSize: 9,
        lineHeight: 1.4,
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 5,
    },
    footer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 9,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 5,
    },
    gridItem: {
        width: '25%',
        fontSize: 8,
        padding: 2,
    },
});

interface OpinionReportProps {
    patient: Patient;
    visit: Visit;
    doctorName?: string;
    hospital?: string;
}

export const OpinionReport: React.FC<OpinionReportProps> = ({
    patient,
    visit,
    doctorName = 'Lt Col SACHIN SRIVASTAVA, Cl Spl Medicine and Nephrologist',
    hospital = 'COMMAND HOSPITAL (SC)',
}) => {
    const clinicalData = visit.clinicalData || {};
    const cp = patient.clinicalProfile || {};

    // Calculate age
    const age = patient.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} years` : '-';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.nephroId}>
                        Nephro Id: {patient.nephroId}     (Ref to Para 28 of Army Order 09/2011/DGMS)
                    </Text>
                    <Text style={styles.title}>OPINION OF SPECIALIST</Text>
                    <Text style={styles.subtitle}>{doctorName}, {hospital}</Text>
                </View>

                {/* Patient Particulars */}
                <Text style={styles.sectionTitle}>PATIENT'S PARTICULARS</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={{ width: '25%' }}><Text style={styles.tableCellBold}>Per's No:</Text></View>
                        <View style={{ width: '25%' }}><Text style={styles.tableCell}>{clinicalData.serviceNumber || patient.serviceNumber || '-'}</Text></View>
                        <View style={{ width: '25%' }}><Text style={styles.tableCellBold}>Rank:</Text></View>
                        <View style={{ width: '25%' }}><Text style={styles.tableCell}>{patient.rank || '-'}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={{ width: '25%' }}><Text style={styles.tableCellBold}>Unit:</Text></View>
                        <View style={{ width: '25%' }}><Text style={styles.tableCell}>{clinicalData.unitName || patient.unitName || '-'}</Text></View>
                        <View style={{ width: '25%' }}><Text style={styles.tableCellBold}>Formation:</Text></View>
                        <View style={{ width: '25%' }}><Text style={styles.tableCell}>{clinicalData.formation || patient.formation || '-'}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={{ width: '25%' }}><Text style={styles.tableCellBold}>Name:</Text></View>
                        <View style={{ width: '25%' }}><Text style={styles.tableCell}>{patient.firstName} {patient.lastName}</Text></View>
                        <View style={{ width: '25%' }}><Text style={styles.tableCellBold}>Age:</Text></View>
                        <View style={{ width: '25%' }}><Text style={styles.tableCell}>{age}</Text></View>
                    </View>
                </View>

                {/* Clinical Assessment */}
                <Text style={styles.sectionTitle}>CLINICAL ASSESSMENT</Text>

                {/* History */}
                <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 5, marginBottom: 3 }}>History</Text>
                {cp.pastMedicalClassification && (
                    <Text style={{ fontSize: 9, marginBottom: 2 }}>Past Medical Classification: {cp.pastMedicalClassification}</Text>
                )}

                {/* Disability Assessment - Prioritize visit data for Self patients */}
                {(clinicalData.disabilityProfile || cp.primaryDisability || cp.disability) && (
                    <>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 3, marginBottom: 2 }}>Disability Assessment</Text>

                        {/* Visit-specific disability (for Self patients) */}
                        {clinicalData.disabilityProfile && (
                            <View style={styles.textBlock}>
                                <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Disability Profile: {clinicalData.disabilityProfile}</Text>
                                {clinicalData.disabilityDetails && (
                                    <Text>{clinicalData.disabilityDetails}</Text>
                                )}
                            </View>
                        )}

                        {/* Legacy disability table from patient profile */}
                        {(cp.primaryDisability || cp.disability) && (
                            <View style={styles.table}>
                                <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
                                    <View style={{ width: '10%' }}><Text style={styles.tableCellBold}>No</Text></View>
                                    <View style={{ width: '30%' }}><Text style={styles.tableCellBold}>Name</Text></View>
                                    <View style={{ width: '20%' }}><Text style={styles.tableCellBold}>Disability Profile</Text></View>
                                    <View style={{ width: '20%' }}><Text style={styles.tableCellBold}>Place of Onset</Text></View>
                                    <View style={{ width: '20%' }}><Text style={styles.tableCellBold}>Date</Text></View>
                                </View>
                                <View style={styles.tableRow}>
                                    <View style={{ width: '10%' }}><Text style={styles.tableCell}>1</Text></View>
                                    <View style={{ width: '30%' }}><Text style={styles.tableCell}>{cp.primaryDisability || cp.primaryDiagnosis || '-'}</Text></View>
                                    <View style={{ width: '20%' }}><Text style={styles.tableCell}>{cp.disability || '-'}</Text></View>
                                    <View style={{ width: '20%' }}><Text style={styles.tableCell}>{cp.disabilityLocationOfOnset || '-'}</Text></View>
                                    <View style={{ width: '20%' }}><Text style={styles.tableCell}>{cp.disabilityDateOfOnset ? format(new Date(cp.disabilityDateOfOnset), 'MMM yyyy') : '-'}</Text></View>
                                </View>
                            </View>
                        )}
                    </>
                )}

                {/* Relevant History */}
                {clinicalData.history && (
                    <>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 3, marginBottom: 2 }}>Relevant History</Text>
                        <View style={styles.textBlock}>
                            <Text>{clinicalData.history}</Text>
                        </View>
                    </>
                )}

                {/* Physical Examination */}
                <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 5, marginBottom: 3 }}>Physical examination findings</Text>
                <View style={styles.grid}>
                    <Text style={styles.gridItem}>Height (cm): {clinicalData.height || '-'}</Text>
                    <Text style={styles.gridItem}>Weight (Kg): {clinicalData.weight || '-'}</Text>
                    <Text style={styles.gridItem}>BMI: {clinicalData.bmi || '-'}</Text>
                    <Text style={styles.gridItem}>Ideal Weight: {clinicalData.idealBodyWeight || '-'}</Text>
                    <Text style={styles.gridItem}>Pulse: {clinicalData.pulse || '-'}</Text>
                    <Text style={styles.gridItem}>BP (mm/Hg): {clinicalData.systolicBP || '-'}/{clinicalData.diastolicBP || '-'}</Text>
                </View>

                {clinicalData.generalExamination && (
                    <View style={styles.textBlock}>
                        <Text>{clinicalData.generalExamination}</Text>
                    </View>
                )}

                {/* Investigations */}
                <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 5, marginBottom: 3 }}>Investigations</Text>
                <Text style={{ fontSize: 9, marginBottom: 3 }}>
                    {clinicalData.serumCreatinine && `Creatinine: ${clinicalData.serumCreatinine} mg/dL | `}
                    {clinicalData.uacr && `UACR: ${clinicalData.uacr} | `}
                    {clinicalData.totalCholesterol && `Total Cholesterol: ${clinicalData.totalCholesterol} mg/dL | `}
                    {clinicalData.hdlCholesterol && `HDL: ${clinicalData.hdlCholesterol} mg/dL`}
                </Text>

                {clinicalData.usgReport && (
                    <>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 3 }}>USG Report:</Text>
                        <View style={styles.textBlock}>
                            <Text>{clinicalData.usgReport}</Text>
                        </View>
                    </>
                )}

                {clinicalData.kidneyBiopsyReport && (
                    <>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 3 }}>Kidney Biopsy:</Text>
                        <View style={styles.textBlock}>
                            <Text>{clinicalData.kidneyBiopsyReport}</Text>
                        </View>
                    </>
                )}

                {/* Opinion */}
                {clinicalData.opinionText && (
                    <>
                        <Text style={styles.sectionTitle}>Opinion</Text>
                        <View style={styles.textBlock}>
                            <Text>{clinicalData.opinionText}</Text>
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
                                <View style={{ width: '40%' }}><Text style={styles.tableCellBold}>Medication</Text></View>
                                <View style={{ width: '25%' }}><Text style={styles.tableCellBold}>Dosage</Text></View>
                                <View style={{ width: '25%' }}><Text style={styles.tableCellBold}>Remark</Text></View>
                            </View>
                            {clinicalData.medications.map((med, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <View style={{ width: '10%' }}><Text style={styles.tableCell}>{index + 1}</Text></View>
                                    <View style={{ width: '40%' }}><Text style={styles.tableCell}>{med.name}</Text></View>
                                    <View style={{ width: '25%' }}><Text style={styles.tableCell}>{med.dosage || '-'}</Text></View>
                                    <View style={{ width: '25%' }}><Text style={styles.tableCell}>{med.frequency || '-'}</Text></View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Recommendations */}
                {clinicalData.recommendations && (
                    <>
                        <Text style={styles.sectionTitle}>RECOMMENDATIONS</Text>
                        <View style={styles.textBlock}>
                            <Text>{clinicalData.recommendations}</Text>
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
