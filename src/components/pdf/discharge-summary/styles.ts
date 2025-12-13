import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 11,
        color: '#1a1a1a',
    },

    // Header Styles
    header: {
        borderBottom: '2pt solid #2563eb',
        paddingBottom: 15,
        marginBottom: 25,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2563eb',
        marginBottom: 8,
        letterSpacing: 1,
    },
    hospitalName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    hospitalAddress: {
        fontSize: 9,
        textAlign: 'center',
        color: '#666',
    },

    // Section Styles
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2563eb',
        borderBottom: '1pt solid #e5e7eb',
        paddingBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Info Rows
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6,
        width: '48%',
    },
    infoRowFull: {
        flexDirection: 'row',
        marginBottom: 6,
        width: '100%',
    },
    label: {
        width: '45%',
        fontWeight: 'bold',
        color: '#374151',
    },
    value: {
        width: '55%',
        color: '#1f2937',
    },

    // Table Styles
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderStyle: 'solid',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        minHeight: 25,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f3f4f6',
        fontWeight: 'bold',
    },
    tableCell: {
        padding: 6,
        fontSize: 10,
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
    },
    tableCellLast: {
        borderRightWidth: 0,
    },

    // Column widths
    col5: { width: '5%' },
    col10: { width: '10%' },
    col15: { width: '15%' },
    col20: { width: '20%' },
    col25: { width: '25%' },
    col30: { width: '30%' },
    col35: { width: '35%' },
    col40: { width: '40%' },
    col50: { width: '50%' },

    // Text Styles
    paragraph: {
        marginBottom: 8,
        lineHeight: 1.5,
        textAlign: 'justify',
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    bullet: {
        width: 15,
    },
    bulletText: {
        flex: 1,
        lineHeight: 1.4,
    },

    // Footer Styles
    footer: {
        marginTop: 30,
        paddingTop: 20,
        borderTop: '1pt solid #e5e7eb',
    },
    signatureSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
    },
    signatureBox: {
        width: '45%',
    },
    signatureLine: {
        borderTop: '1pt solid #000',
        marginTop: 30,
        paddingTop: 5,
    },
    signatureLabel: {
        fontSize: 10,
        color: '#666',
    },
    signatureName: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 3,
    },

    // Page Number
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        right: 40,
        fontSize: 9,
        color: '#666',
    },

    // Badge/Chip styles
    badge: {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        padding: '3 8',
        borderRadius: 3,
        fontSize: 9,
        fontWeight: 'bold',
    },
    badgeCritical: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
    },
    badgeNormal: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
    },
});
