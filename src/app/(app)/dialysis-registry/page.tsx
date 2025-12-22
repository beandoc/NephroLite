"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Stethoscope, Activity, Lock, Target, BarChart3, ShieldCheck, Microscope, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';

export default function DialysisRegistryPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Card */}
                <Card className="shadow-lg border-0">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-4 shadow-lg">
                                <Heart className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dialysis Registry</h1>
                                <p className="text-gray-600 mt-1">Comprehensive Patient Dialysis Session Management System</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Hero Banner */}
                <Card className="shadow-2xl border-0 overflow-hidden bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                    <CardContent className="p-12">
                        <div className="flex items-center gap-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <svg className="w-20 h-20 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1 text-white">
                                <h2 className="text-4xl font-bold mb-4">Dialysis Registry System</h2>
                                <p className="text-lg text-white/95 leading-relaxed max-w-3xl">
                                    A comprehensive platform for tracking hemodialysis and peritoneal dialysis sessions, monitoring
                                    patient vitals, managing vascular access, and ensuring quality care delivery for patients with chronic
                                    kidney disease.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="shadow-xl border-0 bg-blue-500 text-white hover:shadow-2xl transition-all hover:-translate-y-1">
                        <CardHeader className="pb-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                <Stethoscope className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Session Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-white/90 text-base leading-relaxed">
                                Complete dialysis session records including HD/PD modalities, duration, and clinical outcomes
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl border-0 bg-green-500 text-white hover:shadow-2xl transition-all hover:-translate-y-1">
                        <CardHeader className="pb-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                <Activity className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Vital Monitoring</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-white/90 text-base leading-relaxed">
                                Blood pressure tracking (pre/during/post), weight management, and fluid removal data
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl border-0 bg-purple-500 text-white hover:shadow-2xl transition-all hover:-translate-y-1">
                        <CardHeader className="pb-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                <Lock className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Consent Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-white/90 text-base leading-relaxed">
                                Integrated patient consent tracking for data usage and treatment authorization
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Benefits Section */}
                <Card className="shadow-lg border-0 bg-white">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3">
                                <Star className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">Registry Benefits & Value</h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="border-2 border-blue-200 bg-blue-50 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="rounded-xl bg-blue-100 p-2">
                                            <Target className="h-7 w-7 text-blue-600" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl text-gray-900">Improved Patient Outcomes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed">
                                        Comprehensive tracking enables data-driven decisions, personalized treatment plans, and better
                                        long-term outcomes for dialysis patients
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-green-200 bg-green-50 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="rounded-xl bg-green-100 p-2">
                                            <BarChart3 className="h-7 w-7 text-green-600" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl text-gray-900">Quality Monitoring & Analytics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed">
                                        Real-time monitoring of treatment effectiveness, adherence rates, and complication patterns for
                                        continuous quality improvement
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-purple-200 bg-purple-50 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="rounded-xl bg-purple-100 p-2">
                                            <ShieldCheck className="h-7 w-7 text-purple-600" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl text-gray-900">Regulatory Compliance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed">
                                        Meet healthcare standards, maintain audit trails, and ensure proper documentation for
                                        accreditation requirements
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-orange-200 bg-orange-50 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="rounded-xl bg-orange-100 p-2">
                                            <Microscope className="h-7 w-7 text-orange-600" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl text-gray-900">Clinical Research Support</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed">
                                        Structured data collection enables research studies, outcome analysis, and evidence-based practice
                                        development
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {/* CTA Section */}
                <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Ready to Start Tracking?</h3>
                                <p className="text-white/90">Begin recording comprehensive dialysis session data</p>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/dialysis-registry/dashboard">
                                    <Button size="lg" variant="secondary">
                                        <BarChart3 className="mr-2 h-5 w-5" />
                                        View Dashboard
                                    </Button>
                                </Link>
                                <Link href="/dialysis-registry/sessions/new">
                                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                        <Heart className="mr-2 h-5 w-5" />
                                        Create New Session
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
