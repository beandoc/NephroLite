import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import type { Visit } from '@/lib/types';

interface DischargeInstructionsProps {
    visit: Visit;
}

export function DischargeInstructions({ visit }: DischargeInstructionsProps) {
    const clinicalData = visit.clinicalData;

    if (!clinicalData?.dischargeInstructions && !clinicalData?.recommendations && !clinicalData?.opinionText) {
        return null;
    }

    return (
        <>
            {clinicalData.dischargeInstructions && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Discharge Instructions</Text>
                    <Text style={styles.paragraph}>{clinicalData.dischargeInstructions}</Text>
                </View>
            )}

            {clinicalData.recommendations && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommendations</Text>
                    <Text style={styles.paragraph}>{clinicalData.recommendations}</Text>
                </View>
            )}

            {clinicalData.opinionText && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Medical Opinion</Text>
                    <Text style={styles.paragraph}>{clinicalData.opinionText}</Text>
                </View>
            )}
        </>
    );
}
