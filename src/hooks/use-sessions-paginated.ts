import { collection, query, limit, startAfter, orderBy, getDocs, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DialysisSession } from '@/lib/dialysis-schemas';
import { useState, useCallback, useEffect } from 'react';

const PAGE_SIZE = 20;

export interface PaginatedSessionsResult {
    sessions: DialysisSession[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    totalLoaded: number;
}

/**
 * Hook for paginated dialysis sessions
 * Loads 20 sessions per page with cursor-based pagination
 */
export function usePaginatedSessions(patientId?: string): PaginatedSessionsResult {
    const [sessions, setSessions] = useState<DialysisSession[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const loadSessions = useCallback(async (isFirstPage = false) => {
        if (loading) return;

        setLoading(true);
        try {
            let q = query(
                collection(db, 'dialysisSessions'),
                orderBy('sessionDate', 'desc'),
                limit(PAGE_SIZE)
            );

            // Filter by patient if provided
            if (patientId) {
                q = query(
                    collection(db, 'dialysisSessions'),
                    where('patientId', '==', patientId),
                    orderBy('sessionDate', 'desc'),
                    limit(PAGE_SIZE)
                );
            }

            // Apply cursor for pagination
            if (!isFirstPage && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const newSessions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as DialysisSession));

            if (isFirstPage) {
                setSessions(newSessions);
            } else {
                setSessions(prev => [...prev, ...newSessions]);
            }

            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            setLastDoc(lastVisible || null);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error loading sessions:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, loading, patientId]);

    const loadMore = useCallback(() => loadSessions(false), [loadSessions]);

    const refresh = useCallback(async () => {
        setLastDoc(null);
        setHasMore(true);
        await loadSessions(true);
    }, [loadSessions]);

    // Load first page on mount
    useEffect(() => {
        if (!initialized) {
            loadSessions(true);
            setInitialized(true);
        }
    }, [initialized, loadSessions]);

    return {
        sessions,
        loading,
        hasMore,
        loadMore,
        refresh,
        totalLoaded: sessions.length
    };
}

/**
 * Hook for paginated HD sessions only
 * Filters for Hemodialysis type sessions
 */
export function usePaginatedHDSessions(patientId?: string): PaginatedSessionsResult {
    const [sessions, setSessions] = useState<DialysisSession[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const loadSessions = useCallback(async (isFirstPage = false) => {
        if (loading) return;

        setLoading(true);
        try {
            let q = query(
                collection(db, 'dialysisSessions'),
                where('dialysisType', '==', 'Hemodialysis'),
                orderBy('sessionDate', 'desc'),
                limit(PAGE_SIZE)
            );

            // Filter by patient if provided
            if (patientId) {
                q = query(
                    collection(db, 'dialysisSessions'),
                    where('patientId', '==', patientId),
                    where('dialysisType', '==', 'Hemodialysis'),
                    orderBy('sessionDate', 'desc'),
                    limit(PAGE_SIZE)
                );
            }

            if (!isFirstPage && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const newSessions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as DialysisSession));

            if (isFirstPage) {
                setSessions(newSessions);
            } else {
                setSessions(prev => [...prev, ...newSessions]);
            }

            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            setLastDoc(lastVisible || null);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error loading HD sessions:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, loading, patientId]);

    const loadMore = useCallback(() => loadSessions(false), [loadSessions]);

    const refresh = useCallback(async () => {
        setLastDoc(null);
        setHasMore(true);
        await loadSessions(true);
    }, [loadSessions]);

    useEffect(() => {
        if (!initialized) {
            loadSessions(true);
            setInitialized(true);
        }
    }, [initialized, loadSessions]);

    return {
        sessions,
        loading,
        hasMore,
        loadMore,
        refresh,
        totalLoaded: sessions.length
    };
}
