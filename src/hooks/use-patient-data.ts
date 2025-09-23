
"use client";

import { useContext } from 'react';
import { DataContext, DataContextType } from '@/context/data-provider';

// This hook now acts as a simple accessor to the shared context.
export function usePatientData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('usePatientData must be used within a DataProvider');
  }
  // We return all patient and investigation database related parts of the context.
  const {
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
    investigationMasterList,
    investigationPanels,
    addOrUpdateInvestigation,
    deleteInvestigation,
    addOrUpdatePanel,
    deletePanel,
  } = context;

  return {
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
    investigationMasterList,
    investigationPanels,
    addOrUpdateInvestigation,
    deleteInvestigation,
    addOrUpdatePanel,
    deletePanel,
  };
}
