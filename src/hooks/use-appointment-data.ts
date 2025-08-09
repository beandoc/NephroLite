

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Appointment, Patient } from '@/lib/types';
import { format, startOfDay, endOfDay } from 'date-fns';

const initialAppointments: Appointment[] = [
    {
        id: "appt-1",
        patientId: "vf2dUPqYyjiiFperqjSz",
        patientName: "sachin new test",
        date: "2025-08-23",
        time: "11:00",
        type: "Follow-up",
        doctorName: "Dr. Sachin",
        status: "Scheduled",
        notes: "Discuss recent lab results."
    },
];

export function useAppointmentData(forOpdQueue: boolean = false) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startTime = performance.now();
    
    let q;
    if (forOpdQueue) {
      const today_start = format(startOfDay(new Date()), 'yyyy-MM-dd');
      q = query(
        collection(db, 'appointments'), 
        where('date', '==', today_start)
      );
    } else {
      q = collection(db, 'appointments');
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsData: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAppointments(appointmentsData);
      
      if (isLoading) {
        const endTime = performance.now();
        console.log(`[Performance] Appointment data loaded in ${(endTime - startTime).toFixed(1)}ms`);
      }
      setIsLoading(false);
      
    }, (error) => {
        console.error("Error fetching appointments: ", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [forOpdQueue, isLoading]);

  const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'status' | 'patientName'>, patient: Patient): Promise<Appointment> => {
    const newAppointmentData: Omit<Appointment, 'id'> = {
      ...appointmentData,
      patientName: patient.name, 
      status: 'Scheduled',
    };
    const docRef = await addDoc(collection(db, 'appointments'), newAppointmentData);
    return { id: docRef.id, ...newAppointmentData };
  }, []);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status']): Promise<void> => {
    const appointmentDocRef = doc(db, 'appointments', id);
    await updateDoc(appointmentDocRef, { status });
  }, []);
  
  const updateMultipleAppointmentStatuses = useCallback(async (updates: { id: string, status: Appointment['status'] }[]): Promise<void> => {
    const batch = writeBatch(db);
    updates.forEach(update => {
      const appointmentDocRef = doc(db, 'appointments', update.id);
      batch.update(appointmentDocRef, { status: update.status });
    });
    await batch.commit();
  }, []);

  const updateAppointment = useCallback(async (updatedAppointmentData: Appointment): Promise<void> => {
    const appointmentDocRef = doc(db, 'appointments', updatedAppointmentData.id);
    const dataToUpdate = {
        ...updatedAppointmentData,
        date: format(new Date(updatedAppointmentData.date), 'yyyy-MM-dd') 
    };
    delete (dataToUpdate as Partial<Appointment>).id;
    await updateDoc(appointmentDocRef, dataToUpdate);
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
