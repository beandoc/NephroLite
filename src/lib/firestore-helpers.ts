import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    Unsubscribe,
    writeBatch,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { db } from './firebase';
import type {
    Patient,
    Appointment,
    Visit,
    InvestigationRecord,
    Intervention,
    DialysisSession,
    InvestigationMaster,
    InvestigationPanel
} from './types';

// Helper to remove undefined values (Firestore doesn't allow undefined)
export const cleanUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
            cleaned[key] = obj[key];
        }
    });
    return cleaned;
};

// ==================== PATIENT OPERATIONS ====================

export const getPatientsRef = (userId: string) =>
    collection(db, 'users', userId, 'patients');

export const getPatientRef = (userId: string, patientId: string) =>
    doc(db, 'users', userId, 'patients', patientId);

// Subcollections
export const getVisitsRef = (userId: string, patientId: string) =>
    collection(db, 'users', userId, 'patients', patientId, 'visits');

export const getInvestigationsRef = (userId: string, patientId: string) =>
    collection(db, 'users', userId, 'patients', patientId, 'investigationRecords');

export const getInterventionsRef = (userId: string, patientId: string) =>
    collection(db, 'users', userId, 'patients', patientId, 'interventions');

export const getDialysisSessionsRef = (userId: string, patientId: string) =>
    collection(db, 'users', userId, 'patients', patientId, 'dialysisSessions');

// ==================== TIME-BASED INDEX OPERATIONS ====================
// These indexes enable fast monthly queries for dashboards
// Data is written to BOTH patient-centric location AND time index

/**
 * Get visit collection reference
 * Format: users/{userId}/patients/{patientId}/visits
 */
export const getVisitsCollection = (userId: string, patientId: string) =>
    collection(db, 'users', userId, 'patients', patientId, 'visits');

/**
 * Get reference to monthly investigation index
 */
export const getMonthlyInvestigationsIndexRef = (userId: string, monthKey: string) =>
    collection(db, 'users', userId, 'investigationsByMonth', monthKey);

/**
 * Get reference to monthly dialysis sessions index
 */
export const getMonthlyDialysisIndexRef = (userId: string, monthKey: string) =>
    collection(db, 'users', userId, 'dialysisByMonth', monthKey);

/**
 * Helper to get month key from date string
 * @param dateString ISO date string
 * @returns Month key in format YYYY-MM
 */
export function getMonthKey(dateString: string): string {
    try {
        return format(parseISO(dateString), 'yyyy-MM');
    } catch {
        return format(new Date(), 'yyyy-MM'); // Fallback to current month
    }
}

