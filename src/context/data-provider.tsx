
"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Patient, PatientFormData, Visit, VisitFormData, ClinicalProfile, ClinicalVisitData, InvestigationRecord, Appointment, InvestigationMaster, InvestigationPanel, Intervention, DialysisSession, Diagnosis } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { getDefaultVaccinations } from '@/lib/data-helpers';
import { useAuth } from './auth-provider';
import { api } from '@/api';

// Define the shape of the context data
export interface DataContextType {
  // Patient Data
  patients: Patient[];
  isLoading: boolean;
  addPatient: (patientData: PatientFormData) => Promise<Patient>;
  getPatientById: (id: string) => Patient | null;
  currentPatient: (id: string) => Patient | undefined;
  updatePatient: (patientId: string, updatedData: Partial<Patient>) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  addVisitToPatient: (patientId: string, visitData: {
    id?: string;
    date?: string;
    visitType: string;
    visitRemark: string;
    groupName: string;
    diagnoses?: Diagnosis[];
    clinicalData?: ClinicalVisitData;
  }) => Promise<void>;
  updateVisitData: (patientId: string, visitId: string, data: ClinicalVisitData) => Promise<void>;
  addOrUpdateInvestigationRecord: (patientId: string, record: InvestigationRecord) => Promise<void>;
  deleteInvestigationRecord: (patientId: string, recordId: string) => Promise<void>;
  addOrUpdateIntervention: (patientId: string, intervention: Intervention) => Promise<void>;
  deleteIntervention: (patientId: string, interventionId: string) => Promise<void>;
  updateClinicalProfile: (patientId: string, clinicalProfileData: ClinicalProfile) => Promise<void>;

  // Appointment Data
  appointments: Appointment[];
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  updateMultipleAppointmentStatuses: (updates: { id: string, status: Appointment['status'] }[]) => Promise<void>;
  updateAppointment: (updatedAppointmentData: Appointment) => Promise<void>;

  // Investigation Database
  investigationMasterList: InvestigationMaster[];
  investigationPanels: InvestigationPanel[];
  addOrUpdateInvestigation: (investigation: InvestigationMaster) => Promise<void>;
  deleteInvestigation: (investigationId: string) => Promise<void>;
  addOrUpdatePanel: (panel: InvestigationPanel) => Promise<void>;
  deletePanel: (panelId: string) => Promise<void>;

  // Dialysis
  addOrUpdateDialysisSession: (patientId: string, session: DialysisSession) => Promise<void>;
  deleteDialysisSession: (patientId: string, sessionId: string) => Promise<void>;
}

// Create the context
export const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper functions for patient data management
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
    // Skip patients without nephroId or with invalid format
    if (!p.nephroId || typeof p.nephroId !== 'string') return max;

    const idPart = parseInt(p.nephroId.split('/')[0], 10);
    return isNaN(idPart) ? max : Math.max(idPart, max);
  }, 1000);
}


