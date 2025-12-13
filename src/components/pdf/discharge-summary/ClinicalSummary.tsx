import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import type { Visit } from '@/lib/types';

interface ClinicalSummaryProps {
    visit: Visit;
}

export function ClinicalSummary({ visit }: ClinicalSummaryProps) {
    const clinicalData = visit.clinicalData;

    if (!clinicalData) {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Clinical Summary</Text>
                <Text style={styles.paragraph}>No clinical data recorded for this visit.</Text>
            </View>
        );
    }

    return (
        <>
            {/* Clinical History */}
            {clinicalData.history && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Clinical History</Text>
                    <Text style={styles.paragraph}>{clinicalData.history}</Text>
                </View>
            )}

            {/* Vital Signs */}
            {(clinicalData.height || clinicalData.weight || clinicalData.systolicBP || clinicalData.pulse) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vital Signs</Text>
                    <View style={styles.infoGrid}>
                        {clinicalData.height && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Height:</Text>
                                <Text style={styles.value}>{clinicalData.height} cm</Text>
                            </View>
                        )}

                        {clinicalData.weight && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Weight:</Text>
                                <Text style={styles.value}>{clinicalData.weight} kg</Text>
                            </View>
                        )}

                        {clinicalData.bmi && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>BMI:</Text>
                                <Text style={styles.value}>{clinicalData.bmi} kg/m²</Text>
                            </View>
                        )}

                        {clinicalData.idealBodyWeight && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Ideal Body Weight:</Text>
                                <Text style={styles.value}>{clinicalData.idealBodyWeight} kg</Text>
                            </View>
                        )}

                        {(clinicalData.systolicBP && clinicalData.diastolicBP) && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Blood Pressure:</Text>
                                <Text style={styles.value}>
                                    {clinicalData.systolicBP}/{clinicalData.diastolicBP} mmHg
                                </Text>
                            </View>
                        )}

                        {clinicalData.pulse && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Pulse:</Text>
                                <Text style={styles.value}>{clinicalData.pulse} bpm</Text>
                            </View>
                        )}

                        {clinicalData.respiratoryRate && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Respiratory Rate:</Text>
                                <Text style={styles.value}>{clinicalData.respiratoryRate} /min</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Examination Findings */}
            {(clinicalData.generalExamination || clinicalData.systemicExamination) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Examination Findings</Text>

                    {clinicalData.generalExamination && (
                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>General Examination:</Text>
                            <Text style={styles.paragraph}>{clinicalData.generalExamination}</Text>
                        </View>
                    )}

                    {clinicalData.systemicExamination && (
                        <View>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Systemic Examination:</Text>
                            <Text style={styles.paragraph}>{clinicalData.systemicExamination}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Course in Hospital */}
            {clinicalData.courseInHospital && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Course in Hospital</Text>
                    <Text style={styles.paragraph}>{clinicalData.courseInHospital}</Text>
                </View>
            )}

            {/* Reports */}
            {(clinicalData.usgReport || clinicalData.kidneyBiopsyReport) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Investigation Reports</Text>

                    {clinicalData.usgReport && (
                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>USG Report:</Text>
                            <Text style={styles.paragraph}>{clinicalData.usgReport}</Text>
                        </View>
                    )}

                    {clinicalData.kidneyBiopsyReport && (
                        <View>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Kidney Biopsy Report:</Text>
                            <Text style={styles.paragraph}>{clinicalData.kidneyBiopsyReport}</Text>
                        </View>
                    )}
                </View>
            )}
        </>
    );
}
