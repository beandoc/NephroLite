import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';

interface FooterProps {
    doctorName?: string;
    doctorQualification?: string;
    date: string;
}

export function Footer({ doctorName, doctorQualification, date }: FooterProps) {
    return (
        <View style={styles.footer}>
            <View style={styles.signatureSection}>
                <View style={styles.signatureBox}>
                    <Text style={styles.signatureLabel}>Prepared by:</Text>
                    <View style={styles.signatureLine}>
                        <Text style={styles.signatureName}>
                            {doctorName || 'Dr. [Name]'}
                        </Text>
                        {doctorQualification && (
                            <Text style={styles.signatureLabel}>{doctorQualification}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.signatureBox}>
                    <Text style={styles.signatureLabel}>Date:</Text>
                    <View style={styles.signatureLine}>
                        <Text style={styles.signatureName}>{date}</Text>
                    </View>
                </View>
            </View>

            <Text style={{ fontSize: 8, color: '#999', marginTop: 20, textAlign: 'center' }}>
                This is a computer-generated document. For queries, please contact the hospital.
            </Text>
        </View>
    );
}
