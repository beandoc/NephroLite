import { FirebaseError } from 'firebase/app';
import { toast } from '@/hooks/use-toast';
import { logger } from './logger';

/**
 * Custom Application Error Class
 * Extends Error with additional metadata for better debugging
 */
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public metadata?: Record<string, any>
    ) {
        super(message);
        this.name = 'AppError';

        // Maintains proper stack trace for where error was thrown (Node.js)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

/**
 * Firebase Error Code to User-Friendly Message Mapping
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
    // Authentication Errors
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',

    // Firestore Errors
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'unauthenticated': 'Please log in to continue.',
    'invalid-argument': 'Invalid data provided. Please check your input.',
    'unavailable': 'Service temporarily unavailable. Please try again in a moment.',
    'deadline-exceeded': 'Request took too long. Please try again.',
    'resource-exhausted': 'Too many requests. Please slow down.',

    // Cloud Functions Errors
    'functions/cancelled': 'Operation was cancelled.',
    'functions/unknown': 'An unknown error occurred.',
    'functions/invalid-argument': 'Invalid input data provided.',

    // Network Errors
    'network-request-failed': 'Network error. Please check your internet connection.',
};

/**
 * Get user-friendly error message from Firebase error
 */
function getFirebaseErrorMessage(error: FirebaseError): string {
    return FIREBASE_ERROR_MESSAGES[error.code] || error.message;
}

/**
 * Centralized Error Handler
 * Logs error, shows toast, captures in Sentry, and re-throws as AppError
 * 
 * @param error - The error to handle
 * @param context - Context where error occurred (for logging)
 * @param showToast - Whether to show toast notification (default: true)
 */
export function handleError(
    error: unknown,
    context?: string,
    showToast: boolean = true
): never {
    // Log with structured logging
    const errorData = formatErrorForLogging(error);
    logger.error({
        ...errorData,
        context: context || 'unknown',
        timestamp: new Date().toISOString()
    }, `Error${context ? ` in ${context}` : ''}: ${errorData.message}`);

    // Capture in Sentry (production only)
    if (typeof window !== 'undefined') {
        import('@sentry/nextjs').then(
            (Sentry) => {
                Sentry.captureException(error, {
                    tags: {
                        context: context || 'unknown',
                    },
                    level: 'error',
                });
            });
    }

    let userMessage: string;
    let errorCode: string;
    let statusCode: number = 500;

    // Handle different error types
    if (error instanceof FirebaseError) {
        userMessage = getFirebaseErrorMessage(error);
        errorCode = error.code;

    } else if (error instanceof AppError) {
        userMessage = error.message;
        errorCode = error.code;
        statusCode = error.statusCode;

    } else if (error instanceof Error) {
        userMessage = error.message;
        errorCode = 'UNKNOWN_ERROR';

    } else {
        userMessage = 'An unexpected error occurred. Please try again.';
        errorCode = 'UNKNOWN_ERROR';
    }

    // Show toast notification to user
    if (showToast) {
        toast({
            title: 'Error',
            description: userMessage,
            variant: 'destructive',
        });
    }

    // Re-throw as AppError for consistent handling
    throw new AppError(userMessage, errorCode, statusCode, {
        originalError: error,
        context,
    });
}

/**
 * Retry function with exponential backoff
 * Retries a function up to maxRetries times with increasing delay
 * 
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in ms (default: 1000)
 * @param backoffMultiplier - Multiplier for exponential backoff (default: 2)
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    backoffMultiplier: number = 2
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on certain errors
            if (error instanceof AppError) {
                if (['permission-denied', 'unauthenticated', 'invalid-argument', 'already-exists'].includes(error.code)) {
                    throw error; // Don't retry permission/validation errors
                }
            }

            // If this was the last attempt, throw
            if (attempt === maxRetries - 1) {
                throw error;
            }

            // Calculate delay with exponential backoff
            const delay = baseDelay * Math.pow(backoffMultiplier, attempt);
            const jitter = Math.random() * 200; // Add random jitter to prevent thundering herd
            const totalDelay = Math.min(delay + jitter, 30000); // Cap at 30 seconds

            logger.info({
                attempt: attempt + 1,
                maxRetries,
                delay: totalDelay.toFixed(0),
                error: lastError.message
            }, `Retrying after ${totalDelay.toFixed(0)}ms`);
            await new Promise(resolve => setTimeout(resolve, totalDelay));
        }
    }

    throw lastError!;
}

/**
 * Safe async wrapper that catches and handles errors
 * Use this to wrap async operations that might fail
 * 
 * @param fn - Async function to execute
 * @param context - Context for error logging
 * @param fallback - Fallback value to return on error
 */
export async function safeAsync<T>(
    fn: () => Promise<T>,
    context: string,
    fallback?: T
): Promise<T | undefined> {
    try {
        return await fn();
    } catch (error) {
        const errorData = formatErrorForLogging(error);
        logger.warn({ ...errorData, context }, `Safe async error in ${context}`);

        if (fallback !== undefined) {
            return fallback;
        }

        return undefined;
    }
}

/**
 * Validate required fields
 * Throws AppError if any required field is missing
 */
export function validateRequired(
    data: Record<string, any>,
    requiredFields: string[]
): void {
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
        throw new AppError(
            `Missing required fields: ${missingFields.join(', ')}`,
            'VALIDATION_ERROR',
            400,
            { missingFields }
        );
    }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
    if (error instanceof FirebaseError) {
        return [
            'unavailable',
            'deadline-exceeded',
            'resource-exhausted',
            'network-request-failed'
        ].includes(error.code);
    }

    if (error instanceof AppError) {
        return [
            'NETWORK_ERROR',
            'TIMEOUT',
            'SERVICE_UNAVAILABLE'
        ].includes(error.code);
    }

    return false;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): {
    message: string;
    code: string;
    stack?: string;
    metadata?: any;
} {
    if (error instanceof AppError) {
        return {
            message: error.message,
            code: error.code,
            stack: error.stack,
            metadata: error.metadata
        };
    }

    if (error instanceof FirebaseError) {
        return {
            message: error.message,
            code: error.code,
            stack: error.stack,
        };
    }

    if (error instanceof Error) {
        return {
            message: error.message,
            code: 'UNKNOWN_ERROR',
            stack: error.stack,
        };
    }

    return {
        message: String(error),
        code: 'UNKNOWN_ERROR',
    };
}
