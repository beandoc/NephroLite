import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import type { Medication } from '@/lib/types';

interface MedicationsTableProps {
    medications: Medication[];
}

export function MedicationsTable({ medications }: MedicationsTableProps) {
    if (!medications || medications.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medications Prescribed</Text>

            <View style={styles.table}>
                {/* Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, styles.col5]}>#</Text>
                    <Text style={[styles.tableCell, styles.col35]}>Medication Name</Text>
                    <Text style={[styles.tableCell, styles.col15]}>Dosage</Text>
                    <Text style={[styles.tableCell, styles.col15]}>Frequency</Text>
                    <Text style={[styles.tableCell, styles.col30, styles.tableCellLast]}>Instructions</Text>
                </View>

                {/* Rows */}
                {medications.map((med, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.col5]}>{index + 1}</Text>
                        <Text style={[styles.tableCell, styles.col35]}>{med.name}</Text>
                        <Text style={[styles.tableCell, styles.col15]}>{med.dosage || '-'}</Text>
                        <Text style={[styles.tableCell, styles.col15]}>{med.frequency || '-'}</Text>
                        <Text style={[styles.tableCell, styles.col30, styles.tableCellLast]}>
                            {med.instructions || '-'}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
