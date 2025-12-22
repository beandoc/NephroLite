"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Plus, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDialysisSessions } from '@/hooks/use-dialysis-sessions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PatientRegistriesCardProps {
    patientId: string;
    patientName: string;
}

export function PatientRegistriesCard({ patientId, patientName }: PatientRegistriesCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { sessions, loading } = useDialysisSessions(patientId);
    const [showEnrollDialog, setShowEnrollDialog] = useState(false);

    // Check if patient is enrolled in HD registry
    const isEnrolledInHD = sessions.length > 0;
    const latestSession = sessions[0];

    const handleEnrollInHD = () => {
        // Navigate to create HD session - this automatically enrolls patient in registry
        router.push(`/dialysis-registry/sessions/new?patientId=${patientId}&patientName=${encodeURIComponent(patientName)}`);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Registry Enrollment
                        </CardTitle>
                        <CardDescription>
                            Patient registries for specialized monitoring and research
                        </CardDescription>
                    </div>
                    <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add to Registry
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Enroll Patient in Registry</DialogTitle>
                                <DialogDescription>
                                    Select a registry to enroll this patient. More registries coming soon.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-4">
                                <div
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${isEnrolledInHD
                                            ? 'bg-green-50 border-green-200'
                                            : 'hover:bg-blue-50 hover:border-blue-200 border-gray-200'
                                        }`}
                                    onClick={!isEnrolledInHD ? handleEnrollInHD : undefined}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-blue-100 p-2">
                                                <Heart className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Hemodialysis Registry</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Track HD/PD sessions, vitals, and complications
                                                </p>
                                            </div>
                                        </div>
                                        {isEnrolledInHD ? (
                                            <Badge className="bg-green-600">Enrolled</Badge>
                                        ) : (
                                            <Badge variant="outline">Available</Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Placeholder for future registries */}
                                <div className="p-4 border border-dashed rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3 opacity-50">
                                        <div className="rounded-lg bg-gray-200 p-2">
                                            <FileText className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">More Registries</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Additional specialty registries coming soon
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {!isEnrolledInHD ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="mb-4">Patient is not enrolled in any registry</p>
                        <Button variant="outline" size="sm" onClick={() => setShowEnrollDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Enroll in Registry
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* HD Registry Card */}
                        <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-600 p-2">
                                        <Heart className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Hemodialysis Registry</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-green-600">Active</Badge>
                            </div>

                            {latestSession && (
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div>
                                        <span className="text-muted-foreground">Last Session:</span>
                                        <div className="font-medium flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(latestSession.sessionDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Type:</span>
                                        <div className="font-medium mt-1">
                                            {latestSession.dialysisType === 'HD' ? 'Hemodialysis' : 'Peritoneal Dialysis'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Link href={`/dialysis-registry/sessions/new?patientId=${patientId}&patientName=${encodeURIComponent(patientName)}`} className="flex-1">
                                    <Button size="sm" className="w-full" variant="default">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add HD Session
                                    </Button>
                                </Link>
                                <Link href={`/dialysis-registry/sessions?patientId=${patientId}`} className="flex-1">
                                    <Button size="sm" className="w-full" variant="outline">
                                        View All Sessions
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
