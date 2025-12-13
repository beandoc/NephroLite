"use client";

import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Activity, ClipboardList, FileText, LogOut, User, Home } from 'lucide-react';
import Link from 'next/link';
import { PatientOnly } from '@/components/auth/role-guard';

interface PatientLayoutProps {
    children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    const navigation = [
        { name: 'Home', href: '/patient/dashboard', icon: Home },
        { name: 'PD Daily Logs', href: '/patient/pd-logs', icon: Activity },
        { name: 'Check-in', href: '/patient/checkin', icon: ClipboardList },
        { name: 'My Results', href: '/patient/investigations', icon: FileText },
        { name: 'Profile', href: '/patient/profile', icon: User },
    ].filter(item => {
        // Only show PD Daily Logs if patient is in Peritoneal Dialysis group
        if (item.name === 'PD Daily Logs') {
            return !!user?.isPD;
        }
        return true;
    });

    return (
        <PatientOnly>
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
                {/* Header */}
                <header className="bg-white dark:bg-gray-900 border-b shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">
                                    NephroLite Patient Portal
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Welcome, {user?.displayName || 'Patient'}
                                </p>
                            </div>
                            <Button variant="outline" onClick={signOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Navigation */}
                <nav className="bg-white dark:bg-gray-900 border-b">
                    <div className="container mx-auto px-4">
                        <div className="flex space-x-1 overflow-x-auto py-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.name} href={item.href}>
                                        <Button
                                            variant={isActive ? 'default' : 'ghost'}
                                            className={isActive ? 'bg-green-600 hover:bg-green-700' : ''}
                                        >
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.name}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 container mx-auto px-4 py-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-white dark:bg-gray-900 border-t py-4 mt-8">
                    <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                        <p>NephroLite Patient Portal • Nephro ID: {user?.nephroId || 'N/A'}</p>
                    </div>
                </footer>
            </div>
        </PatientOnly>
    );
}
