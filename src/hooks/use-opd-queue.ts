"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-provider';
import { format } from 'date-fns';

export interface QueueEntry {
    id: string;
    patientId: string;
    patientName: string;
    nephroId?: string;
    appointmentType: string;
    checkInTime: Date | Timestamp;
    status: 'waiting' | 'serving' | 'completed' | 'no-show';
    checkedInBy: 'staff' | 'patient';
    time?: string; // For backwards compatibility with appointments
}

export function useOpdQueue() {
    const { user } = useAuth();
    const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Get today's date in YYYY-MM-DD format
        const today = format(new Date(), 'yyyy-MM-dd');

        // Listen to opdQueue for patient self-check-ins
        const queueRef = collection(db, `opdQueue/${today}/patients`);
        const q = query(queueRef, orderBy('checkInTime', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const entries: QueueEntry[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    entries.push({
                        id: doc.id,
                        patientId: data.patientId || '',
                        patientName: data.patientName || 'Unknown',
                        nephroId: data.nephroId,
                        appointmentType: data.appointmentType || data.type || 'Walk-in',
                        checkInTime: data.checkInTime,
                        status: data.status || 'waiting',
                        checkedInBy: data.checkedInBy || 'staff',
                        time: data.checkInTime?.toDate ? format(data.checkInTime.toDate(), 'HH:mm') : undefined,
                    });
                });
                setQueueEntries(entries);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error loading queue:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const updateStatus = async (entryId: string, status: QueueEntry['status']) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const entryRef = doc(db, `opdQueue/${today}/patients/${entryId}`);

        try {
            await updateDoc(entryRef, {
                status,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            console.error('Error updating queue status:', error);
            throw error;
        }
    };

    const callNext = async () => {
        const waiting = queueEntries.filter(e => e.status === 'waiting');
        const current = queueEntries.find(e => e.status === 'serving');

        if (waiting.length === 0) {
            throw new Error('No patients waiting');
        }

        // Mark current as completed if exists
        if (current) {
            await updateStatus(current.id, 'completed');
        }

        // Call next patient
        await updateStatus(waiting[0].id, 'serving');
    };

    return {
        queueEntries,
        loading,
        error,
        updateStatus,
        callNext,
        nowServing: queueEntries.find(e => e.status === 'serving'),
        waiting: queueEntries.filter(e => e.status === 'waiting'),
        completed: queueEntries.filter(e => e.status === 'completed'),
    };
}
