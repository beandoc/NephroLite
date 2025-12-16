"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logError } from '@/lib/logger';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Prevents entire app crash and shows fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        logError('Error Boundary caught an error', { error, errorInfo });

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        // Store error info in state
        this.setState({
            error,
            errorInfo,
        });

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                    <Card className="max-w-2xl w-full">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-6 w-6" />
                                <CardTitle>Something went wrong</CardTitle>
                            </div>
                            <CardDescription>
                                An unexpected error occurred. This has been logged and we'll look into it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="font-mono text-sm text-red-900 mb-2">
                                        <strong>Error:</strong> {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-sm text-red-800 hover:text-red-900">
                                                Component Stack
                                            </summary>
                                            <pre className="mt-2 text-xs overflow-auto max-h-64 text-red-800">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button onClick={this.handleReset} variant="default">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button onClick={() => window.location.href = '/'} variant="outline">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Simplified error boundary for smaller sections
 */
export function SimpleErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
                    <p className="text-sm text-destructive">
                        This section encountered an error. Please refresh the page.
                    </p>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}
