
"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Patient, PatientFormData, Visit, VisitFormData, ClinicalProfile, ClinicalVisitData, InvestigationRecord, Appointment, InvestigationMaster, InvestigationPanel, Vaccination } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { VACCINATION_NAMES, MOCK_USER } from '@/lib/constants';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS } from '@/lib/mock-data';
import { INVESTIGATION_MASTER_LIST, INVESTIGATION_PANELS } from '@/lib/constants';

// Define the shape of the context data
export interface DataContextType {
  // Patient Data
  patients: Patient[];
  isLoading: boolean;
  addPatient: (patientData: PatientFormData) => Promise<Patient>;
  getPatientById: (id: string) => Patient | null;
  currentPatient: (id: string) => Patient | undefined;
  updatePatient: (patientId: string, updatedData: Partial<PatientFormData & { isTracked?: boolean, patientStatus?: Patient['patientStatus'] }>) => void;
  deletePatient: (patientId: string) => void;
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

  // Investigation Database
  investigationMasterList: InvestigationMaster[];
  investigationPanels: InvestigationPanel[];
  addOrUpdateInvestigation: (investigation: InvestigationMaster) => void;
  deleteInvestigation: (investigationId: string) => void;
  addOrUpdatePanel: (panel: InvestigationPanel) => void;
  deletePanel: (panelId: string) => void;
}

// Create the context
export const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper functions for patient data management
const getDefaultVaccinations = (): Vaccination[] => {
  const vaccineSchedules: Record<string, number> = {
    'Hepatitis B': 4,
    'Pneumococcal': 2,
    'Influenza': 1,
    'Covid': 2,
    'Varicella': 2,
  };

  return VACCINATION_NAMES.map(name => ({
    name: name,
    totalDoses: vaccineSchedules[name] || 1,
    nextDoseDate: null,
    doses: Array.from({ length: vaccineSchedules[name] || 1 }, (_, i) => ({
      id: `${name.replace(/\s/g, '')}-${i + 1}`,
      doseNumber: i + 1,
      administered: false,
      date: null,
    }))
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
  const [investigationMasterList, setInvestigationMasterList] = useState<InvestigationMaster[]>(INVESTIGATION_MASTER_LIST);
  const [investigationPanels, setInvestigationPanels] = useState<InvestigationPanel[]>(INVESTIGATION_PANELS);
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
          firstName: patientData.firstName,
          lastName: patientData.lastName,
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
              name: patientData.guardian.relation === 'Self' ? [patientData.firstName, patientData.lastName].filter(Boolean).join(' ') : (patientData.guardian.name || ""),
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
    const foundPatient = patients.find(p => p.id === id);
    return foundPatient || null;
  }, [patients]);
  
  const updatePatient = useCallback((patientId: string, updatedData: Partial<PatientFormData & { isTracked?: boolean, patientStatus?: Patient['patientStatus'] }>): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;
        const updatedPatient = { ...p };
        const patientFormKeys: Array<keyof PatientFormData> = ['firstName', 'lastName', 'dob', 'gender', 'contact', 'email'];
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
        if (updatedData.patientStatus !== undefined) updatedPatient.patientStatus = updatedData.patientStatus;
        return updatedPatient;
    }));
  }, []);

  const updateClinicalProfile = useCallback((patientId: string, clinicalProfileData: ClinicalProfile): void => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, clinicalProfile: clinicalProfileData } : p));
  }, []);

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
  }, []);

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
  }, []);
  
  const addOrUpdateInvestigationRecord = useCallback((patientId: string, record: InvestigationRecord): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;
        const records = p.investigationRecords || [];
        const existingRecordIndex = records.findIndex(r => r.id === record.id);
        if (existingRecordIndex > -1) { records[existingRecordIndex] = record; }
        else { record.id = record.id || crypto.randomUUID(); records.push(record); }
        return { ...p, investigationRecords: [...records] };
    }));
  }, []);
  
  const deleteInvestigationRecord = useCallback((patientId: string, recordId: string): void => {
    setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;
        return { ...p, investigationRecords: (p.investigationRecords || []).filter(r => r.id !== recordId) };
    }));
  }, []);

  const deletePatient = useCallback((patientId: string): void => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setAppointments(prev => prev.filter(a => a.patientId !== patientId));
  }, []);

  const currentPatient = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  // --- APPOINTMENT DATA LOGIC ---
  const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'status' | 'patientName' | 'createdAt'>, patient: Patient): Promise<Appointment> => {
    const nowISO = new Date().toISOString();
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      ...appointmentData,
      patientName: [patient.firstName, patient.lastName].filter(Boolean).join(' '),
      status: 'Scheduled',
      createdAt: nowISO,
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  }, []);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status']): Promise<void> => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  }, []);

  const updateMultipleAppointmentStatuses = useCallback(async (updates: { id: string, status: Appointment['status'] }[]): Promise<void> => {
    setAppointments(prev => {
        let newAppointments = [...prev];
        updates.forEach(update => {
            newAppointments = newAppointments.map(app => app.id === update.id ? { ...app, status: update.status } : app);
        });
        return newAppointments;
    });
  }, []);

  const updateAppointment = useCallback(async (updatedAppointmentData: Appointment): Promise<void> => {
    setAppointments(prev => prev.map(app => app.id === updatedAppointmentData.id ? updatedAppointmentData : app));
  }, []);

  // --- INVESTIGATION DATABASE LOGIC ---
  const addOrUpdateInvestigation = useCallback((investigation: InvestigationMaster) => {
    setInvestigationMasterList(prev => {
      const index = prev.findIndex(item => item.id === investigation.id);
      if (index > -1) {
        const newList = [...prev];
        newList[index] = investigation;
        return newList;
      }
      return [...prev, { ...investigation, id: investigation.id || crypto.randomUUID() }];
    });
  }, []);

  const deleteInvestigation = useCallback((investigationId: string) => {
    setInvestigationMasterList(prev => prev.filter(item => item.id !== investigationId));
    // Also remove from any panels
    setInvestigationPanels(prev => prev.map(panel => ({
      ...panel,
      testIds: panel.testIds.filter(id => id !== investigationId)
    })));
  }, []);

  const addOrUpdatePanel = useCallback((panel: InvestigationPanel) => {
    setInvestigationPanels(prev => {
      const index = prev.findIndex(item => item.id === panel.id);
      if (index > -1) {
        const newList = [...prev];
        newList[index] = panel;
        return newList;
      }
      return [...prev, { ...panel, id: panel.id || crypto.randomUUID() }];
    });
  }, []);

  const deletePanel = useCallback((panelId: string) => {
    setInvestigationPanels(prev => prev.filter(item => item.id !== panelId));
  }, []);

  // --- PROVIDER VALUE ---
  const value = useMemo(() => ({
    patients,
    isLoading,
    addPatient,
    getPatientById,
    updatePatient,
    deletePatient,
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
    updateAppointment,
    investigationMasterList,
    investigationPanels,
    addOrUpdateInvestigation,
    deleteInvestigation,
    addOrUpdatePanel,
    deletePanel,
  }), [
    patients, 
    isLoading, 
    addPatient, 
    getPatientById, 
    updatePatient, 
    deletePatient, 
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
    updateAppointment,
    investigationMasterList,
    investigationPanels,
    addOrUpdateInvestigation,
    deleteInvestigation,
    addOrUpdatePanel,
    deletePanel,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
