import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-provider';
import { getDocs } from 'firebase/firestore';
import { getMonthlyInvestigationsIndexRef, getMonthlyDialysisIndexRef } from '@/lib/firestore-helpers';
import { logError } from '@/lib/logger';

/**
 * Lightweight visit data for dashboard display
 */
export interface MonthlyVisit {
    visitId: string;
    patientId: string;
    patientName: string;
    visitType: string;
    date: string;
    createdAt?: any;
}

/**
 * Hook to fetch visits for a specific month
 * Uses time-based index for fast queries
 * 
 * @param monthKey Month in format YYYY-MM (e.g., "2025-03")
 * @returns Visits for the specified month
 * 
 * @example
 * ```typescript
 * const { visits, loading } = useMonthlyVisits('2025-03');
 * ```
 * 
 * NOTE: Currently disabled - visits are fetched directly from patient records
 * Enable when getMonthlyVisitsIndexRef is implemented in firestore-helpers
 */
/*
export function useMonthlyVisits(monthKey: string) {
    const { user } = useAuth();
    const [visits, setVisits] = useState<MonthlyVisit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user || !monthKey) {
            setVisits([]);
            setLoading(false);
            return;
        }

        const fetchMonthlyVisits = async () => {
            try {
                setLoading(true);
                const snapshot = await getDocs(getMonthlyVisitsIndexRef(user.uid, monthKey));

                const monthlyVisits = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    visitId: doc.id,
                })) as MonthlyVisit[];

                setVisits(monthlyVisits);
            } catch (err) {
                logError('Error fetching monthly visits', err);
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyVisits();
    }, [user, monthKey]);

    return { visits, loading, error };
}
*/

/**
 * Hook to fetch investigations for a specific month
 */
export function useMonthlyInvestigations(monthKey: string) {
    const { user } = useAuth();
    const [investigations, setInvestigations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !monthKey) {
            setInvestigations([]);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const snapshot = await getDocs(getMonthlyInvestigationsIndexRef(user.uid, monthKey));
                setInvestigations(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            } catch (err) {
                logError('Error fetching monthly investigations', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, monthKey]);

    return { investigations, loading };
}

/**
 * Hook to fetch dialysis sessions for a specific month
 */
export function useMonthlyDialysis(monthKey: string) {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !monthKey) {
            setSessions([]);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const snapshot = await getDocs(getMonthlyDialysisIndexRef(user.uid, monthKey));
                setSessions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            } catch (err) {
                logError('Error fetching monthly dialysis sessions', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, monthKey]);

    return { sessions, loading };
}
