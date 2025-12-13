import { useState, useEffect } from 'react';
import { getPatientWithSubcollections } from '@/lib/firestore-helpers';
import { useAuth } from '@/context/auth-provider';
import type { Patient } from '@/lib/types';

/**
 * Hook to fetch a patient with all subcollections (visits, investigations, etc.)
 * This is useful for patient profile pages where we need full data
 */
export const useFullPatient = (patientId: string | null) => {
    const { user } = useAuth();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user || !patientId) {
            setPatient(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        getPatientWithSubcollections(user.uid, patientId)
            .then((data) => {
                setPatient(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching patient:', err);
                setError(err);
                setLoading(false);
            });
    }, [user, patientId]);

    return { patient, loading, error };
};
