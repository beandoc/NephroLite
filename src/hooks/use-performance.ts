import { useCallback, useRef, useEffect } from 'react';

/**
 * Performance optimization utilities
 */

/**
 * Custom hook for debouncing values
 * Useful for search inputs, auto-save, etc.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 * 
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   // This will only run 300ms after user stops typing
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 * Ensures function is called at most once per specified interval
 * 
 * @param callback - Function to throttle
 * @param delay - Minimum time between calls in milliseconds
 * @returns Throttled function
 * 
 * @example
 * ```typescript
 * const handleScroll = useThrottle(() => {
 *   console.log('Scrolling...');
 * }, 100);
 * ```
 */
export function useThrottle<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const lastRan = useRef(Date.now());

    return useCallback(
        ((...args) => {
            const now = Date.now();

            if (now - lastRan.current >= delay) {
                callback(...args);
                lastRan.current = now;
            }
        }) as T,
        [callback, delay]
    );
}

/**
 * Hook to detect if component is mounted
 * Prevents state updates on unmounted components
 */
export function useIsMounted(): () => boolean {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    return useCallback(() => isMounted.current, []);
}

/**
 * Safe setState that only updates if component is mounted
 */
export function useSafeState<T>(
    initialState: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState(initialState);
    const isMounted = useIsMounted();

    const setSafeState: React.Dispatch<React.SetStateAction<T>> = useCallback(
        (value) => {
            if (isMounted()) {
                setState(value);
            }
        },
        [isMounted]
    );

    return [state, setSafeState];
}

// Import useState for the hooks above
import { useState } from 'react';
