import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import type { Visit } from '@/lib/types';

interface DiagnosesListProps {
    visit: Visit;
}

export function DiagnosesList({ visit }: DiagnosesListProps) {
    if (!visit.diagnoses || visit.diagnoses.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diagnosis</Text>

            {visit.diagnoses.map((diagnosis, index) => (
                <View key={index} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>{index + 1}.</Text>
                    <View style={styles.bulletText}>
                        <Text style={{ fontWeight: 'bold' }}>{diagnosis.name}</Text>
                        {diagnosis.icdCode && (
                            <Text style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
                                ICD Code: {diagnosis.icdCode}
                                {diagnosis.icdName && ` - ${diagnosis.icdName}`}
                            </Text>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
}
