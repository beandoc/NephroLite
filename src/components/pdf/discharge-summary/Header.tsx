import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';

interface HeaderProps {
    hospitalInfo?: {
        name: string;
        address: string;
        phone?: string;
        email?: string;
    };
}

export function Header({ hospitalInfo }: HeaderProps) {
    const defaultInfo = {
        name: 'NephroLite Medical Center',
        address: 'Nephrology & Dialysis Center, Medical District',
        phone: hospitalInfo?.phone,
        email: hospitalInfo?.email,
    };

    const info = hospitalInfo || defaultInfo;

    return (
        <View style={styles.header} fixed>
            <Text style={styles.headerTitle}>DISCHARGE SUMMARY</Text>
            <Text style={styles.hospitalName}>{info.name}</Text>
            <Text style={styles.hospitalAddress}>
                {info.address}
                {info.phone && ` | Tel: ${info.phone}`}
                {info.email && ` | Email: ${info.email}`}
            </Text>
        </View>
    );
}
