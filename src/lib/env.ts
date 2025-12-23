import { z } from 'zod';

/**
 * Environment variable validation schema
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
    // Node environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Firebase configuration (required)
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase messaging sender ID is required'),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),

    // Sentry (optional in development, required in production)
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

    // Feature flags (optional)
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.enum(['true', 'false']).default('false'),
    NEXT_PUBLIC_ENABLE_DEBUG: z.enum(['true', 'false']).default('false'),

    // Logging
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

/**
 * Validated environment variables
 * Use this instead of process.env to ensure type safety
 * 
 * Note: Validation only runs server-side to prevent browser errors
 */
export const env = (() => {
    // Skip validation in browser - NEXT_PUBLIC_ vars are injected at build time
    if (typeof window !== 'undefined') {
        return process.env as z.infer<typeof envSchema>;
    }

    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n');

            console.error('❌ Invalid environment variables:\n' + missingVars);
            console.error('\n💡 Add these to your .env.local file\n');

            // In production, fail fast
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Invalid environment configuration');
            }

            // In development, provide helpful guidance
            throw new Error(
                'Missing environment variables. Please check your .env.local file.\n' +
                'See .env.example for required variables.'
            );
        }
        throw error;
    }
})();

/**
 * Type-safe environment variable access
 */
export const config = {
    // Node environment
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',

    // Firebase
    firebase: {
        apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },

    // Sentry
    sentry: {
        dsn: env.NEXT_PUBLIC_SENTRY_DSN,
        enabled: !!env.NEXT_PUBLIC_SENTRY_DSN && env.NODE_ENV === 'production',
    },

    // Features
    features: {
        analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
        debug: env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
    },

    // Logging
    logging: {
        level: env.LOG_LEVEL,
    },
} as const;

export default env;
