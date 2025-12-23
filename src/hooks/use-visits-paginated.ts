import { collection, query, limit, startAfter, orderBy, getDocs, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Visit } from '@/lib/types';
import { useState, useCallback, useEffect } from 'react';

const PAGE_SIZE = 20;

export interface PaginatedVisitsResult {
    visits: Visit[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    totalLoaded: number;
}

/**
 * Hook for paginated patient visits
 * Loads 20 visits per page with cursor-based pagination
 */
export function usePaginatedVisits(patientId?: string): PaginatedVisitsResult {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const loadVisits = useCallback(async (isFirstPage = false) => {
        if (loading) return;

        setLoading(true);
        try {
            let q = query(
                collection(db, 'visits'),
                orderBy('visitDate', 'desc'),
                limit(PAGE_SIZE)
            );

            // Filter by patient if provided
            if (patientId) {
                q = query(
                    collection(db, 'visits'),
                    where('patientId', '==', patientId),
                    orderBy('visitDate', 'desc'),
                    limit(PAGE_SIZE)
                );
            }

            // Apply cursor for pagination
            if (!isFirstPage && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const newVisits = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Visit));

            if (isFirstPage) {
                setVisits(newVisits);
            } else {
                setVisits(prev => [...prev, ...newVisits]);
            }

            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            setLastDoc(lastVisible || null);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error loading visits:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, loading, patientId]);

    const loadMore = useCallback(() => loadVisits(false), [loadVisits]);

    const refresh = useCallback(async () => {
        setLastDoc(null);
        setHasMore(true);
        await loadVisits(true);
    }, [loadVisits]);

    // Load first page on mount
    useEffect(() => {
        if (!initialized) {
            loadVisits(true);
            setInitialized(true);
        }
    }, [initialized, loadVisits]);

    return {
        visits,
        loading,
        hasMore,
        loadMore,
        refresh,
        totalLoaded: visits.length
    };
}

/**
 * Hook for paginated OPD visits only
 */
export function usePaginatedOPDVisits(patientId?: string): PaginatedVisitsResult {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const loadVisits = useCallback(async (isFirstPage = false) => {
        if (loading) return;

        setLoading(true);
        try {
            let q = query(
                collection(db, 'visits'),
                where('visitType', '==', 'OPD'),
                orderBy('visitDate', 'desc'),
                limit(PAGE_SIZE)
            );

            if (patientId) {
                q = query(
                    collection(db, 'visits'),
                    where('patientId', '==', patientId),
                    where('visitType', '==', 'OPD'),
                    orderBy('visitDate', 'desc'),
                    limit(PAGE_SIZE)
                );
            }

            if (!isFirstPage && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const newVisits = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Visit));

            if (isFirstPage) {
                setVisits(newVisits);
            } else {
                setVisits(prev => [...prev, ...newVisits]);
            }

            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            setLastDoc(lastVisible || null);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error loading OPD visits:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, loading, patientId]);

    const loadMore = useCallback(() => loadVisits(false), [loadVisits]);

    const refresh = useCallback(async () => {
        setLastDoc(null);
        setHasMore(true);
        await loadVisits(true);
    }, [loadVisits]);

    useEffect(() => {
        if (!initialized) {
            loadVisits(true);
            setInitialized(true);
        }
    }, [initialized, loadVisits]);

    return {
        visits,
        loading,
        hasMore,
        loadMore,
        refresh,
        totalLoaded: visits.length
    };
}

/**
 * Hook for paginated IPD (admitted) visits only
 */
export function usePaginatedIPDVisits(patientId?: string): PaginatedVisitsResult {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const loadVisits = useCallback(async (isFirstPage = false) => {
        if (loading) return;

        setLoading(true);
        try {
            let q = query(
                collection(db, 'visits'),
                where('visitType', '==', 'IPD'),
                orderBy('visitDate', 'desc'),
                limit(PAGE_SIZE)
            );

            if (patientId) {
                q = query(
                    collection(db, 'visits'),
                    where('patientId', '==', patientId),
                    where('visitType', '==', 'IPD'),
                    orderBy('visitDate', 'desc'),
                    limit(PAGE_SIZE)
                );
            }

            if (!isFirstPage && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const newVisits = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Visit));

            if (isFirstPage) {
                setVisits(newVisits);
            } else {
                setVisits(prev => [...prev, ...newVisits]);
            }

            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            setLastDoc(lastVisible || null);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error loading IPD visits:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, loading, patientId]);

    const loadMore = useCallback(() => loadVisits(false), [loadVisits]);

    const refresh = useCallback(async () => {
        setLastDoc(null);
        setHasMore(true);
        await loadVisits(true);
    }, [loadVisits]);

    useEffect(() => {
        if (!initialized) {
            loadVisits(true);
            setInitialized(true);
        }
    }, [initialized, loadVisits]);

    return {
        visits,
        loading,
        hasMore,
        loadMore,
        refresh,
        totalLoaded: visits.length
    };
}
