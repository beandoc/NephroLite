import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import type { Patient, Visit } from '@/lib/types';
import { format, parse, differenceInYears } from 'date-fns';

interface PatientInfoProps {
    patient: Patient;
    visit: Visit;
}

export function PatientInfo({ patient, visit }: PatientInfoProps) {
    const calculateAge = (dob: string) => {
        try {
            const birthDate = parse(dob, 'yyyy-MM-dd', new Date());
            return differenceInYears(new Date(), birthDate);
        } catch {
            return 'N/A';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(parse(dateString, 'yyyy-MM-dd', new Date()), 'dd MMM yyyy');
        } catch {
            return dateString;
        }
    };

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Information</Text>

            <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Patient Name:</Text>
                    <Text style={styles.value}>
                        {patient.firstName} {patient.lastName}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>MRN / Nephro ID:</Text>
                    <Text style={styles.value}>{patient.nephroId}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Age / Gender:</Text>
                    <Text style={styles.value}>
                        {calculateAge(patient.dob)} years / {patient.gender}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Date of Birth:</Text>
                    <Text style={styles.value}>{formatDate(patient.dob)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Contact:</Text>
                    <Text style={styles.value}>{patient.contact || 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{patient.email || 'N/A'}</Text>
                </View>

                <View style={styles.infoRowFull}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>
                        {[
                            patient.address?.street,
                            patient.address?.city,
                            patient.address?.state,
                            patient.address?.pincode
                        ].filter(Boolean).join(', ') || 'N/A'}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Visit Date:</Text>
                    <Text style={styles.value}>{formatDate(visit.date)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Visit Type:</Text>
                    <Text style={styles.value}>{visit.visitType}</Text>
                </View>
            </View>
        </View>
    );
}
