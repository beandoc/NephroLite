import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for API calls with loading, error, and data states
 * Provides a consistent interface for data fetching across the application
 * 
 * @template T - The type of data returned by the fetcher
 * @param fetcher - Async function that fetches the data
 * @param options - Configuration options
 * @returns Object with data, loading, error states and refetch function
 * 
 * @example
 * ```typescript
 * import { useAPI } from '@/hooks/use-api';
 * import { api } from '@/api';
 * 
 * function PatientList() {
 *   const { data: patients, loading, error, refetch } = useAPI(
 *     () => api.patients.getAll(),
 *     { enabled: true }
 *   );
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 * 
 *   return (
 *     <div>
 *       {patients?.map(patient => (
 *         <div key={patient.id}>{patient.personalInfo?.name}</div>
 *       ))}
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAPI<T>(
    fetcher: () => Promise<T>,
    options?: {
        /** If false, the hook will not fetch data automatically */
        enabled?: boolean;
        /** Callback when fetch succeeds */
        onSuccess?: (data: T) => void;
        /** Callback when fetch fails */
        onError?: (error: Error) => void;
    }
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const fetcherRef = useRef(fetcher);

    // Update fetcher ref when it changes
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    const fetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetcherRef.current();
            setData(result);
            options?.onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            options?.onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (options?.enabled === false) {
            setLoading(false);
            return;
        }

        fetch();
    }, [options?.enabled]);

    return {
        data,
        loading,
        error,
        /** Manually trigger a refetch */
        refetch: fetch,
    };
}

/**
 * Debounce a value - delays updating the value until after a specified delay
 * Useful for search inputs to avoid excessive API calls
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 * 
 * @example
 * ```typescript
 * import { useDebounce } from '@/hooks/use-debounce';
 * 
 * function SearchPatients() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 *   const { data: results } = useAPI(
 *     () => api.patients.searchByName(debouncedSearch),
 *     { enabled: debouncedSearch.length > 0 }
 *   );
 * 
 *   return <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />;
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
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
 * Persist state in localStorage with automatic serialization
 * Provides a useState-like interface with localStorage persistence
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 * 
 * @example
 * ```typescript
 * import { useLocalStorage } from '@/hooks/use-local-storage';
 * 
 * function UserPreferences() {
 *   const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 * 
 *   return (
 *     <div>
 *       <button onClick={() => setTheme('dark')}>Dark Mode</button>
 *       <button onClick={() => setTheme('light')}>Light Mode</button>
 *       <button onClick={removeTheme}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage.
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    // Remove value from localStorage
    const removeValue = () => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue, removeValue];
}

/**
 * Media query hook for responsive design
 * Returns true if the media query matches
 * 
 * @param query - Media query string
 * @returns Boolean indicating if query matches
 * 
 * @example
 * ```typescript
 * import { useMediaQuery } from '@/hooks/use-media-query';
 * 
 * function ResponsiveComponent() {
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 *   const isDesktop = useMediaQuery('(min-width: 1024px)');
 * 
 *   return (
 *     <div>
 *       {isMobile && <MobileView />}
 *       {isDesktop && <DesktopView />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const media = window.matchMedia(query);

        // Set initial value
        setMatches(media.matches);

        // Create event listener
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Add listener
        media.addEventListener('change', listener);

        return () => {
            media.removeEventListener('change', listener);
        };
    }, [query]);

    return matches;
}

/**
 * Track previous value of a variable
 * Useful for comparing current and previous values
 * 
 * @param value - Value to track
 * @returns Previous value
 * 
 * @example
 * ```typescript
 * import { usePrevious } from '@/hooks/use-previous';
 * 
 * function Counter() {
 *   const [count, setCount] = useState(0);
 *   const prevCount = usePrevious(count);
 * 
 *   return (
 *     <div>
 *       Current: {count}, Previous: {prevCount}
 *       <button onClick={() => setCount(count + 1)}>Increment</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/**
 * Interval hook that handles cleanup automatically
 * Safer alternative to setInterval in React
 * 
 * @param callback - Function to call on each interval
 * @param delay - Delay in milliseconds (null to pause)
 * 
 * @example
 * ```typescript
 * import { useInterval } from '@/hooks/use-interval';
 * 
 * function Clock() {
 *   const [time, setTime] = useState(new Date());
 * 
 *   useInterval(() => {
 *     setTime(new Date());
 *   }, 1000);
 * 
 *   return <div>{time.toLocaleTimeString()}</div>;
 * }
 * ```
 */
export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval
    useEffect(() => {
        if (delay === null) {
            return;
        }

        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}

/**
 * Boolean toggle hook
 * Provides convenient toggle, set true, set false functions
 * 
 * @param initialValue - Initial boolean value
 * @returns Tuple of [value, toggle, setTrue, setFalse]
 * 
 * @example
 * ```typescript
 * import { useToggle } from '@/hooks/use-toggle';
 * 
 * function Modal() {
 *   const [isOpen, toggle, open, close] = useToggle(false);
 * 
 *   return (
 *     <div>
 *       <button onClick={open}>Open Modal</button>
 *       {isOpen && (
 *         <div>
 *           <p>Modal Content</p>
 *           <button onClick={close}>Close</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useToggle(
    initialValue: boolean = false
): [boolean, () => void, () => void, () => void] {
    const [value, setValue] = useState(initialValue);

    const toggle = () => setValue(v => !v);
    const setTrue = () => setValue(true);
    const setFalse = () => setValue(false);

    return [value, toggle, setTrue, setFalse];
}
