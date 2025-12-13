
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill, FileText, Upload, MessageSquare, Calendar, Clock, Download, Eye, Stethoscope } from 'lucide-react';
import { usePatientPortal } from '@/hooks/use-patient-portal';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function PatientDashboardWidgets() {
    const { medications, messages, documents, nextAppointment, visits, loading, uploadDocument } = usePatientPortal();

    return (
        <div className="space-y-6">
            {/* Next Appointment Banner */}
            {nextAppointment && (
                <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-blue-100 mb-1 flex items-center">
                                <Calendar className="mr-2 h-4 w-4" /> Next Appointment
                            </p>
                            <h3 className="text-2xl font-bold">
                                {format(new Date(nextAppointment.date), 'EEEE, MMMM do, yyyy')}
                            </h3>
                            <p className="text-blue-100 text-sm mt-1">{nextAppointment.type || 'Follow-up'}</p>
                        </div>
                        <Button variant="secondary" className="text-blue-700">
                            Reschedule
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Medications Widget */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Pill className="mr-2 h-5 w-5 text-blue-500" />
                            Recent Medications
                        </CardTitle>
                        <CardDescription>From your latest clinical visit</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                                <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                            </div>
                        ) : medications.length > 0 ? (
                            <div className="space-y-3">
                                {medications.map((med, idx) => (
                                    <div key={idx} className="flex justify-between items-start border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium">{med.name}</p>
                                            <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                                            {med.instructions && <p className="text-xs text-muted-foreground italic">{med.instructions}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm italic">No active medications found on record.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Visit History Widget (New) */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Stethoscope className="mr-2 h-5 w-5 text-teal-500" />
                            Recent Visits
                        </CardTitle>
                        <CardDescription>Your clinical history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-4 bg-muted rounded w-full animate-pulse" />
                        ) : visits.length > 0 ? (
                            <div className="space-y-3">
                                {visits.map((visit) => (
                                    <div key={visit.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center">
                                            <div className="bg-teal-100 text-teal-700 p-2 rounded-full mr-3">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{format(new Date(visit.date), 'MMM d, yyyy')}</p>
                                                <p className="text-xs text-muted-foreground">{visit.visitType || 'Consultation'}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            Completed
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm italic">No past visits recorded.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Documents Widget */}
                <DocumentsWidget documents={documents} onUpload={uploadDocument} />

                {/* Messages Widget */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <MessageSquare className="mr-2 h-5 w-5 text-purple-500" />
                            Messages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-4 bg-muted rounded w-full animate-pulse" />
                        ) : messages.length > 0 ? (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="bg-muted/50 p-3 rounded-lg text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold">{msg.senderName || 'Doctor'}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'MMM d') : ''}
                                            </span>
                                        </div>
                                        <p>{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No new messages.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DocumentsWidget({ documents, onUpload }: { documents: any[], onUpload: (f: File, d: string) => Promise<void> }) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [desc, setDesc] = useState('');
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const handleUpload = async () => {
        if (!file) return;
        try {
            setUploading(true);
            await onUpload(file, desc);
            toast({ title: "Upload Successful", description: "Document has been sent to your doctor." });
            setIsUploadOpen(false);
            setFile(null);
            setDesc('');
        } catch (error) {
            console.error(error);
            toast({ title: "Upload Failed", description: "Could not upload document.", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="flex items-center text-lg">
                        <FileText className="mr-2 h-5 w-5 text-orange-500" />
                        Documents
                    </CardTitle>
                    <CardDescription>Reports & Uploads</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                </Button>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {documents.length > 0 ? documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border">
                            <div className="flex items-center overflow-hidden">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                <div className="truncate">
                                    <p className="text-sm font-medium truncate">{doc.description || doc.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {doc.uploadedAt?.toDate ? format(doc.uploadedAt.toDate(), 'MMM d, yyyy') : ''}
                                    </p>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open(doc.url, '_blank')}>
                                <Eye className="h-4 w-4" />
                            </Button>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-sm italic">No documents uploaded yet.</p>
                    )}
                </div>
            </CardContent>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                            Share reports, lab results, or images with your doctor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input placeholder="e.g. Blood Test Report" value={desc} onChange={(e) => setDesc(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>File</Label>
                            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpload} disabled={uploading || !file}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
