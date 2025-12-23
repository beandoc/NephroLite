import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring

    // Session Replay - captures user actions before errors
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Always capture when error occurs

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Release tracking (Vercel deployment)
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Ignore noisy errors that don't affect functionality
    ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'ResizeObserver loop completed with undelivered notifications',
        'Network request failed', // We handle this in our error handler
    ],

    // Configure breadcrumbs
    beforeBreadcrumb(breadcrumb, hint) {
        // Filter out console logs in production
        if (breadcrumb.category === 'console' && process.env.NODE_ENV === 'production') {
            return null;
        }
        return breadcrumb;
    },

    // Add custom context before sending
    beforeSend(event, hint) {
        // Don't send errors in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Sentry event (dev mode):', event);
            return null;
        }

        // Filter sensitive data
        if (event.request) {
            delete event.request.cookies;
        }

        return event;
    },
});
