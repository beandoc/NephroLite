"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCircle, Mail, Lock, Clock, CheckCircle, XCircle, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { createPatientAccount, hasPatientAccount, getPatientAccountInfo, deactivatePatientAccount, reactivatePatientAccount, sendPatientPasswordReset } from '@/lib/patient-auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { PatientAccountInfo } from '@/lib/patient-auth-types';
import { logError } from '@/lib/logger';

interface PatientPortalAccessProps {
    patientId: string;
    patientName: string;
    patientEmail?: string;
}

export function PatientPortalAccess({ patientId, patientName, patientEmail }: PatientPortalAccessProps) {
    const { user } = useAuth();
    const { toast } = useToast();

    const [hasAccess, setHasAccess] = useState(false);
    const [accountInfo, setAccountInfo] = useState<PatientAccountInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAccountInfo();
    }, [patientId]);

    const loadAccountInfo = async () => {
        try {
            setLoading(true);
            const hasAccount = await hasPatientAccount(patientId);
            setHasAccess(hasAccount);

            if (hasAccount) {
                const info = await getPatientAccountInfo(patientId);
                setAccountInfo(info);
            }
        } catch (error) {
            logError('Error loading patient portal account info', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async () => {
        setError('');

        // Validation
        if (!email || !password || !confirmPassword) {
            setError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setCreating(true);
            const result = await createPatientAccount(patientId, email, password, phone);

            if (result.success) {
                toast({
                    title: "Portal Access Created",
                    description: `Patient portal account created successfully for ${patientName}`,
                });
                setIsCreateDialogOpen(false);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setPhone('');
                await loadAccountInfo();
            } else {
                setError(result.error || 'Failed to create account');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setCreating(false);
        }
    };

    const handleDeactivate = async () => {
        if (!confirm('Are you sure you want to deactivate portal access for this patient?')) {
            return;
        }

        try {
            const success = await deactivatePatientAccount(patientId);
            if (success) {
                toast({ title: "Portal Deactivated", description: "Patient portal access has been deactivated" });
                await loadAccountInfo();
            } else {
                toast({ title: "Error", description: "Failed to deactivate portal access", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred", variant: "destructive" });
        }
    };

    const handleReactivate = async () => {
        try {
            const success = await reactivatePatientAccount(patientId);
            if (success) {
                toast({ title: "Portal Reactivated", description: "Patient portal access has been reactivated" });
                await loadAccountInfo();
            } else {
                toast({ title: "Error", description: "Failed to reactivate portal access", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred", variant: "destructive" });
        }
    };

    const handleResetPassword = async () => {
        if (!accountInfo?.email) return;

        try {
            const success = await sendPatientPasswordReset(accountInfo.email);
            if (success) {
                toast({
                    title: "Password Reset Sent",
                    description: `Password reset email sent to ${accountInfo.email}`
                });
            } else {
                toast({ title: "Error", description: "Failed to send reset email", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Shield className="mr-2 h-5 w-5" />
                        Patient Portal Access
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Shield className="mr-2 h-5 w-5" />
                        Patient Portal Access
                    </CardTitle>
                    <CardDescription>
                        Manage patient's access to the online portal for self-service features
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!hasAccess ? (
                        <div className="space-y-4">
                            <Alert>
                                <UserCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This patient does not have portal access yet. Create an account to enable self-service features like OPD check-in and PD daily logging.
                                </AlertDescription>
                            </Alert>
                            <Button onClick={() => {
                                setEmail(patientEmail || '');
                                setIsCreateDialogOpen(true);
                            }}>
                                Create Portal Account
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Status</p>
                                    {accountInfo?.isActive ? (
                                        <Badge className="bg-green-500">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive">
                                            <XCircle className="mr-1 h-3 w-3" />
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium flex items-center text-muted-foreground">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Email
                                    </p>
                                    <p className="text-sm">{accountInfo?.email || 'N/A'}</p>
                                </div>

                                {accountInfo?.phone && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                        <p className="text-sm">{accountInfo.phone}</p>
                                    </div>
                                )}

                                {accountInfo?.lastLogin && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium flex items-center text-muted-foreground">
                                            <Clock className="mr-2 h-4 w-4" />
                                            Last Login
                                        </p>
                                        <p className="text-sm">
                                            {accountInfo.lastLogin?.toDate
                                                ? format(accountInfo.lastLogin.toDate(), 'PPp')
                                                : 'Never'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetPassword}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reset Password
                                </Button>

                                {accountInfo?.isActive ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDeactivate}
                                    >
                                        Deactivate Access
                                    </Button>
                                ) : (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleReactivate}
                                    >
                                        Reactivate Access
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Account Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Patient Portal Account</DialogTitle>
                        <DialogDescription>
                            Set up portal access for {patientName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-email">Email Address *</Label>
                            <Input
                                id="create-email"
                                type="email"
                                placeholder="patient@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-phone">Phone (Optional)</Label>
                            <Input
                                id="create-phone"
                                type="tel"
                                placeholder="+91 9876543210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-password">Password *</Label>
                            <Input
                                id="create-password"
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-confirm">Confirm Password *</Label>
                            <Input
                                id="create-confirm"
                                type="password"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Alert>
                            <Lock className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                                The patient will receive these credentials to access their portal.
                                They can change their password after first login.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateAccount} disabled={creating}>
                            {creating ? 'Creating...' : 'Create Account'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
