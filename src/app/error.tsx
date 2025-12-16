'use client';

import { ErrorBoundary } from '@/components/error-boundary';

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <ErrorBoundary>
            <div>Error occurred</div>
        </ErrorBoundary>
    );
}
