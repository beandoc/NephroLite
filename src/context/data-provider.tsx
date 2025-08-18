
"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Patient, PatientFormData, Visit, VisitFormData, ClinicalProfile, ClinicalVisitData, InvestigationRecord, Appointment } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { VACCINATION_NAMES } from '@/lib/constants';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS } from '@/lib/mock-data';

// Define the shape of the context data
export interface DataContextType {
  // Patient Data
  patients: Patient[];
  isLoading: boolean;
  addPatient: (patientData: PatientFormData) => Promise<Patient>;
  getPatientById: (id: string) => Patient | null;
  currentPatient: (id: string) => Patient | undefined;
  updatePatient: (patientId: string, updatedData: Partial<PatientFormData & { isTracked?: boolean }>) => void;
  deletePatient: (patientId: string) => void;
  admitPatient: (patientId: string) => void;
  dischargePatient: (patientId: string) => void;
  addVisitToPatient: (patientId: string, visitData: VisitFormData) => void;
  updateVisitData: (patientId: string, visitId: string, data: ClinicalVisitData) => void;
  addOrUpdateInvestigationRecord: (patientId: string, record: InvestigationRecord) => void;
  deleteInvestigationRecord: (patientId: string, recordId: string) => void;
  updateClinicalProfile: (patientId: string, clinicalProfileData: ClinicalProfile) => void;

  // Appointment Data
  appointments: Appointment[];
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'status' | 'patientName' | 'createdAt'>, patient: Patient) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  updateMultipleAppointmentStatuses: (updates: { id: string, status: Appointment['status'] }[]) => Promise<void>;
  updateAppointment: (updatedAppointmentData: Appointment) => Promise<void>;
}

// Create the context
export const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper functions for patient data management
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

const calculateInitialLastId = (patients: Patient[]): number => {
    if (patients.length === 0) return 1000;
    return patients.reduce((max, p) => {
        const idPart = parseInt(p.nephroId.split('/')[0], 10);
        return isNaN(idPart) ? max : Math.max(idPart, max);
    }, 1000);
}


// Create the Provider component
export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  // --- STATE MANAGEMENT ---
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [lastId, setLastId] = useState(() => calculateInitialLastId(MOCK_PATIENTS));
  const [isLoading, setIsLoading] = useState(false);


  // --- PATIENT DATA LOGIC ---
  const addPatient = useCallback(async (patientData: PatientFormData): Promise<Patient> => {
      const newIdNumber = lastId + 1;
      setLastId(newIdNumber);
      
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
          createdAt: '2024-08-10T12:00:00.000Z',
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
    const foundPatient = patients.find(p => p.id === id);
    return foundPatient || null;
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
        if (updatedData.address) updatedPatient.address = { ...p.address, ...updatedData.address };
        if (updatedData.guardian) updatedPatient.guardian = { ...p.guardian, ...updatedData.guardian };
        if (updatedData.isTracked !== undefined) updatedPatient.isTracked = updatedData.isTracked;
        if (updatedData.uhid !== undefined) updatedPatient.clinicalProfile.aabhaNumber = updatedData.uhid;
        if (updatedData.whatsappNumber !== undefined) updatedPatient.clinicalProfile.whatsappNumber = updatedData.whatsappNumber;
        return updatedPatient;
    }));
  }, [patients]);

  const updateClinicalProfile = useCallback((patientId: string, clinicalProfileData: ClinicalProfile): void => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, clinicalProfile: clinicalProfileData } : p));
  }, [patients]);

  const addVisitToPatient = useCallback((patientId: string, visitData: VisitFormData): void => {
    setPatients(prevPatients => prevPatients.map(p => {
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
      const newPomr = p.clinicalProfile.pomr ? `${p.clinicalProfile.pomr}\n${visitRemarkEntry}` : visitRemarkEntry;
      return { ...p, visits: newVisits, clinicalProfile: { ...p.clinicalProfile, tags: newTags, primaryDiagnosis: newPrimaryDiagnosis, pomr: newPomr }};
    }));
  }, [patients]);

  const updateVisitData = useCallback((patientId: string, visitId: string, data: ClinicalVisitData): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;
        const updatedVisits = p.visits.map(v => {
            if (v.id !== visitId) return v;
            const updatedVisit = { ...v };
            updatedVisit.clinicalData = { ...updatedVisit.clinicalData, ...data };
            if (data.diagnoses && data.diagnoses.length > 0) updatedVisit.diagnoses = data.diagnoses;
            else if (data.diagnoses === undefined) {} else { updatedVisit.diagnoses = []; }
            return updatedVisit;
        });
        return { ...p, visits: updatedVisits };
    }));
  }, [patients]);
  
  const addOrUpdateInvestigationRecord = useCallback((patientId: string, record: InvestigationRecord): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;
        const records = p.investigationRecords || [];
        const existingRecordIndex = records.findIndex(r => r.id === record.id);
        if (existingRecordIndex > -1) { records[existingRecordIndex] = record; }
        else { record.id = record.id || crypto.randomUUID(); records.push(record); }
        return { ...p, investigationRecords: [...records] };
    }));
  }, [patients]);
  
  const deleteInvestigationRecord = useCallback((patientId: string, recordId: string): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;
        return { ...p, investigationRecords: (p.investigationRecords || []).filter(r => r.id !== recordId) };
    }));
  }, [patients]);

  const deletePatient = useCallback((patientId: string): void => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
  }, [patients]);

  const admitPatient = useCallback((patientId: string): void => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, patientStatus: 'IPD' } : p));
  }, [patients]);

  const dischargePatient = useCallback((patientId: string): void => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, patientStatus: 'OPD' } : p));
  }, [patients]);
  
  const currentPatient = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  // --- APPOINTMENT DATA LOGIC ---
  const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'status' | 'patientName' | 'createdAt'>, patient: Patient): Promise<Appointment> => {
    const nowISO = new Date().toISOString();
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      ...appointmentData,
      patientName: patient.name,
      status: 'Scheduled',
      createdAt: '2024-08-10T12:00:00.000Z',
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  }, [appointments]);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status']): Promise<void> => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  }, [appointments]);

  const updateMultipleAppointmentStatuses = useCallback(async (updates: { id: string, status: Appointment['status'] }[]): Promise<void> => {
    setAppointments(prev => {
        let newAppointments = [...prev];
        updates.forEach(update => {
            newAppointments = newAppointments.map(app => app.id === update.id ? { ...app, status: update.status } : app);
        });
        return newAppointments;
    });
  }, [appointments]);

  const updateAppointment = useCallback(async (updatedAppointmentData: Appointment): Promise<void> => {
    setAppointments(prev => prev.map(app => app.id === updatedAppointmentData.id ? updatedAppointmentData : app));
  }, [appointments]);

  // --- PROVIDER VALUE ---
  const value = useMemo(() => ({
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
    appointments,
    addAppointment,
    updateAppointmentStatus,
    updateMultipleAppointmentStatuses,
    updateAppointment
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
    appointments,
    addAppointment,
    updateAppointmentStatus,
    updateMultipleAppointmentStatuses,
    updateAppointment
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