// Create the Provider component
export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  // --- STATE MANAGEMENT ---
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [investigationMasterList, setInvestigationMasterList] = useState<InvestigationMaster[]>([]);
  const [investigationPanels, setInvestigationPanels] = useState<InvestigationPanel[]>([]);
  const [lastId, setLastId] = useState(1000);
  const [isLoading, setIsLoading] = useState(true);

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) {
        setPatients([]);
        setAppointments([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Parallel fetch for speed
        const [patientsData, apptsData, masterList, panels] = await Promise.all([
          api.patients.getAll(),
          api.appointments.getAll(),
          api.masterData.getInvestigationMasterList(),
          api.masterData.getInvestigationPanels()
        ]);

        setPatients(patientsData);
        setAppointments(apptsData);
        setInvestigationMasterList(masterList);
        setInvestigationPanels(panels);
        setLastId(calculateInitialLastId(patientsData));
        // I should migrate master data api too or mock it.

      } catch (error) {
        console.error("Failed to load initial data from Supabase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  // --- HELPER TO REFRESH PATIENT STATE ---
  const refreshPatient = useCallback(async (patientId: string) => {
    const refreshedPatient = await api.patients.getById(patientId);
    if (refreshedPatient) {
      setPatients(prev => prev.map(p => p.id === patientId ? refreshedPatient : p));
    }
  }, []);

  // --- PATIENT DATA LOGIC ---
  const addPatient = useCallback(async (patientData: PatientFormData): Promise<Patient> => {
    if (!user) throw new Error('User not authenticated');

    const newIdNumber = lastId + 1;
    setLastId(newIdNumber);

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const newNephroId = `${newIdNumber}/${month}${year}`;
    const nowISO = new Date().toISOString();

    const newPatientInput = {
      nephroId: newNephroId,
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      dob: patientData.dob,
      gender: patientData.gender,
      phoneNumber: patientData.contact || "",
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
      patientStatus: 'OPD' as const,
      isTracked: false,
      residenceType: 'Not Set' as const,
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        tags: [],
        whatsappNumber: patientData.whatsappNumber || '',
        aabhaNumber: patientData.uhid || '',
      },
    };

    const createdPatient = await api.patients.create(newPatientInput);
    setPatients(prev => [createdPatient, ...prev]);
    return createdPatient;
  }, [lastId, user]);

  const getPatientById = useCallback((id: string): Patient | null => {
    const foundPatient = patients.find(p => p.id === id);
    return foundPatient || null;
  }, [patients]);

  const updatePatient = useCallback(async (patientId: string, updatedData: Partial<Patient>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const patient = patients.find(p => p.id === patientId);
    const updates: any = { ...updatedData };

    if (patient) {
      if (updatedData.address) updates.address = { ...patient.address, ...updatedData.address };
      if (updatedData.guardian) updates.guardian = { ...patient.guardian, ...updatedData.guardian };
    }

    await api.patients.update(patientId, updates);

    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...updates } : p));
  }, [patients, user]);

  const updateClinicalProfile = useCallback(async (patientId: string, clinicalProfileData: ClinicalProfile): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const profileWithVaccinations = {
      ...clinicalProfileData,
      vaccinations: clinicalProfileData.vaccinations && clinicalProfileData.vaccinations.length > 0
        ? clinicalProfileData.vaccinations
        : getDefaultVaccinations(),
    };

    await api.patients.update(patientId, { clinicalProfile: profileWithVaccinations });
    await refreshPatient(patientId);
  }, [user, refreshPatient]);

  const addVisitToPatient = useCallback(async (
    patientId: string,
    visitData: {
      id?: string;
      date?: string;
      visitType: string;
      visitRemark: string;
      groupName: string;
      diagnoses?: Diagnosis[];
      clinicalData?: ClinicalVisitData;
    }
  ): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const visitInput = {
      patientId,
      visitDate: visitData.date || new Date().toISOString().split('T')[0],
      visitType: visitData.visitType,
      visitRemark: visitData.visitRemark,
      groupName: visitData.groupName,
      diagnoses: visitData.diagnoses || [],
      clinicalData: visitData.clinicalData || {},
    };

    await api.visits.create(visitInput);
    await refreshPatient(patientId);
  }, [user, refreshPatient]);

  const updateVisitData = useCallback(async (patientId: string, visitId: string, data: ClinicalVisitData): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const visit = patient.visits?.find(v => v.id === visitId);
    const existingClinicalData = visit?.clinicalData || {};
    const updatedClinicalData = { ...existingClinicalData, ...data };

    const updates: any = { clinicalData: updatedClinicalData };
    if (data.diagnoses) updates.diagnoses = data.diagnoses;

    await api.visits.update(visitId, updates);
    await refreshPatient(patientId);
  }, [user, patients, refreshPatient]);

  const addOrUpdateInvestigationRecord = useCallback(async (patientId: string, record: InvestigationRecord): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const patient = patients.find(p => p.id === patientId);
    const existing = patient?.investigationRecords?.find(r => r.id === record.id);

    if (existing) {
      await api.investigations.update(record.id, {
        date: record.date,
        tests: record.tests,
        notes: record.notes
      });
    } else {
      await api.investigations.create({
        patientId,
        date: record.date,
        tests: record.tests,
        notes: record.notes
      });
    }

    await refreshPatient(patientId);
  }, [user, patients, refreshPatient]);

  const deleteInvestigationRecord = useCallback(async (patientId: string, recordId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await api.investigations.delete(recordId);
    await refreshPatient(patientId);
  }, [user, refreshPatient]);

  const addOrUpdateIntervention = useCallback(async (patientId: string, intervention: Intervention): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const patient = patients.find(p => p.id === patientId);
    const existing = patient?.interventions?.find(i => i.id === intervention.id);

    if (existing) {
      await api.interventions.update(intervention.id, intervention);
    } else {
      await api.interventions.create(patientId, intervention);
    }
    await refreshPatient(patientId);
  }, [user, patients, refreshPatient]);

  const deleteIntervention = useCallback(async (patientId: string, interventionId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await api.interventions.delete(interventionId);
    await refreshPatient(patientId);
  }, [user, refreshPatient]);

  const addOrUpdateDialysisSession = useCallback(async (patientId: string, session: DialysisSession): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const patient = patients.find(p => p.id === patientId);
    const existing = patient?.dialysisSessions?.find(s => s.id === session.id);

    if (existing) {
      await api.dialysis.update(session.id, session);
    } else {
      await api.dialysis.create(patientId, session);
    }
    await refreshPatient(patientId);
  }, [user, patients, refreshPatient]);

  const deleteDialysisSession = useCallback(async (patientId: string, sessionId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await api.dialysis.delete(sessionId);
    await refreshPatient(patientId);
  }, [user, refreshPatient]);

  const deletePatient = useCallback(async (patientId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await api.patients.delete(patientId);
    setPatients(prev => prev.filter(p => p.id !== patientId));
  }, [user]);

  const currentPatient = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  // --- APPOINTMENT DATA LOGIC ---
  const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt'>): Promise<Appointment> => {
    if (!user) throw new Error('User not authenticated');

    const newAppointment = await api.appointments.create({
      patientId: appointmentData.patientId,
      // patientName not in Input
      date: appointmentData.date,
      time: appointmentData.time,
      type: appointmentData.type,
      doctorName: appointmentData.doctorName,
      notes: appointmentData.notes,
      status: 'Scheduled',
    });

    setAppointments(prev => [newAppointment, ...prev]);
    return newAppointment;
  }, [user]);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status']): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await api.appointments.update(id, { status });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }, [user]);

  const updateMultipleAppointmentStatuses = useCallback(async (updates: { id: string, status: Appointment['status'] }[]): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    await Promise.all(
      updates.map(update => api.appointments.update(update.id, { status: update.status }))
    );

    setAppointments(prev => prev.map(a => {
      const update = updates.find(u => u.id === a.id);
      return update ? { ...a, status: update.status } : a;
    }));
  }, [user]);

  const updateAppointment = useCallback(async (updatedAppointmentData: Appointment): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    const { id, ...updates } = updatedAppointmentData;
    await api.appointments.update(id, updates);
    setAppointments(prev => prev.map(a => a.id === id ? updatedAppointmentData : a));
  }, [user]);

  // --- INVESTIGATION DATABASE LOGIC ---
  const addOrUpdateInvestigation = useCallback(async (investigation: InvestigationMaster): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    // Update Supabase
    await api.masterData.upsertInvestigationMaster(investigation);

    // Update Local State
    const newList = [...investigationMasterList];
    const index = newList.findIndex(item => item.id === investigation.id);

    if (index > -1) {
      newList[index] = investigation;
    } else {
      newList.push({ ...investigation, id: investigation.id || crypto.randomUUID() });
    }
    setInvestigationMasterList(newList);
  }, [user, investigationMasterList]);

  const deleteInvestigation = useCallback(async (investigationId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    // Update Supabase
    await api.masterData.deleteInvestigationMaster(investigationId);

    // Update Local State
    const newList = investigationMasterList.filter(item => item.id !== investigationId);
    setInvestigationMasterList(newList);

    // Also remove from panels locally (and maybe Supabase? Panels implementation handles its own structure)
    // IMPORTANT: If we delete a test, we should probably update panels too. 
    // But for now, just local update is fine or separate call.
    // The previous implementation updated panels locally.

    const newPanels = investigationPanels.map(panel => ({
      ...panel,
      testIds: panel.testIds.filter(id => id !== investigationId)
    }));
    setInvestigationPanels(newPanels);
  }, [user, investigationMasterList, investigationPanels]);

  const addOrUpdatePanel = useCallback(async (panel: InvestigationPanel): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    await api.masterData.upsertInvestigationPanel(panel);

    const newPanels = [...investigationPanels];
    const index = newPanels.findIndex(item => item.id === panel.id);

    if (index > -1) {
      newPanels[index] = panel;
    } else {
      newPanels.push({ ...panel, id: panel.id || crypto.randomUUID() });
    }
    setInvestigationPanels(newPanels);
  }, [user, investigationPanels]);

  const deletePanel = useCallback(async (panelId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    await api.masterData.deleteInvestigationPanel(panelId);

    const newPanels = investigationPanels.filter(item => item.id !== panelId);
    setInvestigationPanels(newPanels);
  }, [user, investigationPanels]);

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
    addOrUpdateIntervention,
    deleteIntervention,
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
    addOrUpdateDialysisSession,
    deleteDialysisSession,
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
    addOrUpdateIntervention,
    deleteIntervention,
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
    addOrUpdateDialysisSession,
    deleteDialysisSession,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
