import { collection, query, limit, startAfter, orderBy, getDocs, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Patient } from '@/lib/types';
import { useState, useCallback } from 'react';

const PAGE_SIZE = 20;

export interface PaginatedPatientsResult {
    patients: Patient[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    totalLoaded: number;
}

export function usePaginatedPatients(): PaginatedPatientsResult {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadPatients = useCallback(async (isFirstPage = false) => {
        if (loading) return; // Prevent duplicate requests

        setLoading(true);
        try {
            let q = query(
                collection(db, 'patients'),
                orderBy('createdAt', 'desc'),
                limit(PAGE_SIZE)
            );

            // If not first page and we have a cursor, start after it
            if (!isFirstPage && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const newPatients = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Patient));

            if (isFirstPage) {
                setPatients(newPatients);
            } else {
                setPatients(prev => [...prev, ...newPatients]);
            }

            // Update cursor and check if more pages exist
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            setLastDoc(lastVisible || null);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error loading patients:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, loading]);

    const loadMore = useCallback(() => loadPatients(false), [loadPatients]);

    const refresh = useCallback(async () => {
        setLastDoc(null);
        setHasMore(true);
        await loadPatients(true);
    }, [loadPatients]);

    // Load first page on mount
    useState(() => {
        loadPatients(true);
    });

    return {
        patients,
        loading,
        hasMore,
        loadMore,
        refresh,
        totalLoaded: patients.length
    };
}

// Hook specifically for HD Registry patients (with HD tag filter)
export function usePaginatedHDPatients(): PaginatedPatientsResult {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadPatients = useCallback(async (isFirstPage = false) => {
        if (loading) return;

        setLoading(true);
        try {
            // Note: Firestore doesn't support array-contains with pagination efficiently
            // We'll load pages and filter client-side for now
            // TODO: For production, consider denormalizing HD tag to a boolean field

            let q = query(
                collection(db, 'patients'),
                orderBy('createdAt', 'desc'),
                limit(PAGE_SIZE * 2) // Load more to account for filtering
            );

            if (!isFirstPage && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);

            // Filter for HD patients
            const hdPatients = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Patient))
                .filter(p => p.clinicalProfile?.tags?.includes('HD'));

            if (isFirstPage) {
                setPatients(hdPatients);
            } else {
                setPatients(prev => [...prev, ...hdPatients]);
            }

            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            setLastDoc(lastVisible || null);
            setHasMore(snapshot.docs.length === PAGE_SIZE * 2);
        } catch (error) {
            console.error('Error loading HD patients:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, loading]);

    const loadMore = useCallback(() => loadPatients(false), [loadPatients]);

    const refresh = useCallback(async () => {
        setLastDoc(null);
        setHasMore(true);
        await loadPatients(true);
    }, [loadPatients]);

    useState(() => {
        loadPatients(true);
    });

    return {
        patients,
        loading,
        hasMore,
        loadMore,
        refresh,
        totalLoaded: patients.length
    };
}
