"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-provider';
import type { DialysisSession } from '@/lib/dialysis-schemas';

export function useDialysisSessions(patientId?: string) {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<DialysisSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const sessionsRef = collection(db, 'dialysisSessions');
        let q;

        if (patientId) {
            // Get sessions for specific patient
            q = query(sessionsRef, where('patientId', '==', patientId));
        } else if (user.role === 'patient') {
            // Patients see only their own sessions
            q = query(sessionsRef, where('patientId', '==', user.patientId));
        } else {
            // Staff see sessions they created or all sessions (for admins/doctors)
            q = query(sessionsRef, where('staffId', '==', user.uid));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sessionsList: DialysisSession[] = [];
            snapshot.forEach((doc) => {
                sessionsList.push({ id: doc.id, ...doc.data() } as DialysisSession);
            });

            // Sort by session date descending
            sessionsList.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

            setSessions(sessionsList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching dialysis sessions:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, patientId]);

    const createSession = async (sessionData: Omit<DialysisSession, 'id' | 'createdAt' | 'createdBy' | 'staffId'>) => {
        if (!user) throw new Error('Not authenticated');

        const newSession = {
            ...sessionData,
            createdAt: new Date().toISOString(),
            createdBy: user.uid,
            staffId: user.uid,
            status: 'Active'
        };

        // Create session document
        const docRef = await addDoc(collection(db, 'dialysisSessions'), newSession);

        // Also update patient document to link this session
        if (sessionData.patientId) {
            try {
                const { getDoc } = await import('firebase/firestore');
                const patientRef = doc(db, 'patients', sessionData.patientId);
                const patientDoc = await getDoc(patientRef);

                if (patientDoc.exists()) {
                    const existingSessions = patientDoc.data().dialysisSessions || [];
                    await updateDoc(patientRef, {
                        dialysisSessions: [...existingSessions, {
                            sessionId: docRef.id,
                            sessionDate: sessionData.sessionDate,
                            dialysisType: sessionData.dialysisType,
                            createdAt: newSession.createdAt
                        }],
                        lastDialysisDate: sessionData.sessionDate,
                        dialysisModality: sessionData.dialysisModality || sessionData.dialysisType
                    });
                }
            } catch (error) {
                console.error('Error updating patient document:', error);
                // Don't fail the session creation if patient update fails
            }
        }

        return docRef.id;
    };

    const updateSession = async (sessionId: string, updates: Partial<DialysisSession>) => {
        const sessionRef = doc(db, 'dialysisSessions', sessionId);
        await updateDoc(sessionRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.uid
        });
    };

    const deleteSession = async (sessionId: string) => {
        await deleteDoc(doc(db, 'dialysisSessions', sessionId));
    };

    return {
        sessions,
        loading,
        createSession,
        updateSession,
        deleteSession
    };
}
