import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import type { Patient, Visit } from '@/lib/types';
import { format } from 'date-fns';

// Register fonts
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

// Define styles matching the sample format
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
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
        borderWidth: 1,
        borderColor: '#000',
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
        borderRightWidth: 1,
        borderColor: '#000',
    },
    tableCellNoBorder: {
        padding: 4,
        fontSize: 9,
    },
    tableCellBold: {
        padding: 4,
        fontSize: 9,
        fontWeight: 'bold',
        borderRightWidth: 1,
        borderColor: '#000',
    },
    textBlock: {
        padding: 8,
        fontSize: 9,
        lineHeight: 1.4,
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 5,
    },
    subsectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 3,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 5,
    },
    gridCell: {
        width: '25%',
        fontSize: 8,
        padding: 3,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    footer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 9,
    },
    listItem: {
        fontSize: 9,
        marginBottom: 2,
        paddingLeft: 10,
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
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCellBold}>Pers No:</Text></View>
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCell}>{clinicalData.serviceNumber || patient.serviceNumber || '-'}</Text></View>
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCellBold}>Rank:</Text></View>
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCell}>{patient.rank || '-'}</Text></View>
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCellBold}>Name:</Text></View>
                        <View style={{ width: '37.5%', borderRight: 0 }}><Text style={styles.tableCellNoBorder}>{patient.firstName} {patient.lastName}</Text></View>
                    </View>
                    <View style={{ ...styles.tableRow, borderBottom: 0 }}>
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCellBold}>Unit:</Text></View>
                        <View style={{ width: '37.5%' }}><Text style={styles.tableCell}>{clinicalData.unitName || patient.unitName || '-'}</Text></View>
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCellBold}>Age:</Text></View>
                        <View style={{ width: '37.5%', borderRight: 0 }}><Text style={styles.tableCellNoBorder}>{age}</Text></View>
                    </View>
                </View>

                {/* Clinical Assessment */}
                <Text style={styles.sectionTitle}>CLINICAL ASSESSMENT</Text>

                {/* History */}
                <Text style={styles.subsectionTitle}>History</Text>
                {cp.pastMedicalClassification && (
                    <Text style={{ fontSize: 9, marginBottom: 3 }}>
                        Past Medical Classification: {cp.pastMedicalClassification}
                    </Text>
                )}

                {/* Disability */}
                {(clinicalData.disabilityProfile || cp.primaryDisability) && (
                    <>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 3, marginBottom: 2 }}>Disability</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
                                <View style={{ width: '8%' }}><Text style={styles.tableCellBold}>No</Text></View>
                                <View style={{ width: '42%' }}><Text style={styles.tableCellBold}>Name</Text></View>
                                <View style={{ width: '20%' }}><Text style={styles.tableCellBold}>Disability Profile</Text></View>
                                <View style={{ width: '15%' }}><Text style={styles.tableCellBold}>Place of Onset</Text></View>
                                <View style={{ width: '15%', borderRight: 0 }}><Text style={{ ...styles.tableCellBold, borderRight: 0 }}>Date</Text></View>
                            </View>
                            <View style={{ ...styles.tableRow, borderBottom: 0 }}>
                                <View style={{ width: '8%' }}><Text style={styles.tableCell}>1</Text></View>
                                <View style={{ width: '42%' }}><Text style={styles.tableCell}>{clinicalData.disabilityProfile || cp.primaryDisability || '-'}</Text></View>
                                <View style={{ width: '20%' }}><Text style={styles.tableCell}>{cp.disability || 'Fresh'}</Text></View>
                                <View style={{ width: '15%' }}><Text style={styles.tableCell}>{cp.disabilityLocationOfOnset || '-'}</Text></View>
                                <View style={{ width: '15%', borderRight: 0 }}><Text style={{ ...styles.tableCell, borderRight: 0 }}>{cp.disabilityDateOfOnset ? format(new Date(cp.disabilityDateOfOnset), 'MMM yyyy') : '-'}</Text></View>
                            </View>
                        </View>
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
                <Text style={styles.subsectionTitle}>Physical examination findings</Text>
                <View style={{ flexDirection: 'row', marginBottom: 3 }}>
                    <Text style={{ fontSize: 8, width: '25%' }}>Height (cm): {clinicalData.height || '-'}</Text>
                    <Text style={{ fontSize: 8, width: '25%' }}>Weight (Kg): {clinicalData.weight || '-'}</Text>
                    <Text style={{ fontSize: 8, width: '25%' }}>Ideal Weight: {clinicalData.idealBodyWeight || '-'}</Text>
                    <Text style={{ fontSize: 8, width: '25%' }}></Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 3 }}>
                    <Text style={{ fontSize: 8, width: '25%' }}>BMI (kg/m2): {clinicalData.bmi || '-'}</Text>
                    <Text style={{ fontSize: 8, width: '25%' }}>Pulse: {clinicalData.pulse || '-'}</Text>
                    <Text style={{ fontSize: 8, width: '25%' }}>BP (mm/Hg): {clinicalData.systolicBP || '-'}/{clinicalData.diastolicBP || '-'}</Text>
                    <Text style={{ fontSize: 8, width: '25%' }}></Text>
                </View>

                {clinicalData.generalExamination && (
                    <View style={styles.textBlock}>
                        <Text>{clinicalData.generalExamination}</Text>
                    </View>
                )}

                {/* Investigations - Text Format */}
                <Text style={styles.subsectionTitle}>Investigations</Text>
                {clinicalData.investigationsText ? (
                    <View style={styles.textBlock}>
                        <Text>{clinicalData.investigationsText}</Text>
                    </View>
                ) : (
                    <Text style={{ fontSize: 8, marginBottom: 5 }}>
                        {clinicalData.serumCreatinine && `Creat: ${clinicalData.serumCreatinine} mg/dl | `}
                        {clinicalData.uacr && `UACR: ${clinicalData.uacr} | `}
                        {clinicalData.totalCholesterol && `T Chol: ${clinicalData.totalCholesterol} mg/dl | `}
                        {clinicalData.hdlCholesterol && `HDL: ${clinicalData.hdlCholesterol} mg/dl`}
                    </Text>
                )}

                {clinicalData.usgReport && (
                    <>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 3 }}>USG Abdo/KUB:</Text>
                        <Text style={{ fontSize: 8, marginBottom: 3 }}>{clinicalData.usgReport}</Text>
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
            </Page>

            {/* Page 2 */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.nephroId}>
                        Nephro Id: {patient.nephroId}     (Ref to Para 28 of Army Order 09/2011/DGMS)
                    </Text>
                    <Text style={styles.title}>OPINION OF SPECIALIST</Text>
                    <Text style={styles.subtitle}>{doctorName}, {hospital}</Text>
                </View>

                <Text style={styles.sectionTitle}>PATIENT'S PARTICULARS</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCellBold}>Pers No:</Text></View>
                        <View style={{ width: '37.5%' }}><Text style={styles.tableCell}>{clinicalData.serviceNumber || patient.serviceNumber || '-'}</Text></View>
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCellBold}>Rank:</Text></View>
                        <View style={{ width: '37.5%', borderRight: 0 }}><Text style={{ ...styles.tableCell, borderRight: 0 }}>{patient.rank || '-'}</Text></View>
                    </View>
                    <View style={{ ...styles.tableRow, borderBottom: 0 }}>
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCellBold}>Unit:</Text></View>
                        <View style={{ width: '37.5%' }}><Text style={styles.tableCell}>{clinicalData.unitName || patient.unitName || '-'}</Text></View>
                        <View style={{ width: '12.5%' }}><Text style={styles.tableCellBold}>Age:</Text></View>
                        <View style={{ width: '37.5%', borderRight: 0 }}><Text style={{ ...styles.tableCell, borderRight: 0 }}>{age}</Text></View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>CLINICAL ASSESSMENT</Text>

                {/* Opinion */}
                {clinicalData.opinionText && (
                    <>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 5, marginBottom: 3 }}>Opinion</Text>
                        <View style={styles.textBlock}>
                            <Text>{clinicalData.opinionText}</Text>
                        </View>
                    </>
                )}

                {/* Treatment - Simple List */}
                {clinicalData.medications && clinicalData.medications.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>TREATMENT UNDERTAKEN/ADVISED</Text>
                        <View style={styles.textBlock}>
                            {clinicalData.medications.map((med, index) => (
                                <Text key={index} style={styles.listItem}>
                                    {index + 1}. {med.name} {med.dosage || ''} {med.frequency || ''}
                                </Text>
                            ))}
                        </View>
                    </>
                )}

                {/* Recommendations - Complete Structure */}
                <Text style={styles.sectionTitle}>RECOMMENDATIONS</Text>
                <View style={styles.textBlock}>
                    {clinicalData.recommendedMedicalClassification && (
                        <>
                            <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>Medical Classification recommended:</Text>
                            <Text style={styles.listItem}>1. Medical Classification: {clinicalData.recommendedMedicalClassification}</Text>
                        </>
                    )}
                    {clinicalData.recommendedDisabilityProfile && (
                        <Text style={styles.listItem}>2. Disability Profile: {clinicalData.recommendedDisabilityProfile}</Text>
                    )}
                    {clinicalData.clinicalDiagnosisForBoard && (
                        <Text style={styles.listItem}>3. Clinical Diagnosis: {clinicalData.clinicalDiagnosisForBoard}</Text>
                    )}
                    {clinicalData.icdDiagnosis && (
                        <Text style={styles.listItem}>4. ICD Diagnosis: {clinicalData.icdDiagnosis}</Text>
                    )}
                    {clinicalData.icd10Code && (
                        <Text style={styles.listItem}>5. ICD 10 Code: {clinicalData.icd10Code}</Text>
                    )}

                    {clinicalData.medicalRecommendations && (
                        <>
                            <Text style={{ fontWeight: 'bold', marginTop: 5, marginBottom: 3 }}>
                                Medical recommendations and employability restrictions as per Code 'E':
                            </Text>
                            <Text>{clinicalData.medicalRecommendations}</Text>
                        </>
                    )}

                    {(clinicalData.dietRestrictions || clinicalData.drugsToAvoid || clinicalData.followUpInstructions || clinicalData.otherAdvice) && (
                        <>
                            <Text style={{ fontWeight: 'bold', marginTop: 5, marginBottom: 3 }}>
                                Any other advice (with justification):
                            </Text>
                            {clinicalData.dietRestrictions && (
                                <Text style={styles.listItem}>1. {clinicalData.dietRestrictions}</Text>
                            )}
                            {clinicalData.drugsToAvoid && (
                                <Text style={styles.listItem}>2. {clinicalData.drugsToAvoid}</Text>
                            )}
                            {clinicalData.followUpInstructions && (
                                <Text style={styles.listItem}>3. {clinicalData.followUpInstructions}</Text>
                            )}
                            {clinicalData.otherAdvice && (
                                <Text style={styles.listItem}>4. {clinicalData.otherAdvice}</Text>
                            )}
                        </>
                    )}

                    {/* Fallback for old recommendations field */}
                    {!clinicalData.recommendedMedicalClassification && clinicalData.recommendations && (
                        <Text>{clinicalData.recommendations}</Text>
                    )}
                </View>

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

                {/* QR Code placeholder - would need a QR code library */}
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 8, color: '#666' }}>[QR Code: {patient.nephroId}]</Text>
                </View>
            </Page>
        </Document>
    );
};
