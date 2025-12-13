"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: Array<'doctor' | 'nurse' | 'admin' | 'patient'>;
    fallbackPath?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackPath }: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            if (!allowedRoles.includes(user.role)) {
                // Redirect based on user role
                const redirectPath = fallbackPath || (user.role === 'patient' ? '/patient/dashboard' : '/dashboard');
                router.push(redirectPath);
            }
        }
    }, [user, loading, allowedRoles, router, fallbackPath]);

    if (loading) {
        return (
            <div className="container mx-auto py-8 space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}

// Convenience wrapper components
export function StaffOnly({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={['doctor', 'nurse', 'admin']}>
            {children}
        </RoleGuard>
    );
}

export function PatientOnly({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={['patient']}>
            {children}
        </RoleGuard>
    );
}

export function DoctorOnly({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={['doctor', 'admin']}>
            {children}
        </RoleGuard>
    );
}
