
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Patient, PatientFormData, Visit, VisitFormData, ClinicalProfile, ClinicalVisitData, InvestigationRecord } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { VACCINATION_NAMES } from '@/lib/constants';
import { MOCK_PATIENTS } from '@/lib/mock-data';


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

  // This state will track the last used ID to avoid recalculating it.
  const [lastId, setLastId] = useState(1000);

  useEffect(() => {
    // Simulate loading mock data and setting the initial lastId
    const initialPatients = MOCK_PATIENTS;
    setPatients(initialPatients);
    if (initialPatients.length > 0) {
        const maxId = initialPatients.reduce((max, p) => Math.max(parseInt(p.nephroId.split('/')[0], 10), max), 1000);
        setLastId(maxId);
    }
    setIsLoading(false);
  }, []);

 const addPatient = useCallback(async (patientData: PatientFormData): Promise<Patient> => {
    const newIdNumber = lastId + 1;
    setLastId(newIdNumber); // Immediately update the last used ID

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const newNephroId = `${newIdNumber}/${month}${year}`;

    const nowISO = new Date().toISOString();
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      nephroId: newNephroId,
      name: patientData.name,
      dob: patientData.dob,
      gender: patientData.gender,
      contact: patientData.contact || "",
      email: patientData.email || "",
      address: {
        street: patientData.address.street || "",
        city: patientData.address.city || "",
        state: patientData.address.state || "",
        pincode: patientData.address.pincode || "",
      },
      guardian: {
        name: patientData.guardian.relation === 'Self' ? patientData.name : (patientData.guardian.name || ""),
        relation: patientData.guardian.relation || "",
        contact: patientData.guardian.relation === 'Self' ? (patientData.contact || "") : (patientData.guardian.contact || ""),
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
    
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  }, [lastId]);

  const getPatientById = useCallback((id: string): Patient | null => {
    return patients.find(p => p.id === id) || null;
  }, [patients]);
  
  const updatePatient = useCallback((patientId: string, updatedData: Partial<PatientFormData & { isTracked?: boolean }>): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;

        const updatedPatient = { ...p };
        
        const patientFormKeys: Array<keyof PatientFormData> = ['name', 'dob', 'gender', 'contact', 'email'];
        patientFormKeys.forEach(key => {
            if (updatedData[key] !== undefined) {
                (updatedPatient as any)[key] = updatedData[key];
            }
        });
        
        if (updatedData.address) updatedPatient.address = { ...p.address, ...updatedData.address};
        if (updatedData.guardian) updatedPatient.guardian = { ...p.guardian, ...updatedData.guardian };
        if (updatedData.isTracked !== undefined) updatedPatient.isTracked = updatedData.isTracked;

        if (updatedData.uhid !== undefined) updatedPatient.clinicalProfile.aabhaNumber = updatedData.uhid;
        if (updatedData.whatsappNumber !== undefined) updatedPatient.clinicalProfile.whatsappNumber = updatedData.whatsappNumber;

        return updatedPatient;
    }));
  }, []);
  
  const updateClinicalProfile = useCallback((patientId: string, clinicalProfileData: ClinicalProfile): void => {
    setPatients(prev => prev.map(p => 
        p.id === patientId ? { ...p, clinicalProfile: clinicalProfileData } : p
    ));
  }, []);


  const addVisitToPatient = useCallback((patientId: string, visitData: VisitFormData): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;

        const nowISO = new Date().toISOString();
        const newVisit: Visit = {
          id: crypto.randomUUID(),
          date: nowISO.split('T')[0],
          createdAt: nowISO,
          ...visitData,
          patientGender: p.gender,
          patientRelation: p.guardian.relation,
          patientId: p.id,
        };

        const newVisits = [...(p.visits || []), newVisit];
        const newTags = Array.from(new Set([...(p.clinicalProfile.tags || []), visitData.groupName]));
        
        let newPrimaryDiagnosis = p.clinicalProfile.primaryDiagnosis;
        if (newPrimaryDiagnosis === 'Not Set' && visitData.groupName !== 'Misc') {
            newPrimaryDiagnosis = visitData.groupName;
        }

        const visitRemarkEntry = `[${format(parseISO(newVisit.date), 'yyyy-MM-dd')}] Visit (${newVisit.visitType}): ${newVisit.visitRemark}`;
        const newPomr = p.clinicalProfile.pomr 
          ? `${p.clinicalProfile.pomr}\n${visitRemarkEntry}`
          : visitRemarkEntry;

        return {
            ...p,
            visits: newVisits,
            clinicalProfile: {
                ...p.clinicalProfile,
                tags: newTags,
                primaryDiagnosis: newPrimaryDiagnosis,
                pomr: newPomr,
            }
        };
    }));
  }, []);

  const updateVisitData = useCallback((patientId: string, visitId: string, data: ClinicalVisitData): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;
        
        const updatedVisits = p.visits.map(v => {
            if (v.id !== visitId) return v;
            
            const updatedVisit = { ...v };
            updatedVisit.clinicalData = { ...updatedVisit.clinicalData, ...data };
            if (data.diagnoses && data.diagnoses.length > 0) {
              updatedVisit.diagnoses = data.diagnoses;
            } else if (data.diagnoses === undefined) {
              // Do nothing if diagnoses is undefined, keep existing
            } else {
              updatedVisit.diagnoses = [];
            }
            return updatedVisit;
        });

        return { ...p, visits: updatedVisits };
    }));
  }, []);
  
  const addOrUpdateInvestigationRecord = useCallback((patientId: string, record: InvestigationRecord): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;
        
        const records = p.investigationRecords || [];
        const existingRecordIndex = records.findIndex(r => r.id === record.id);

        if (existingRecordIndex > -1) {
          records[existingRecordIndex] = record;
        } else {
          record.id = record.id || crypto.randomUUID();
          records.push(record);
        }
        return { ...p, investigationRecords: [...records] };
    }));
  }, []);
  
  const deleteInvestigationRecord = useCallback((patientId: string, recordId: string): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;
        const updatedRecords = (p.investigationRecords || []).filter(r => r.id !== recordId);
        return { ...p, investigationRecords: updatedRecords };
    }));
  }, []);

  const deletePatient = useCallback((patientId: string): void => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
  }, []);

  const admitPatient = useCallback((patientId: string): void => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, patientStatus: 'IPD' } : p));
  }, []);

  const dischargePatient = useCallback((patientId: string): void => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, patientStatus: 'OPD' } : p));
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
