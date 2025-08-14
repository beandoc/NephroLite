
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch, query, where, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Patient, PatientFormData, Visit, VisitFormData, ClinicalProfile, ClinicalVisitData, InvestigationRecord } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { VACCINATION_NAMES } from '@/lib/constants';


const getDefaultVaccinations = () => {
  return VACCINATION_NAMES.map(name => ({
    name: name,
    administered: false,
    date: null,
    nextDoseDate: null
  }));
};

const getInitialClinicalProfile = (): Omit<ClinicalProfile, 'tags'> => ({
  primaryDiagnosis: "Not Set",
  nutritionalStatus: "Not Set",
  disability: "None",
  subspecialityFollowUp: 'NIL',
  smokingStatus: 'NIL',
  alcoholConsumption: 'NIL',
  vaccinations: getDefaultVaccinations(),
  pomr: "",
  aabhaNumber: "",
  bloodGroup: "Unknown",
  drugAllergies: "",
  whatsappNumber: "",
  hasDiabetes: false,
  onAntiHypertensiveMedication: false,
  onLipidLoweringMedication: false,
});


export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startTime = performance.now();
    const q = collection(db, 'patients');
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const patientsData: Patient[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patientsData.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt || data.registrationDate 
        } as Patient);
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
    const counterRef = doc(db, 'counters', 'patientCounter');
    
    const newNephroId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let newIdNumber = 1001; 
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { currentId: newIdNumber });
      } else {
        newIdNumber = counterDoc.data().currentId + 1;
        transaction.update(counterRef, { currentId: newIdNumber });
      }
      
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      return `${newIdNumber}/${month}${year}`;
    });

    const nowISO = new Date().toISOString();
    const newPatientData: Omit<Patient, 'id'> = {
      nephroId: newNephroId,
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
        name: patientData.guardian.relation === 'Self' ? patientData.name : (patientData.guardian.name || ""),
        relation: patientData.guardian.relation || "",
        contact: patientData.guardian.relation === 'Self' ? patientData.contact : (patientData.guardian.contact || ""),
      },
      registrationDate: nowISO.split('T')[0],
      createdAt: nowISO,
      patientStatus: 'OPD',
      isTracked: false,
      residenceType: 'Not Set',
      visits: [],
      investigationRecords: [],
      nextAppointmentDate: "",
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

  const getPatientById = useCallback(async (id: string): Promise<Patient | null> => {
    const patientDocRef = doc(db, 'patients', id);
    const docSnap = await getDoc(patientDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
             id: docSnap.id,
             ...data,
            createdAt: data.createdAt || data.registrationDate 
        } as Patient;
    }
    return null;
  }, []);
  
  const updatePatient = useCallback(async (patientId: string, updatedData: Partial<PatientFormData & { isTracked?: boolean }>): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    
    const dataToUpdate: Record<string, any> = {};

    const patientFormKeys: Array<keyof PatientFormData> = ['name', 'dob', 'gender', 'contact', 'email'];
    patientFormKeys.forEach(key => {
        if (updatedData[key] !== undefined) {
            dataToUpdate[key] = updatedData[key];
        }
    });
    
    if (updatedData.address) dataToUpdate.address = updatedData.address;
    if (updatedData.guardian) dataToUpdate.guardian = updatedData.guardian;
    if (updatedData.isTracked !== undefined) dataToUpdate.isTracked = updatedData.isTracked;

    if (updatedData.uhid !== undefined) dataToUpdate['clinicalProfile.aabhaNumber'] = updatedData.uhid;
    if (updatedData.whatsappNumber !== undefined) dataToUpdate['clinicalProfile.whatsappNumber'] = updatedData.whatsappNumber;

    await updateDoc(patientDocRef, dataToUpdate);
  }, []);
  
  const updateClinicalProfile = useCallback(async (patientId: string, clinicalProfileData: ClinicalProfile): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    await updateDoc(patientDocRef, { clinicalProfile: clinicalProfileData });
  }, []);


  const addVisitToPatient = useCallback(async (patientId: string, visitData: VisitFormData): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    
    await runTransaction(db, async (transaction) => {
        const patientDoc = await transaction.get(patientDocRef);
        if (!patientDoc.exists()) {
          throw new Error("Patient not found");
        }
        
        const patient = patientDoc.data() as Patient;
        const nowISO = new Date().toISOString();
        const newVisit: Visit = {
          id: crypto.randomUUID(),
          date: nowISO.split('T')[0],
          createdAt: nowISO,
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

        const visitRemarkEntry = `[${format(parseISO(newVisit.date), 'yyyy-MM-dd')}] Visit (${newVisit.visitType}): ${newVisit.visitRemark}`;
        const newPomr = patient.clinicalProfile.pomr 
          ? `${patient.clinicalProfile.pomr}\n${visitRemarkEntry}`
          : visitRemarkEntry;

        transaction.update(patientDocRef, {
            visits: newVisits,
            'clinicalProfile.tags': newTags,
            'clinicalProfile.primaryDiagnosis': newPrimaryDiagnosis,
            'clinicalProfile.pomr': newPomr
        });
    });
  }, []);

  const updateVisitData = useCallback(async (patientId: string, visitId: string, data: ClinicalVisitData): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);

    await runTransaction(db, async (transaction) => {
        const patientDoc = await transaction.get(patientDocRef);
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
            // Do nothing if diagnoses is undefined, keep existing
        } else {
           existingVisit.diagnoses = [];
        }

        transaction.update(patientDocRef, {
            visits: updatedVisits,
        });
    });
  }, []);
  
  const addOrUpdateInvestigationRecord = useCallback(async (patientId: string, record: InvestigationRecord): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    
    await runTransaction(db, async (transaction) => {
        const patientDoc = await transaction.get(patientDocRef);
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
        transaction.update(patientDocRef, { investigationRecords: records });
    });
  }, []);
  
  const deleteInvestigationRecord = useCallback(async (patientId: string, recordId: string): Promise<void> => {
    const patientDocRef = doc(db, 'patients', patientId);
    await runTransaction(db, async (transaction) => {
        const patientDoc = await transaction.get(patientDocRef);
        if (!patientDoc.exists()) throw new Error("Patient not found");

        const patient = patientDoc.data() as Patient;
        const records = patient.investigationRecords || [];
        const updatedRecords = records.filter(r => r.id !== recordId);

        transaction.update(patientDocRef, { investigationRecords: updatedRecords });
    });
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
  
  const currentPatient = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

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
    updateClinicalProfile,
    currentPatient,
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
    deleteInvestigationRecord,
    updateClinicalProfile,
    currentPatient,
  ]);
}
