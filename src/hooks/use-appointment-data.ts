
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Appointment, Patient } from '@/lib/types';
import { format, startOfDay, endOfDay, isToday, parseISO } from 'date-fns';
import { MOCK_APPOINTMENTS } from '@/lib/mock-data'; // Import mock data

export function useAppointmentData(forOpdQueue: boolean = false) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading mock data
    setTimeout(() => {
      let dataToLoad = MOCK_APPOINTMENTS;
      if (forOpdQueue) {
        dataToLoad = MOCK_APPOINTMENTS.filter(a => isToday(parseISO(a.date)));
      }
      setAppointments(dataToLoad);
      setIsLoading(false);
    }, 300); // Simulate network delay
  }, [forOpdQueue]);

  const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'status' | 'patientName' | 'createdAt'>, patient: Patient): Promise<Appointment> => {
    const nowISO = new Date().toISOString();
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      ...appointmentData,
      patientName: patient.name, 
      status: 'Scheduled',
      createdAt: nowISO,
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    
    // In a real app, you would also update the patient's nextAppointmentDate here.
    // For this simulation, we will omit that step.

    return newAppointment;
  }, []);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status']): Promise<void> => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  }, []);
  
  const updateMultipleAppointmentStatuses = useCallback(async (updates: { id: string, status: Appointment['status'] }[]): Promise<void> => {
    setAppointments(prev => {
        let newAppointments = [...prev];
        updates.forEach(update => {
            newAppointments = newAppointments.map(app => 
                app.id === update.id ? { ...app, status: update.status } : app
            );
        });
        return newAppointments;
    });
  }, []);

  const updateAppointment = useCallback(async (updatedAppointmentData: Appointment): Promise<void> => {
    setAppointments(prev => prev.map(app => app.id === updatedAppointmentData.id ? updatedAppointmentData : app));
  }, []);

  return useMemo(() => ({
    appointments,
    isLoading,
    addAppointment,
    updateAppointmentStatus,
    updateAppointment,
    updateMultipleAppointmentStatuses,
  }), [appointments, isLoading, addAppointment, updateAppointmentStatus, updateAppointment, updateMultipleAppointmentStatuses]);
}
