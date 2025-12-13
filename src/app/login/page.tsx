"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Stethoscope, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            // Redirect based on role
            if (user.role === 'patient') {
                router.push('/patient/dashboard');
            } else {
                router.push('/dashboard');
            }
        }
    }, [user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-5xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        NephroLite
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Comprehensive Nephrology Management System
                    </p>
                </div>

                {/* Login Options */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Staff Login */}
                    <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-primary">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                                <Stethoscope className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle className="text-2xl">Staff Login</CardTitle>
                            <CardDescription className="text-base">
                                For doctors, nurses, and administrative staff
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                                <li className="flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                                    Patient management and records
                                </li>
                                <li className="flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                                    Analytics and reporting
                                </li>
                                <li className="flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                                    Queue and appointment management
                                </li>
                            </ul>
                            <Link href="/login/staff" className="block">
                                <Button className="w-full" size="lg">
                                    Staff Login
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Patient Login */}
                    <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-green-500">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                                <UserCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-2xl">Patient Login</CardTitle>
                            <CardDescription className="text-base">
                                For registered patients to access their portal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                                <li className="flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                                    View your medical records
                                </li>
                                <li className="flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                                    Check-in to OPD queue
                                </li>
                                <li className="flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                                    Log daily PD monitoring
                                </li>
                            </ul>
                            <Link href="/login/patient" className="block">
                                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                                    Patient Login
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                    <p>Need help? Contact your healthcare provider for login assistance</p>
                </div>
            </div>
        </div>
    );
}