// Create patient (without subcollections, those are added separately)
// Create patient (Dual Write: Staff DB + Root DB)
export const createPatient = async (userId: string, patient: Patient) => {
    const { visits, investigationRecords, interventions, dialysisSessions, ...patientData } = patient;

    const patientRef = getPatientRef(userId, patient.id);
    const rootPatientRef = doc(db, 'patients', patient.id);

    const dataToSave = cleanUndefined({
        ...patientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    await Promise.all([
        setDoc(patientRef, dataToSave),
        setDoc(rootPatientRef, { ...dataToSave, createdBy: userId }, { merge: true })
    ]);

    return patient;
};

// Get all patients (without subcollections for performance)
export const getPatients = async (userId: string): Promise<Patient[]> => {
    const patientsRef = getPatientsRef(userId);
    const snapshot = await getDocs(patientsRef);

    return snapshot.docs.map(doc => {
        const data = doc.data() as Patient; // Cast data to Patient type
        return {
            ...data,
            visits: [],
            investigationRecords: [],
            interventions: [],
            dialysisSessions: []
        } as Patient;
    });
};

// Listen to patients in real-time
export const subscribeToPatients = (
    userId: string,
    callback: (patients: Patient[]) => void
): Unsubscribe => {
    const patientsRef = getPatientsRef(userId);

    return onSnapshot(patientsRef, (snapshot) => {
        const patients = snapshot.docs.map(doc => {
            const data = doc.data() as Patient; // Cast data to Patient type
            return {
                ...data,
                visits: [],
                investigationRecords: [],
                interventions: [],
                dialysisSessions: []
            } as Patient;
        });

        callback(patients);
    });
};

// Get full patient with subcollections
export const getPatientWithSubcollections = async (userId: string, patientId: string): Promise<Patient | null> => {
    const patientRef = getPatientRef(userId, patientId);
    const patientSnap = await getDoc(patientRef);

    if (!patientSnap.exists()) return null;

    // Fetch subcollections
    const [visits, investigations, interventions, dialysisSessions] = await Promise.all([
        getDocs(getVisitsRef(userId, patientId)),
        getDocs(getInvestigationsRef(userId, patientId)),
        getDocs(getInterventionsRef(userId, patientId)),
        getDocs(getDialysisSessionsRef(userId, patientId))
    ]);

    return {
        ...patientSnap.data(),
        visits: visits.docs.map(d => d.data() as Visit),
        investigationRecords: investigations.docs.map(d => d.data() as InvestigationRecord),
        interventions: interventions.docs.map(d => d.data() as Intervention),
        dialysisSessions: dialysisSessions.docs.map(d => d.data() as DialysisSession)
    } as Patient;
};

// Update patient
// Update patient (Dual Write)
export const updatePatient = async (userId: string, patientId: string, updates: Partial<Patient>) => {
    const { visits, investigationRecords, interventions, dialysisSessions, ...patientUpdates } = updates;

    const patientRef = getPatientRef(userId, patientId);
    const rootPatientRef = doc(db, 'patients', patientId);

    const updateData = {
        ...patientUpdates,
        updatedAt: serverTimestamp()
    };

    // Use Promise.all to update both locations
    // Note: for root, we use setDoc with merge to ensure it exists if created legacy style
    await Promise.all([
        updateDoc(patientRef, updateData),
        setDoc(rootPatientRef, updateData, { merge: true })
    ]);
};

// Delete patient and all subcollections
export const deletePatient = async (userId: string, patientId: string) => {
    const batch = writeBatch(db);

    // Delete subcollections first
    const [visits, investigations, interventions, dialysisSessions] = await Promise.all([
        getDocs(getVisitsRef(userId, patientId)),
        getDocs(getInvestigationsRef(userId, patientId)),
        getDocs(getInterventionsRef(userId, patientId)),
        getDocs(getDialysisSessionsRef(userId, patientId))
    ]);

    visits.docs.forEach(doc => batch.delete(doc.ref));
    investigations.docs.forEach(doc => batch.delete(doc.ref));
    interventions.docs.forEach(doc => batch.delete(doc.ref));
    dialysisSessions.docs.forEach(doc => batch.delete(doc.ref));

    // Delete patient
    // Delete patient (Staff DB)
    batch.delete(getPatientRef(userId, patientId));
    // Delete patient (Root DB)
    batch.delete(doc(db, 'patients', patientId));

    await batch.commit();
};

// ==================== VISIT OPERATIONS (Hybrid: Patient + Time Index) ====================

/**
 * Add visit with hybrid indexing
 * Writes to BOTH patient-centric location AND monthly time index
 * This enables fast patient profile loading AND fast monthly dashboard queries
 */
export const addVisit = async (userId: string, patientId: string, visit: Visit) => {
    // Save visit directly to patient's visits collection
    const visitRef = doc(getVisitsRef(userId, patientId), visit.id);
    await setDoc(visitRef, cleanUndefined(visit));
};

export const updateVisit = async (userId: string, patientId: string, visitId: string, updates: Partial<Visit>) => {
    // Update visit in patient's visits collection
    const visitRef = doc(getVisitsRef(userId, patientId), visitId);
    await updateDoc(visitRef, updates);
};

// ==================== INVESTIGATION OPERATIONS ====================

export const addInvestigationRecord = async (userId: string, patientId: string, record: InvestigationRecord) => {
    const recordRef = doc(getInvestigationsRef(userId, patientId), record.id);
    await setDoc(recordRef, cleanUndefined(record));
};

export const deleteInvestigationRecord = async (userId: string, patientId: string, recordId: string) => {
    const recordRef = doc(getInvestigationsRef(userId, patientId), recordId);
    await deleteDoc(recordRef);
};

// ==================== INTERVENTION OPERATIONS ====================

export const addIntervention = async (userId: string, patientId: string, intervention: Intervention) => {
    const interventionRef = doc(getInterventionsRef(userId, patientId), intervention.id);
    await setDoc(interventionRef, cleanUndefined(intervention));
};

export const deleteIntervention = async (userId: string, patientId: string, interventionId: string) => {
    const interventionRef = doc(getInterventionsRef(userId, patientId), interventionId);
    await deleteDoc(interventionRef);
};

// ==================== DIALYSIS SESSION OPERATIONS ====================

export const addDialysisSession = async (userId: string, patientId: string, session: DialysisSession) => {
    const sessionRef = doc(getDialysisSessionsRef(userId, patientId), session.id);
    await setDoc(sessionRef, cleanUndefined(session));
};

export const deleteDialysisSession = async (userId: string, patientId: string, sessionId: string) => {
    const sessionRef = doc(getDialysisSessionsRef(userId, patientId), sessionId);
    await deleteDoc(sessionRef);
};

// ==================== APPOINTMENT OPERATIONS ====================

export const getAppointmentsRef = (userId: string) =>
    collection(db, 'users', userId, 'appointments');

export const subscribeToAppointments = (
    userId: string,
    callback: (appointments: Appointment[]) => void
): Unsubscribe => {
    const appointmentsRef = getAppointmentsRef(userId);

    return onSnapshot(appointmentsRef, (snapshot) => {
        const appointments = snapshot.docs.map(doc => doc.data() as Appointment);
        callback(appointments);
    });
};

export const createAppointment = async (userId: string, appointment: Appointment) => {
    const appointmentRef = doc(getAppointmentsRef(userId), appointment.id);
    await setDoc(appointmentRef, cleanUndefined(appointment));
    return appointment;
};

export const updateAppointment = async (userId: string, appointmentId: string, updates: Partial<Appointment>) => {
    const appointmentRef = doc(getAppointmentsRef(userId), appointmentId);
    await updateDoc(appointmentRef, updates);
};

// ==================== INVESTIGATION MASTER DATA ====================

export const getInvestigationMasterRef = (userId: string) =>
    doc(db, 'users', userId, 'masterData', 'investigations');

export const getInvestigationMaster = async (userId: string) => {
    const masterRef = getInvestigationMasterRef(userId);
    const snap = await getDoc(masterRef);

    if (!snap.exists()) {
        return { investigationMasterList: [], investigationPanels: [] };
    }

    return snap.data() as { investigationMasterList: InvestigationMaster[], investigationPanels: InvestigationPanel[] };
};

export const updateInvestigationMaster = async (
    userId: string,
    data: { investigationMasterList: InvestigationMaster[], investigationPanels: InvestigationPanel[] }
) => {
    const masterRef = getInvestigationMasterRef(userId);
    await setDoc(masterRef, cleanUndefined(data));
};

// ==================== TEMPLATES & MASTER DIAGNOSIS ====================

export const getTemplatesRef = (userId: string) =>
    collection(db, `users/${userId}/templates`);

export const getMasterDiagnosisRef = (userId: string) =>
    doc(db, `users/${userId}/masterData/diagnoses`);

// Save a template
export const saveTemplate = async (userId: string, template: any) => {
    const templateRef = doc(getTemplatesRef(userId), template.templateName);
    await setDoc(templateRef, cleanUndefined(template));
};

// Get all templates
export const getTemplates = async (userId: string) => {
    const templatesRef = getTemplatesRef(userId);
    const snap = await getDocs(templatesRef);
    const templates: Record<string, any> = {};
    snap.forEach(doc => {
        templates[doc.id] = doc.data();
    });
    return templates;
};

// Delete a template
export const deleteTemplate = async (userId: string, templateName: string) => {
    const templateRef = doc(getTemplatesRef(userId), templateName);
    await deleteDoc(templateRef);
};

// Save master diagnoses list
export const saveMasterDiagnoses = async (userId: string, diagnoses: any[]) => {
    const diagnosesRef = getMasterDiagnosisRef(userId);
    await setDoc(diagnosesRef, cleanUndefined({ diagnoses }));
};

// Get master diagnoses list
export const getMasterDiagnoses = async (userId: string) => {
    const diagnosesRef = getMasterDiagnosisRef(userId);
    const snap = await getDoc(diagnosesRef);
    if (!snap.exists()) {
        return [];
    }
    return snap.data().diagnoses || [];
};
