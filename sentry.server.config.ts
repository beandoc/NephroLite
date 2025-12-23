import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: 0.1,

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Server-specific config
    beforeSend(event) {
        // Don't send in development
        if (process.env.NODE_ENV === 'development') {
            return null;
        }
        return event;
    },
});
