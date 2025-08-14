
"use client";

import { useContext } from 'react';
import { DataContext, DataContextType } from '@/context/data-provider';

// This hook now acts as a simple accessor to the shared context.
export function useAppointmentData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useAppointmentData must be used within a DataProvider');
  }
  // We only return the appointments part of the context.
  const { 
    appointments, 
    isLoading, 
    addAppointment, 
    updateAppointmentStatus, 
    updateMultipleAppointmentStatuses,
    updateAppointment 
  } = context;
  
  return { 
    appointments, 
    isLoading, 
    addAppointment, 
    updateAppointmentStatus, 
    updateMultipleAppointmentStatuses,
    updateAppointment 
  };
}
