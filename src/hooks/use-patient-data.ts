
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Patient, PatientFormData, Visit, VisitFormData, ClinicalProfile } from '@/lib/types';
import { format } from 'date-fns';
import { VACCINATION_NAMES, PRIMARY_DIAGNOSIS_OPTIONS, NUTRITIONAL_STATUSES, DISABILITY_PROFILES, BLOOD_GROUPS } from '@/lib/constants';

const getDefaultVaccinations = () => {
  return VACCINATION_NAMES.map(name => ({
    name: name,
    administered: false,
    date: "",
    nextDoseDate: ""
  }));
};

const getInitialClinicalProfile = (): Omit<ClinicalProfile, 'tags'> => ({
  primaryDiagnosis: PRIMARY_DIAGNOSIS_OPTIONS.includes('Not Set') ? 'Not Set' : PRIMARY_DIAGNOSIS_OPTIONS[0] || "",
  nutritionalStatus: NUTRITIONAL_STATUSES.includes('Not Set') ? 'Not Set' : NUTRITIONAL_STATUSES[0] || "",
  disability: DISABILITY_PROFILES.includes('Not Set') ? 'Not Set' : DISABILITY_PROFILES[0] || "",
  subspecialityFollowUp: 'NIL',
  smokingStatus: 'NIL',
  alcoholConsumption: 'NIL',
  vaccinations: getDefaultVaccinations(),
  pomr: "",
  aabhaNumber: "",
  bloodGroup: BLOOD_GROUPS.includes('Unknown') ? 'Unknown' : BLOOD_GROUPS[0] || "",
  drugAllergies: "",
  whatsappNumber: "",
});


export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'patients');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const patientsData: Patient[] = [];
      querySnapshot.forEach((doc) => {
        patientsData.push({ id: doc.id, ...doc.data() } as Patient);
      });
      setPatients(patientsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPatient = useCallback(async (patientData: PatientFormData): Promise<Patient> => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    const q = query(collection(db, 'patients'), where('nephroId', '>=', `0000/${month}${year}`), where('nephroId', '<', `9999/${parseInt(month, 10) + 1}${year}`));
    const querySnapshot = await getDocs(q);
    const relevantPatients = querySnapshot.docs.map(doc => doc.data() as Patient);

    const maxId = relevantPatients.reduce((max, p) => {
        const numPart = p.nephroId.split('/')[0];
        const num = parseInt(numPart, 10);
        return !isNaN(num) && num > max ? num : max;
    }, 1000);

    const newIdNumber = maxId + 1;
    
    const newPatientData: Omit<Patient, 'id'> = {
      nephroId: `${newIdNumber}/${month}${year}`,
      name: patientData.name,
      dob: patientData.dob,
      gender: patientData.gender,
      contact: patientData.contact,
      email: patientData.email,
      address: {
        street: patientData.address.street || "",
        city: patientData.address.city || "",
        state: patientData.address.state || "",
        pincode: patientData.address.pincode || "",
      },
      guardian: {
        name: patientData.guardian.relation === 'Self' ? patientData.name : patientData.guardian.name || "",
        relation: patientData.guardian.relation || "",
        contact: patientData.guardian.relation === 'Self' ? patientData.contact : patientData.guardian.contact || "",
      },
      registrationDate: now.toISOString().split('T')[0],
      patientStatus: 'OPD',
      isTracked: false,
      residenceType: 'Not Set',
      visits: [],
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        tags: [],
        whatsappNumber: patientData.whatsappNumber || '',
        aabhaNumber: patientData.uhid || '',
      },
    };
    const docRef = await addDoc(collection(db, 'patients'), newPatientData);
    return { id: docRef.id, ...newPatientData };
  }, []);

  const getPatientById = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);
  
  const updatePatient = useCallback(async (patientId: string, updatedData: Partial<PatientFormData>): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    
    const aabhaNumber = updatedData.uhid;
    const whatsappNumber = updatedData.whatsappNumber;

    const currentDoc = await getDoc(patientDocRef);
    const currentClinicalProfile = currentDoc.data()?.clinicalProfile || {};

    const dataToUpdate = {
        name: updatedData.name,
        dob: updatedData.dob,
        gender: updatedData.gender,
        contact: updatedData.contact,
        email: updatedData.email,
        address: updatedData.address,
        guardian: updatedData.guardian,
        'clinicalProfile.aabhaNumber': aabhaNumber,
        'clinicalProfile.whatsappNumber': whatsappNumber
    };

    await updateDoc(patientDocRef, dataToUpdate);
  }, []);

  const addVisitToPatient = useCallback(async (patientId: string, visitData: VisitFormData): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientDocRef);
    if (!patientDoc.exists()) {
      throw new Error("Patient not found");
    }
    
    const patient = patientDoc.data() as Patient;
    const newVisit: Visit = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      ...visitData,
      patientGender: patient.gender,
      patientRelation: patient.guardian.relation,
    };

    const newVisits = [...(patient.visits || []), newVisit];
    const newTags = Array.from(new Set([...(patient.clinicalProfile.tags || []), visitData.groupName]));
    
    let newPrimaryDiagnosis = patient.clinicalProfile.primaryDiagnosis;
    if (newPrimaryDiagnosis === 'Not Set' && visitData.groupName !== 'Misc') {
        newPrimaryDiagnosis = visitData.groupName;
    }

    const visitRemarkEntry = `[${format(new Date(newVisit.date), 'yyyy-MM-dd')}] Visit (${newVisit.visitType}): ${newVisit.visitRemark}`;
    const newPomr = patient.clinicalProfile.pomr 
      ? `${patient.clinicalProfile.pomr}\n${visitRemarkEntry}`
      : visitRemarkEntry;

    await updateDoc(patientDocRef, {
      visits: newVisits,
      'clinicalProfile.tags': newTags,
      'clinicalProfile.primaryDiagnosis': newPrimaryDiagnosis,
      'clinicalProfile.pomr': newPomr
    });
  }, []);

  const deletePatient = useCallback(async (patientId: string): Promise<void> => {
    // This is a more robust way to handle deletion.
    const appointmentsQuery = query(collection(db, 'appointments'), where('patientId', '==', patientId));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    const batch = writeBatch(db);
    
    // Delete all appointments for the patient
    appointmentsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the patient document
    const patientDocRef = doc(db, 'patients', patientId);
    batch.delete(patientDocRef);

    await batch.commit();
  }, []);

  const admitPatient = useCallback(async (patientId: string): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    await updateDoc(patientDocRef, { patientStatus: 'IPD' });
  }, []);

  const dischargePatient = useCallback(async (patientId: string): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    await updateDoc(patientDocRef, { patientStatus: 'Discharged' });
  }, []);

  return {
    patients,
    isLoading,
    addPatient,
    getPatientById,
    updatePatient,
    deletePatient,
    admitPatient,
    dischargePatient,
    addVisitToPatient,
  };
}
