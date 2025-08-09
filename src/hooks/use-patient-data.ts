

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Patient, PatientFormData, Visit, VisitFormData, ClinicalProfile, ClinicalVisitData, InvestigationRecord } from '@/lib/types';
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
  hasDiabetes: false,
  onAntiHypertensiveMedication: false,
  onLipidLoweringMedication: false,
});

// A single sample patient for safe, one-time seeding
const samplePatient: Omit<Patient, 'id'> = {
  nephroId: '1001/0824',
  name: 'Sachin Test New',
  dob: '1985-05-20',
  gender: 'Male',
  contact: '9876543210',
  email: 'sachin.new@example.com',
  address: { street: '123 Test Lane', city: 'Testville', state: 'Delhi', pincode: '110001' },
  guardian: { name: 'Guardian Test', relation: 'Spouse', contact: '9876543211' },
  registrationDate: '2024-08-23',
  patientStatus: 'OPD',
  isTracked: true,
  residenceType: 'Urban',
  visits: [],
  investigationRecords: [],
  clinicalProfile: {
    primaryDiagnosis: 'Chronic Kidney Disease (CKD)',
    tags: ['CKD', 'Hypertension'],
    nutritionalStatus: 'Well-nourished',
    disability: 'None',
    subspecialityFollowUp: 'NIL',
    smokingStatus: 'No',
    alcoholConsumption: 'No',
    vaccinations: getDefaultVaccinations(),
    pomr: '[2024-08-23] Initial registration visit.',
    aabhaNumber: '12-3456-7890-1234',
    bloodGroup: 'O+',
    drugAllergies: 'None',
    whatsappNumber: '9876543210',
    hasDiabetes: true,
    onAntiHypertensiveMedication: true,
    onLipidLoweringMedication: false,
  },
};


export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startTime = performance.now();
    const q = collection(db, 'patients');
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // Safe, one-time seeding logic. Only runs if the collection is truly empty.
      if (querySnapshot.empty) {
        console.log("Patient collection is empty. Seeding initial sample patient...");
        try {
          // This prevents an infinite loop by not re-triggering the listener immediately
          // We add one document, and the listener will then pick it up on its own.
          await addDoc(collection(db, 'patients'), samplePatient);
          console.log("Sample patient seeded successfully.");
        } catch (error) {
          console.error("Error seeding initial patient:", error);
           // If seeding fails, we still need to set loading to false.
          setPatients([]);
          setIsLoading(false);
        }
        // The listener will re-trigger with the new data, so we can exit here.
        return;
      }
      
      const patientsData: Patient[] = [];
      querySnapshot.forEach((doc) => {
        patientsData.push({ id: doc.id, ...doc.data() } as Patient);
      });
      setPatients(patientsData);
      
      if (isLoading) {
        const endTime = performance.now();
        console.log(`[Performance] Patient data loaded in ${(endTime - startTime).toFixed(1)}ms`);
      }
      setIsLoading(false);

    }, (error) => {
      console.error("Error fetching patients: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isLoading]);

  const addPatient = useCallback(async (patientData: PatientFormData): Promise<Patient> => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // Efficiently get the last patient ID for the current month/year to increment it.
    const q = query(collection(db, 'patients'), where('nephroId', '>=', `1000/${month}${year}`), where('nephroId', '<=', `9999/${month}${year}`));
    const querySnapshot = await getDocs(q);
    const relevantPatients = querySnapshot.docs.map(doc => doc.data() as Patient);

    const maxId = relevantPatients.reduce((max, p) => {
        const numPart = p.nephroId.split('/')[0];
        const num = parseInt(numPart, 10);
        return !isNaN(num) && num > max ? num : max;
    }, 1000);

    const newIdNumber = maxId === 1000 && relevantPatients.length === 0 ? 1001 : maxId + 1;
    
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
      investigationRecords: [],
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

    // Create a mutable copy to avoid modifying the original updatedData
    const restOfData = { ...updatedData };
    delete (restOfData as any).uhid;
    delete (restOfData as any).whatsappNumber;

    const dataToUpdate: Record<string, any> = { ...restOfData };
    
    if (aabhaNumber !== undefined) {
      dataToUpdate['clinicalProfile.aabhaNumber'] = aabhaNumber;
    }
    if (whatsappNumber !== undefined) {
      dataToUpdate['clinicalProfile.whatsappNumber'] = whatsappNumber;
    }
    
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
      patientId: patient.id,
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

  const updateVisitData = useCallback(async (patientId: string, visitId: string, data: ClinicalVisitData): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientDocRef);

    if (!patientDoc.exists()) {
      throw new Error("Patient not found");
    }

    const patient = patientDoc.data() as Patient;
    const visitIndex = patient.visits.findIndex(v => v.id === visitId);

    if (visitIndex === -1) {
      throw new Error("Visit not found");
    }
    
    const updatedVisits = [...patient.visits];
    const existingVisit = updatedVisits[visitIndex];
    
    existingVisit.clinicalData = { ...existingVisit.clinicalData, ...data };
    
    if (data.diagnoses && data.diagnoses.length > 0) {
      existingVisit.diagnoses = data.diagnoses;
    } else if (data.diagnoses === undefined) {
      // Do nothing, keep existing diagnoses
    } else {
       existingVisit.diagnoses = [];
    }

    await updateDoc(patientDocRef, {
      visits: updatedVisits,
    });
  }, []);
  
  const addOrUpdateInvestigationRecord = useCallback(async (patientId: string, record: InvestigationRecord): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientDocRef);
    if (!patientDoc.exists()) throw new Error("Patient not found");

    const patient = patientDoc.data() as Patient;
    const records = patient.investigationRecords || [];
    
    const existingRecordIndex = records.findIndex(r => r.id === record.id);

    if (existingRecordIndex > -1) {
      records[existingRecordIndex] = record;
    } else {
      record.id = record.id || crypto.randomUUID();
      records.push(record);
    }

    await updateDoc(patientDocRef, { investigationRecords: records });
  }, []);
  
  const deleteInvestigationRecord = useCallback(async (patientId: string, recordId: string): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientDocRef);
    if (!patientDoc.exists()) throw new Error("Patient not found");

    const patient = patientDoc.data() as Patient;
    const records = patient.investigationRecords || [];
    const updatedRecords = records.filter(r => r.id !== recordId);

    await updateDoc(patientDocRef, { investigationRecords: updatedRecords });
  }, []);

  const deletePatient = useCallback(async (patientId: string): Promise<void> => {
    const appointmentsQuery = query(collection(db, 'appointments'), where('patientId', '==', patientId));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    const batch = writeBatch(db);
    
    appointmentsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

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
    await updateDoc(patientDocRef, { patientStatus: 'OPD' });
  }, []);

  return useMemo(() => ({
    patients,
    isLoading,
    addPatient,
    getPatientById,
    updatePatient,
    deletePatient,
    admitPatient,
    dischargePatient,
    addVisitToPatient,
    updateVisitData,
    addOrUpdateInvestigationRecord,
    deleteInvestigationRecord,
  }), [
    patients, 
    isLoading, 
    addPatient, 
    getPatientById, 
    updatePatient, 
    deletePatient, 
    admitPatient, 
    dischargePatient, 
    addVisitToPatient, 
    updateVisitData, 
    addOrUpdateInvestigationRecord, 
    deleteInvestigationRecord
  ]);
}
