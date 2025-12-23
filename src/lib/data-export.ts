import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Export data to CSV format
 */
function convertToCSV(data: any[], headers: string[]): string {
    const rows = data.map(item =>
        headers.map(header => {
            const value = getNestedValue(item, header);
            // Escape quotes and wrap in quotes if contains comma
            const stringValue = String(value ?? '');
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        })
    );

    return [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
}

/**
 * Get nested object value by dot notation
 */
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Download file to user's computer
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export patients to CSV
 */
export async function exportPatientsToCSV(): Promise<void> {
    const snapshot = await getDocs(collection(db, 'patients'));

    const headers = [
        'nephroId',
        'firstName',
        'lastName',
        'dob',
        'gender',
        'phoneNumber',
        'email',
        'patientStatus',
        'address.city',
        'address.state',
        'createdAt'
    ];

    const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    const csv = convertToCSV(patients, headers);
    const filename = `patients-export-${new Date().toISOString().split('T')[0]}.csv`;

    downloadFile(csv, filename, 'text/csv');
}

/**
 * Export dialysis sessions to CSV
 */
export async function exportSessionsToCSV(patientId?: string): Promise<void> {
    let q = collection(db, 'dialysisSessions');

    if (patientId) {
        q = query(collection(db, 'dialysisSessions'), where('patientId', '==', patientId)) as any;
    }

    const snapshot = await getDocs(q);

    const headers = [
        'patientId',
        'sessionDate',
        'dialysisType',
        'status',
        'hdParams.weightBefore',
        'hdParams.weightAfter',
        'hdParams.durationMinutes',
        'vascularAccess.accessType',
        'complications',
        'createdAt'
    ];

    const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    const csv = convertToCSV(sessions, headers);
    const filename = `sessions-export-${new Date().toISOString().split('T')[0]}.csv`;

    downloadFile(csv, filename, 'text/csv');
}

/**
 * Export visits to CSV
 */
export async function exportVisitsToCSV(patientId?: string): Promise<void> {
    let q = collection(db, 'visits');

    if (patientId) {
        q = query(collection(db, 'visits'), where('patientId', '==', patientId)) as any;
    }

    const snapshot = await getDocs(q);

    const headers = [
        'patientId',
        'visitDate',
        'visitType',
        'chiefComplaint',
        'vitalSigns.bloodPressure',
        'vitalSigns.pulse',
        'vitalSigns.weight',
        'clinicalNotes',
        'createdAt'
    ];

    const visits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    const csv = convertToCSV(visits, headers);
    const filename = `visits-export-${new Date().toISOString().split('T')[0]}.csv`;

    downloadFile(csv, filename, 'text/csv');
}

/**
 * Export all data to JSON (full backup)
 */
export async function exportAllDataToJSON(): Promise<void> {
    const collections = ['patients', 'visits', 'dialysisSessions', 'users'];
    const data: Record<string, any[]> = {};

    for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        data[collectionName] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    const json = JSON.stringify(data, null, 2);
    const filename = `full-backup-${new Date().toISOString().split('T')[0]}.json`;

    downloadFile(json, filename, 'application/json');
}

/**
 * Export patient data with related records
 */
export async function exportPatientWithRelatedData(patientId: string): Promise<void> {
    // Get patient
    const patientSnapshot = await getDocs(
        query(collection(db, 'patients'), where('id', '==', patientId))
    );

    if (patientSnapshot.empty) {
        throw new Error('Patient not found');
    }

    const patient = {
        id: patientSnapshot.docs[0].id,
        ...patientSnapshot.docs[0].data()
    };

    // Get related visits
    const visitsSnapshot = await getDocs(
        query(collection(db, 'visits'), where('patientId', '==', patientId))
    );

    const visits = visitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Get related sessions
    const sessionsSnapshot = await getDocs(
        query(collection(db, 'dialysisSessions'), where('patientId', '==', patientId))
    );

    const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    const data = {
        patient,
        visits,
        sessions,
        exportDate: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const filename = `patient-${patientId}-${new Date().toISOString().split('T')[0]}.json`;

    downloadFile(json, filename, 'application/json');
}
