/**
 * Check if a patient with the given phone number already exists
 * @param phoneNumber - Phone number to check
 * @param userId - User ID for querying
 * @returns Patient ID if exists, null otherwise
 */
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function checkDuplicatePatient(phoneNumber: string, userId: string): Promise<{ exists: boolean; patientId?: string; patientName?: string }> {
    if (!phoneNumber || phoneNumber.length < 10) {
        return { exists: false };
    }

    //  Query patients collection for matching phone number
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('phoneNumber', '==', phoneNumber));

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const existingPatient = snapshot.docs[0].data();
        return {
            exists: true,
            patientId: snapshot.docs[0].id,
            patientName: `${existingPatient.firstName || ''} ${existingPatient.lastName || ''}`.trim()
        };
    }

    return { exists: false };
}
