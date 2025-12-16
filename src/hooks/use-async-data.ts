import { useState, useEffect, useCallback } from 'react';

/**
 * Generic state for async data operations
 */
export interface AsyncDataState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

/**
 * Custom hook to handle async data fetching with loading and error states
 * Eliminates the duplicated pattern of useState for data, loading, and error
 * 
 * @param fetchFn - Async function that fetches the data
 * @param dependencies - Optional array of dependencies to trigger refetch
 * @returns Object containing data, loading state, error, and refetch function
 * 
 * @example
 * ```typescript
 * const { data: patient, loading, error, refetch } = useAsyncData(
 *   () => getPatientById(patientId),
 *   [patientId]
 * );
 * ```
 */
export function useAsyncData<T>(
    fetchFn: () => Promise<T>,
    dependencies: any[] = []
): AsyncDataState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFn();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, ...dependencies]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
}

/**
 * Hook for form submission state management
 * Handles loading and error states for form operations
 * 
 * @example
 * ```typescript
 * const { submitting, error, setError, handleSubmit } = useFormSubmit(
 *   async (formData) => {
 *     await savePatient(formData);
 *   }
 * );
 * ```
 */
export interface FormSubmitState {
    submitting: boolean;
    error: string;
    setError: (error: string) => void;
    handleSubmit: <T>(submitFn: () => Promise<T>) => Promise<T | void>;
}

export function useFormSubmit(): FormSubmitState {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = useCallback(async <T,>(submitFn: () => Promise<T>): Promise<T | void> => {
        try {
            setSubmitting(true);
            setError('');
            const result = await submitFn();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }, []);

    return { submitting, error, setError, handleSubmit };
}
