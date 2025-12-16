
"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Patient, PatientFormData, Visit, VisitFormData, ClinicalProfile, ClinicalVisitData, InvestigationRecord, Appointment, InvestigationMaster, InvestigationPanel, Intervention, DialysisSession, Diagnosis } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { getDefaultVaccinations } from '@/lib/data-helpers';
import { useAuth } from './auth-provider';
import * as firestoreHelpers from '@/lib/firestore-helpers';

// Define the shape of the context data
export interface DataContextType {
  // Patient Data
  patients: Patient[];
  isLoading: boolean;
  addPatient: (patientData: PatientFormData) => Promise<Patient>;
  getPatientById: (id: string) => Patient | null;
  currentPatient: (id: string) => Patient | undefined;
  updatePatient: (patientId: string, updatedData: Partial<PatientFormData & { isTracked?: boolean, patientStatus?: Patient['patientStatus'] }>) => Promise<void>;
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

  // --- FIRESTORE SUBSCRIPTIONS ---
  useEffect(() => {
    if (!user) {
      setPatients([]);
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Subscribe to patients
    const unsubscribePatients = firestoreHelpers.subscribeToPatients(
      user.uid,
      (patientsData) => {
        setPatients(patientsData);
        setLastId(calculateInitialLastId(patientsData));
        setIsLoading(false);
      }
    );

    // Subscribe to appointments
    const unsubscribeAppointments = firestoreHelpers.subscribeToAppointments(
      user.uid,
      (appointmentsData) => {
        setAppointments(appointmentsData);
      }
    );

    // Load investigation master data
    firestoreHelpers.getInvestigationMaster(user.uid).then((data) => {
      setInvestigationMasterList(data.investigationMasterList);
      setInvestigationPanels(data.investigationPanels);
    });

    return () => {
      unsubscribePatients();
      unsubscribeAppointments();
    };
  }, [user]);

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
      interventions: [],
      dialysisSessions: [],
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        tags: [],
        whatsappNumber: patientData.whatsappNumber || '',
        aabhaNumber: patientData.uhid || '',
      },
    };

    await firestoreHelpers.createPatient(user.uid, newPatient);
    return newPatient;
  }, [lastId, user]);

  const getPatientById = useCallback((id: string): Patient | null => {
    const foundPatient = patients.find(p => p.id === id);
    return foundPatient || null;
  }, [patients]);

  const updatePatient = useCallback(async (patientId: string, updatedData: Partial<PatientFormData & { isTracked?: boolean, patientStatus?: Patient['patientStatus'] }>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const updates: Partial<Patient> = {};

    const patientFormKeys: Array<keyof PatientFormData> = ['firstName', 'lastName', 'dob', 'gender', 'contact', 'email'];
    patientFormKeys.forEach(key => {
      if (updatedData[key] !== undefined) {
        (updates as any)[key] = updatedData[key];
      }
    });

    if (updatedData.address) updates.address = { ...patient.address, ...updatedData.address };
    if (updatedData.guardian) updates.guardian = { ...patient.guardian, ...updatedData.guardian };
    if (updatedData.isTracked !== undefined) updates.isTracked = updatedData.isTracked;
    if (updatedData.patientStatus !== undefined) updates.patientStatus = updatedData.patientStatus;

    if (updatedData.uhid !== undefined || updatedData.whatsappNumber !== undefined) {
      updates.clinicalProfile = {
        ...patient.clinicalProfile,
        ...(updatedData.uhid !== undefined && { aabhaNumber: updatedData.uhid }),
        ...(updatedData.whatsappNumber !== undefined && { whatsappNumber: updatedData.whatsappNumber })
      };
    }

    await firestoreHelpers.updatePatient(user.uid, patientId, updates);
  }, [patients, user]);

  const updateClinicalProfile = useCallback(async (patientId: string, clinicalProfileData: ClinicalProfile): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const profileWithVaccinations = {
      ...clinicalProfileData,
      vaccinations: clinicalProfileData.vaccinations && clinicalProfileData.vaccinations.length > 0
        ? clinicalProfileData.vaccinations
        : getDefaultVaccinations(),
    };

    await firestoreHelpers.updatePatient(user.uid, patientId, { clinicalProfile: profileWithVaccinations });
  }, [user]);

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

    const patient = await firestoreHelpers.getPatientWithSubcollections(user.uid, patientId);
    if (!patient) throw new Error('Patient not found');

    const visit: Visit = {
      id: visitData.id || crypto.randomUUID(),
      patientId,
      date: visitData.date || new Date().toISOString().split('T')[0], // Default to today
      createdAt: new Date().toISOString(),
      visitType: visitData.visitType,
      visitRemark: visitData.visitRemark,
      groupName: visitData.groupName,
      patientGender: patient.gender,
      patientRelation: patient.guardian?.relation,
      diagnoses: visitData.diagnoses || [],
      clinicalData: visitData.clinicalData || {},
    };

    await firestoreHelpers.addVisit(user.uid, patientId, visit);

    // Refresh patient data to include the new visit from subcollection
    const refreshedPatient = await firestoreHelpers.getPatientWithSubcollections(user.uid, patientId);
    if (refreshedPatient) {
      setPatients(prev => prev.map(p => p.id === patientId ? refreshedPatient : p));
    }
  }, [user]);

  const updateVisitData = useCallback(async (patientId: string, visitId: string, data: ClinicalVisitData): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    // Fetch the full patient with subcollections to get the visit
    const patient = await firestoreHelpers.getPatientWithSubcollections(user.uid, patientId);
    if (!patient) return;

    const visit = patient.visits.find(v => v.id === visitId);
    if (!visit) return;

    const updatedVisit: Partial<Visit> = {
      clinicalData: { ...(visit.clinicalData || {}), ...data }
    };

    if (data?.diagnoses && data.diagnoses.length > 0) {
      updatedVisit.diagnoses = data.diagnoses;
    } else if (data?.diagnoses !== undefined) {
      updatedVisit.diagnoses = [];
    }

    await firestoreHelpers.updateVisit(user.uid, patientId, visitId, updatedVisit);
  }, [user]);

  const addOrUpdateInvestigationRecord = useCallback(async (patientId: string, record: InvestigationRecord): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    if (!record.id) {
      record.id = crypto.randomUUID();
    }

    await firestoreHelpers.addInvestigationRecord(user.uid, patientId, record);
  }, [user]);

  const deleteInvestigationRecord = useCallback(async (patientId: string, recordId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await firestoreHelpers.deleteInvestigationRecord(user.uid, patientId, recordId);
  }, [user]);

  const addOrUpdateIntervention = useCallback(async (patientId: string, intervention: Intervention): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await firestoreHelpers.addIntervention(user.uid, patientId, intervention);
  }, [user]);

  const deleteIntervention = useCallback(async (patientId: string, interventionId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await firestoreHelpers.deleteIntervention(user.uid, patientId, interventionId);
  }, [user]);

  const addOrUpdateDialysisSession = useCallback(async (patientId: string, session: DialysisSession): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    if (!session.id) {
      session.id = crypto.randomUUID();
    }

    await firestoreHelpers.addDialysisSession(user.uid, patientId, session);
  }, [user]);

  const deleteDialysisSession = useCallback(async (patientId: string, sessionId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await firestoreHelpers.deleteDialysisSession(user.uid, patientId, sessionId);
  }, [user]);

  const deletePatient = useCallback(async (patientId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await firestoreHelpers.deletePatient(user.uid, patientId);
  }, [user]);

  const currentPatient = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  // --- APPOINTMENT DATA LOGIC ---
  const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt'>): Promise<Appointment> => {
    if (!user) throw new Error('User not authenticated');

    const nowISO = new Date().toISOString();
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      patientId: appointmentData.patientId,
      patientName: appointmentData.patientName,
      date: appointmentData.date,
      time: appointmentData.time,
      type: appointmentData.type,
      doctorName: appointmentData.doctorName,
      notes: appointmentData.notes,
      status: 'Scheduled',
      createdAt: nowISO,
    };

    await firestoreHelpers.createAppointment(user.uid, newAppointment);
    return newAppointment;
  }, [user]);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status']): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await firestoreHelpers.updateAppointment(user.uid, id, { status });
  }, [user]);

  const updateMultipleAppointmentStatuses = useCallback(async (updates: { id: string, status: Appointment['status'] }[]): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    await Promise.all(
      updates.map(update => firestoreHelpers.updateAppointment(user.uid, update.id, { status: update.status }))
    );
  }, [user]);

  const updateAppointment = useCallback(async (updatedAppointmentData: Appointment): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    const { id, ...updates } = updatedAppointmentData;
    await firestoreHelpers.updateAppointment(user.uid, id, updates);
  }, [user]);

  // --- INVESTIGATION DATABASE LOGIC ---
  const addOrUpdateInvestigation = useCallback(async (investigation: InvestigationMaster): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const newList = [...investigationMasterList];
    const index = newList.findIndex(item => item.id === investigation.id);

    if (index > -1) {
      newList[index] = investigation;
    } else {
      newList.push({ ...investigation, id: investigation.id || crypto.randomUUID() });
    }

    await firestoreHelpers.updateInvestigationMaster(user.uid, {
      investigationMasterList: newList,
      investigationPanels
    });

    setInvestigationMasterList(newList);
  }, [investigationMasterList, investigationPanels, user]);

  const deleteInvestigation = useCallback(async (investigationId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const newList = investigationMasterList.filter(item => item.id !== investigationId);
    const newPanels = investigationPanels.map(panel => ({
      ...panel,
      testIds: panel.testIds.filter(id => id !== investigationId)
    }));

    await firestoreHelpers.updateInvestigationMaster(user.uid, {
      investigationMasterList: newList,
      investigationPanels: newPanels
    });

    setInvestigationMasterList(newList);
    setInvestigationPanels(newPanels);
  }, [investigationMasterList, investigationPanels, user]);

  const addOrUpdatePanel = useCallback(async (panel: InvestigationPanel): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const newPanels = [...investigationPanels];
    const index = newPanels.findIndex(item => item.id === panel.id);

    if (index > -1) {
      newPanels[index] = panel;
    } else {
      newPanels.push({ ...panel, id: panel.id || crypto.randomUUID() });
    }

    await firestoreHelpers.updateInvestigationMaster(user.uid, {
      investigationMasterList,
      investigationPanels: newPanels
    });

    setInvestigationPanels(newPanels);
  }, [investigationMasterList, investigationPanels, user]);

  const deletePanel = useCallback(async (panelId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const newPanels = investigationPanels.filter(item => item.id !== panelId);

    await firestoreHelpers.updateInvestigationMaster(user.uid, {
      investigationMasterList,
      investigationPanels: newPanels
    });

    setInvestigationPanels(newPanels);
  }, [investigationMasterList, investigationPanels, user]);

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
