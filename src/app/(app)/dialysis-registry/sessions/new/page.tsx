"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDialysisSessions } from '@/hooks/use-dialysis-sessions';
import { usePatientData } from '@/hooks/use-patient-data';
import { useSystemUsers } from '@/hooks/use-system-users';
import { useToast } from '@/hooks/use-toast';
import { Heart, X, Loader2, UserPlus, Info } from 'lucide-react';
import type { DialysisSession } from '@/lib/dialysis-schemas';

function NewDialysisSessionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { createSession } = useDialysisSessions();
    const { patients } = usePatientData();
    const { users } = useSystemUsers();

    const [isSaving, setIsSaving] = useState(false);
    const [showPatientDialog, setShowPatientDialog] = useState(false);
    const [newPatientData, setNewPatientData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        status: 'Active',
        preApprove: true
    });

    const [formData, setFormData] = useState<Partial<DialysisSession>>({
        dialysisType: 'HD',
        sessionLocation: 'Healthcare Facility',
        indication: 'CKD',
        comorbidities: [],
        bpMonitoring: {
            preSession: {},
            peakBP: {},
            nadirBP: {},
            postSession: {}
        },
        hdParams: {},
        vascularAccess: {},
        medications: {},
        complications: { hasComplication: false },
        consent: {},
    });

    // Pre-fill patient from URL if provided
    useEffect(() => {
        const patientId = searchParams.get('patientId');
        if (patientId && formData.patientId !== patientId) {
            setFormData(prev => ({ ...prev, patientId }));
        }
    }, [searchParams, formData.patientId]);

    const doctors = users.filter(u => u.role === 'doctor');
    const selectedPatient = patients.find(p => p.id === formData.patientId);

    const handleCreatePatient = async () => {
        if (!newPatientData.name || !newPatientData.email || !newPatientData.password) {
            toast({ title: 'Error', description: 'Name, email and password are required', variant: 'destructive' });
            return;
        }

        // In a real implementation, this would create a Firebase Auth user and patient record
        toast({ title: 'Patient Created', description: `${newPatientData.name} has been added to the registry` });
        setShowPatientDialog(false);
        setNewPatientData({ name: '', email: '', password: '', phoneNumber: '', status: 'Active', preApprove: true });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.patientId || !formData.providerId) {
            toast({ title: 'Error', description: 'Patient and Provider are required', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            const selectedProvider = doctors.find(d => d.uid === formData.providerId);
            const patientName = selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '';

            await createSession({
                ...formData,
                patientName,
                providerName: selectedProvider?.name || '',
                sessionDate: formData.sessionDate || new Date().toISOString().split('T')[0],
            } as any);

            toast({ title: 'Success', description: 'Dialysis session created successfully' });
            router.push('/dialysis-registry/sessions');
        } catch (error) {
            console.error('Error creating session:', error);
            toast({ title: 'Error', description: 'Failed to create session', variant: 'destructive' });
        }
        setIsSaving(false);
    };

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateNestedField = (parent: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev[parent as keyof typeof prev] as any || {}), [field]: value }
        }));
    };

    const updateBPField = (section: string, field: 'systolic' | 'diastolic', value: number) => {
        setFormData(prev => ({
            ...prev,
            bpMonitoring: {
                ...prev.bpMonitoring,
                [section]: {
                    ...(prev.bpMonitoring?.[section as keyof typeof prev.bpMonitoring] as any || {}),
                    [field]: value
                }
            }
        }));
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Edit Session"
                    description="Create a new dialysis session record"
                />
                <div className="flex gap-2">
                    <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Patient to Registry
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Patient to Registry</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Full Name"
                                        value={newPatientData.name}
                                        onChange={(e) => setNewPatientData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={newPatientData.email}
                                        onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={newPatientData.password}
                                        onChange={(e) => setNewPatientData(prev => ({ ...prev, password: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Phone Number (optional)"
                                        value={newPatientData.phoneNumber}
                                        onChange={(e) => setNewPatientData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={newPatientData.status} onValueChange={(v) => setNewPatientData(prev => ({ ...prev, status: v }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="preApprove"
                                        checked={newPatientData.preApprove}
                                        onCheckedChange={(checked) => setNewPatientData(prev => ({ ...prev, preApprove: checked as boolean }))}
                                    />
                                    <Label htmlFor="preApprove" className="font-normal cursor-pointer">
                                        Pre-approve patient (recommended)
                                    </Label>
                                </div>
                                <Alert className="bg-amber-50 border-amber-200">
                                    <Info className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-sm text-amber-900">
                                        <strong>Note:</strong> Patient will be created with "Patient" role and automatically added
                                        to this registry as Active. Complete the remaining patient details (gender, aadhaar, DOB, location,
                                        etc.) in <strong>Patient Management</strong> table.
                                    </AlertDescription>
                                </Alert>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowPatientDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreatePatient}>
                                    Create & Add Patient
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="patient">Patient *</Label>
                            <Select value={formData.patientId} onValueChange={(v) => updateField('patientId', v)}>
                                <SelectTrigger id="patient">
                                    <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient, index) => (
                                        <SelectItem key={`${patient.id}-${index}`} value={patient.id}>
                                            {patient.firstName} {patient.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="provider">Primary Nephrologist *</Label>
                            <Select value={formData.providerId} onValueChange={(v) => updateField('providerId', v)}>
                                <SelectTrigger id="provider">
                                    <SelectValue placeholder="Select nephrologist" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dr-atul-kumar">Dr Atul Kumar</SelectItem>
                                    <SelectItem value="dr-sachin">Dr Sachin</SelectItem>
                                    <SelectItem value="dr-parikshit-singh">Dr Parikshit Singh</SelectItem>
                                    <SelectItem value="dr-vineet-behera">Dr Vineet Behera</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sessionDate">Date of Session *</Label>
                            <Input
                                id="sessionDate"
                                type="date"
                                value={formData.sessionDate || ''}
                                onChange={(e) => updateField('sessionDate', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dialysisType">Type of Dialysis *</Label>
                            <Select value={formData.dialysisType} onValueChange={(v: 'HD' | 'PD') => updateField('dialysisType', v)}>
                                <SelectTrigger id="dialysisType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HD">Hemodialysis (HD)</SelectItem>
                                    <SelectItem value="PD">Peritoneal Dialysis (PD)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sessionLocation">Location of Session</Label>
                            <Select value={formData.sessionLocation} onValueChange={(v) => updateField('sessionLocation', v)}>
                                <SelectTrigger id="sessionLocation">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Healthcare Facility">Healthcare Facility</SelectItem>
                                    <SelectItem value="Home">Home</SelectItem>
                                    <SelectItem value="Satellite Center">Satellite Center</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="facility">Healthcare Facility *</Label>
                            <Input
                                id="facility"
                                value={formData.healthcareFacility || ''}
                                onChange={(e) => updateField('healthcareFacility', e.target.value)}
                                placeholder="Command Hospital SC"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Clinical Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Clinical Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="indication">Indication of Dialysis</Label>
                            <Select value={formData.indication} onValueChange={(v) => updateField('indication', v)}>
                                <SelectTrigger id="indication">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CKD">CKD</SelectItem>
                                    <SelectItem value="AKI">AKI</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kidneyDisease">Native Kidney Disease</Label>
                            <Input
                                id="kidneyDisease"
                                value={formData.nativeKidneyDisease || ''}
                                onChange={(e) => updateField('nativeKidneyDisease', e.target.value)}
                                placeholder="Diabetic Nephropathy"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="comorbidities">Co-Morbidities</Label>
                            <Input
                                id="comorbidities"
                                value={(formData.comorbidities || []).join(', ')}
                                onChange={(e) => updateField('comorbidities', e.target.value.split(',').map(s => s.trim()))}
                                placeholder="CAD, Diabetes, HTN"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="modality">Dialysis Modality</Label>
                            <Select value={formData.dialysisModality} onValueChange={(v: any) => updateField('dialysisModality', v)}>
                                <SelectTrigger id="modality">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HD">HD</SelectItem>
                                    <SelectItem value="HDF">HDF</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="previousModality">Previous Dialysis Modality</Label>
                            <Input
                                id="previousModality"
                                value={formData.previousDialysisModality || ''}
                                onChange={(e) => updateField('previousDialysisModality', e.target.value)}
                                placeholder="HD"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="initiationDate">Date of Dialysis Initiation</Label>
                            <Input
                                id="initiationDate"
                                type="date"
                                value={formData.dialysisInitiationDate || ''}
                                onChange={(e) => updateField('dialysisInitiationDate', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                                id="duration"
                                type="time"
                                value={formData.sessionDuration || ''}
                                onChange={(e) => updateField('sessionDuration', e.target.value)}
                                placeholder="HH:MM"
                            />
                            <span className="text-xs text-muted-foreground">Hours and minutes</span>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dryWeight">Dry Weight</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="dryWeight"
                                    type="number"
                                    step="0.1"
                                    value={formData.dryWeight || ''}
                                    onChange={(e) => updateField('dryWeight', parseFloat(e.target.value))}
                                />
                                <span className="flex items-center text-sm text-muted-foreground">kg</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* HD Parameters (shown only if HD) */}
                {formData.dialysisType === 'HD' && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Hemodialysis Parameters</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="ultrafiltration">Ultrafiltration</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="ultrafiltration"
                                            type="number"
                                            value={formData.hdParams?.ultrafiltrationVolume || ''}
                                            onChange={(e) => updateNestedField('hdParams', 'ultrafiltrationVolume', parseFloat(e.target.value))}
                                        />
                                        <span className="flex items-center text-sm text-muted-foreground">mL</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tolerance">Fluid Removal Tolerance</Label>
                                    <Select
                                        value={formData.hdParams?.fluidRemovalTolerance || ''}
                                        onValueChange={(v) => updateNestedField('hdParams', 'fluidRemovalTolerance', v)}
                                    >
                                        <SelectTrigger id="tolerance">
                                            <SelectValue placeholder="Select tolerance" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Good">Good</SelectItem>
                                            <SelectItem value="Fair">Fair</SelectItem>
                                            <SelectItem value="Poor">Poor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weightBefore">Weight Before Session</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="weightBefore"
                                            type="number"
                                            step="0.1"
                                            value={formData.hdParams?.weightBefore || ''}
                                            onChange={(e) => updateNestedField('hdParams', 'weightBefore', parseFloat(e.target.value))}
                                        />
                                        <span className="flex items-center text-sm text-muted-foreground">kg</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weightAfter">Weight After Session</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="weightAfter"
                                            type="number"
                                            step="0.1"
                                            value={formData.hdParams?.weightAfter || ''}
                                            onChange={(e) => updateNestedField('hdParams', 'weightAfter', parseFloat(e.target.value))}
                                        />
                                        <span className="flex items-center text-sm text-muted-foreground">kg</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Blood Pressure Monitoring */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Blood Pressure Monitoring</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium mb-3">Before Session</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Systolic BP</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={formData.bpMonitoring?.preSession?.systolic || ''}
                                                    onChange={(e) => updateBPField('preSession', 'systolic', parseFloat(e.target.value))}
                                                    placeholder="---"
                                                />
                                                <span className="flex items-center text-sm text-muted-foreground">mmHg</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Diastolic BP</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={formData.bpMonitoring?.preSession?.diastolic || ''}
                                                    onChange={(e) => updateBPField('preSession', 'diastolic', parseFloat(e.target.value))}
                                                    placeholder="---"
                                                />
                                                <span className="flex items-center text-sm text-muted-foreground">mmHg</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-3">Peak (Highest)</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Systolic BP Peak</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={formData.bpMonitoring?.peakBP?.systolic || ''}
                                                    onChange={(e) => updateBPField('peakBP', 'systolic', parseFloat(e.target.value))}
                                                />
                                                <span className="flex items-center text-sm text-muted-foreground">mmHg</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Diastolic BP Peak</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={formData.bpMonitoring?.peakBP?.diastolic || ''}
                                                    onChange={(e) => updateBPField('peakBP', 'diastolic', parseFloat(e.target.value))}
                                                />
                                                <span className="flex items-center text-sm text-muted-foreground">mmHg</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-3">Nadir (Lowest)</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Systolic BP Nadir</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={formData.bpMonitoring?.nadirBP?.systolic || ''}
                                                    onChange={(e) => updateBPField('nadirBP', 'systolic', parseFloat(e.target.value))}
                                                />
                                                <span className="flex items-center text-sm text-muted-foreground">mmHg</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Diastolic BP Nadir</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={formData.bpMonitoring?.nadirBP?.diastolic || ''}
                                                    onChange={(e) => updateBPField('nadirBP', 'diastolic', parseFloat(e.target.value))}
                                                />
                                                <span className="flex items-center text-sm text-muted-foreground">mmHg</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-3">After Session</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Systolic BP</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={formData.bpMonitoring?.postSession?.systolic || ''}
                                                    onChange={(e) => updateBPField('postSession', 'systolic', parseFloat(e.target.value))}
                                                />
                                                <span className="flex items-center text-sm text-muted-foreground">mmHg</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Diastolic BP</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={formData.bpMonitoring?.postSession?.diastolic || ''}
                                                    onChange={(e) => updateBPField('postSession', 'diastolic', parseFloat(e.target.value))}
                                                />
                                                <span className="flex items-center text-sm text-muted-foreground">mmHg</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vascular Access */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Vascular Access</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="accessType">Access Type</Label>
                                    <Select
                                        value={formData.vascularAccess?.accessType}
                                        onValueChange={(v: any) => updateNestedField('vascularAccess', 'accessType', v)}
                                    >
                                        <SelectTrigger id="accessType">
                                            <SelectValue placeholder="Select access type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AV Fistula">AV Fistula</SelectItem>
                                            <SelectItem value="AV Graft">AV Graft</SelectItem>
                                            <SelectItem value="Catheter">Catheter</SelectItem>
                                            <SelectItem value="Tunneled Catheter">Tunneled Catheter</SelectItem>
                                            <SelectItem value="Temporary Catheter">Temporary Catheter</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accessLocation">Vascular Access Location</Label>
                                    <Input
                                        id="accessLocation"
                                        value={formData.vascularAccess?.location || ''}
                                        onChange={(e) => updateNestedField('vascularAccess', 'location', e.target.value)}
                                        placeholder="Left radiocephalic fistula"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accessCreation">Date of Access Creation</Label>
                                    <Input
                                        id="accessCreation"
                                        type="date"
                                        value={formData.vascularAccess?.creationDate || ''}
                                        onChange={(e) => updateNestedField('vascularAccess', 'creationDate', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="anticoagulation">Anticoagulation</Label>
                                    <Select
                                        value={formData.vascularAccess?.anticoagulation}
                                        onValueChange={(v) => updateNestedField('vascularAccess', 'anticoagulation', v)}
                                    >
                                        <SelectTrigger id="anticoagulation">
                                            <SelectValue placeholder="Select anticoagulation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Heparin">Heparin</SelectItem>
                                            <SelectItem value="Low Molecular Weight Heparin">Low Molecular Weight Heparin</SelectItem>
                                            <SelectItem value="None">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bloodFlow">Blood Flow Rate</Label>
                                    <Input
                                        id="bloodFlow"
                                        type="number"
                                        value={formData.hdParams?.bloodFlowRate || ''}
                                        onChange={(e) => updateNestedField('hdParams', 'bloodFlowRate', parseFloat(e.target.value))}
                                        placeholder="mL/min"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dialysateFlow">Dialysate Flow</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="dialysateFlow"
                                            type="number"
                                            value={formData.hdParams?.dialysateFlowRate || ''}
                                            onChange={(e) => updateNestedField('hdParams', 'dialysateFlowRate', parseFloat(e.target.value))}
                                        />
                                        <span className="flex items-center text-sm text-muted-foreground">mL/min</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dialyzerType">Dialyzer Type</Label>
                                    <Input
                                        id="dialyzerType"
                                        value={formData.hdParams?.dialyzerType || ''}
                                        onChange={(e) => updateNestedField('hdParams', 'dialyzerType', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dialyzerSurface">Dialyzer Surface Area</Label>
                                    <Input
                                        id="dialyzerSurface"
                                        type="number"
                                        step="0.1"
                                        value={formData.hdParams?.dialyzerSurfaceArea || ''}
                                        onChange={(e) => updateNestedField('hdParams', 'dialyzerSurfaceArea', parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="medsAdministered">Medications Administered</Label>
                                    <Textarea
                                        id="medsAdministered"
                                        value={formData.medications?.administered || ''}
                                        onChange={(e) => updateNestedField('medications', 'administered', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="drugAllergies">Drug Allergies</Label>
                                    <Input
                                        id="drugAllergies"
                                        value={formData.medications?.drugAllergies || ''}
                                        onChange={(e) => updateNestedField('medications', 'drugAllergies', e.target.value)}
                                        placeholder="None"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="accessCondition">Vascular Access Condition</Label>
                                    <Textarea
                                        id="accessCondition"
                                        value={formData.vascularAccess?.condition || ''}
                                        onChange={(e) => updateNestedField('vascularAccess', 'condition', e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="interventions">Vascular Interventions Performed</Label>
                                    <Textarea
                                        id="interventions"
                                        value={formData.vascularAccess?.interventionsPerformed || ''}
                                        onChange={(e) => updateNestedField('vascularAccess', 'interventionsPerformed', e.target.value)}
                                        placeholder="None"
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="accessComplications">Access-Related Complications</Label>
                                    <Textarea
                                        id="accessComplications"
                                        value={formData.vascularAccess?.accessRelatedComplications || ''}
                                        onChange={(e) => updateNestedField('vascularAccess', 'accessRelatedComplications', e.target.value)}
                                        placeholder="None"
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Complications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Complications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hasComplications"
                                checked={formData.complications?.hasComplication || false}
                                onCheckedChange={(checked) => updateNestedField('complications', 'hasComplication', checked)}
                            />
                            <Label htmlFor="hasComplications" className="font-normal cursor-pointer">
                                Any Complications During Session?
                            </Label>
                        </div>

                        {formData.complications?.hasComplication && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="complicationsDesc">Complications Description</Label>
                                    <Textarea
                                        id="complicationsDesc"
                                        value={formData.complications?.description || ''}
                                        onChange={(e) => updateNestedField('complications', 'description', e.target.value)}
                                        placeholder="Brief description of complications that occurred"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="management">Complications Management</Label>
                                    <Input
                                        id="management"
                                        value={formData.complications?.management || ''}
                                        onChange={(e) => updateNestedField('complications', 'management', e.target.value)}
                                        placeholder="Temporary cessation of UF"
                                    />
                                    <span className="text-xs text-muted-foreground">Select or type management actions taken</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="adherence">Dialysis Adherence</Label>
                            <Input
                                id="adherence"
                                value={formData.dialysisAdherence || ''}
                                onChange={(e) => updateField('dialysisAdherence', e.target.value)}
                                placeholder="Missed sessions/week or month"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="concerns">Any Concerns for Doctor</Label>
                            <Textarea
                                id="concerns"
                                value={formData.concernsForDoctor || ''}
                                onChange={(e) => updateField('concernsForDoctor', e.target.value)}
                                placeholder="None"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nextSession">Next Session (Appt ID)</Label>
                            <Input
                                id="nextSession"
                                value={formData.nextSessionId || ''}
                                onChange={(e) => updateField('nextSessionId', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Consent */}
                <Card>
                    <CardHeader>
                        <CardTitle>Consent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="researchConsent"
                                    checked={formData.consent?.researchDataSharing || false}
                                    onCheckedChange={(checked) => updateNestedField('consent', 'researchDataSharing', checked)}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <Label htmlFor="researchConsent" className="font-medium cursor-pointer">
                                        Consent to share dialysis related data for Research Purposes
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        I agree to share my dialysis related data for Research Purposes
                                    </p>
                                    <span className="inline-block mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        Sharing Data for Research
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Creating...' : 'Update'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// Wrap with Suspense to fix Next.js build error
export default function Page() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <NewDialysisSessionPage />
        </Suspense>
    );
}
