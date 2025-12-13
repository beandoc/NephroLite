"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { sendPatientPasswordReset } from '@/lib/patient-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

export default function PatientLoginPage() {
    const { signInWithEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await signInWithEmail(email, password);
            // Redirect handled by AuthProvider
        } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else {
                setError(err.message || 'Failed to sign in');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!resetEmail) {
            return;
        }

        try {
            setLoading(true);
            const success = await sendPatientPasswordReset(resetEmail);
            if (success) {
                setResetSuccess(true);
            } else {
                setError('Failed to send reset email. Please check the email address.');
            }
        } catch (err) {
            setError('Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <Link href="/login">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login Selection
                    </Button>
                </Link>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Patient Portal</CardTitle>
                        <CardDescription>
                            Sign in to access your health records
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="h-auto p-0 text-xs"
                                        onClick={() => {
                                            setResetDialogOpen(true);
                                            setResetEmail(email);
                                        }}
                                    >
                                        Forgot password?
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700"
                                size="lg"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="mt-6 space-y-2">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        First time here?
                                    </span>
                                </div>
                            </div>

                            <div className="text-center text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                                <p className="font-medium mb-1">Need portal access?</p>
                                <p>Contact your healthcare provider to create your patient portal account</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Password Reset Dialog */}
                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                                {resetSuccess
                                    ? "Password reset email sent successfully"
                                    : "Enter your email address and we'll send you a password reset link"}
                            </DialogDescription>
                        </DialogHeader>

                        {!resetSuccess ? (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email">Email Address</Label>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="py-4">
                                <Alert className="bg-green-50 border-green-200">
                                    <KeyRound className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        Check your email for the password reset link. The link will expire in 1 hour.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        <DialogFooter>
                            {!resetSuccess ? (
                                <>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button
                                        onClick={handlePasswordReset}
                                        disabled={loading || !resetEmail}
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </Button>
                                </>
                            ) : (
                                <DialogClose asChild>
                                    <Button>Close</Button>
                                </DialogClose>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
