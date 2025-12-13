"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, Hash } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';

export default function PatientProfilePage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center">
                    <User className="mr-3 h-8 w-8 text-green-500" />
                    My Profile
                </h1>
                <p className="text-muted-foreground mt-1">
                    Your personal information and account details
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Your registered details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium flex items-center text-muted-foreground">
                                <User className="mr-2 h-4 w-4" />
                                Full Name
                            </p>
                            <p className="text-lg">
                                {user?.displayName && user.displayName !== "undefined undefined" ? user.displayName : 'Patient'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium flex items-center text-muted-foreground">
                                <Mail className="mr-2 h-4 w-4" />
                                Email
                            </p>
                            <p className="text-lg">{user?.email || 'N/A'}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium flex items-center text-muted-foreground">
                                <Hash className="mr-2 h-4 w-4" />
                                Nephro ID
                            </p>
                            <p className="text-lg font-mono">{user?.nephroId || 'N/A'}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium flex items-center text-muted-foreground">
                                <Hash className="mr-2 h-4 w-4" />
                                Patient ID
                            </p>
                            <p className="text-lg font-mono">{user?.patientId?.slice(0, 12) || 'N/A'}...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Portal Access</CardTitle>
                    <CardDescription>
                        Account and login information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Account Status:</span>
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                            Active
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Login Email:</span>
                        <span>{user?.email}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <p className="text-sm text-blue-900">
                        <strong>Need to update your information?</strong>
                        <br />
                        Please contact your healthcare provider to update your personal details.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
