"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileImage, FileText, Upload, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { collection, addDoc, serverTimestamp, getDocs, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Checkbox } from '@/components/ui/checkbox';

const PATIENT_GROUPS = [
    { id: 'CKD', label: 'CKD Patients' },
    { id: 'HD', label: 'Hemodialysis' },
    { id: 'PD', label: 'Peritoneal Dialysis' },
    { id: 'Transplant', label: 'Transplant' },
    { id: 'Diabetes', label: 'Diabetic Nephropathy' },
    { id: 'Hypertension', label: 'Hypertensive Nephropathy' }
];

export function HealthFeeds() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(selectedFile.type)) {
            toast({ title: 'Invalid file type', description: 'Please upload PDF, JPG, or PNG files only', variant: 'destructive' });
            return;
        }

        // Validate file size (10MB max)
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast({ title: 'File too large', description: 'Please upload files smaller than 10MB', variant: 'destructive' });
            return;
        }

        setFile(selectedFile);
    };

    const handleGroupToggle = (groupId: string) => {
        setSelectedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleUpload = async () => {
        if (!file || !title || selectedGroups.length === 0 || !user) {
            toast({ title: 'Missing information', description: 'Please provide title, file, and select at least one patient group', variant: 'destructive' });
            return;
        }

        setIsUploading(true);
        try {
            // Upload file to Firebase Storage
            const timestamp = Date.now();
            const storageRef = ref(storage, `health-feeds/${timestamp}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Save metadata to Firestore
            const feedDoc = await addDoc(collection(db, 'healthFeeds'), {
                title,
                description,
                fileUrl: downloadURL,
                fileType: file.type.includes('pdf') ? 'pdf' : 'image',
                fileName: file.name,
                fileSize: file.size,
                patientGroups: selectedGroups,
                uploadedBy: user.email || 'Staff',
                uploadedById: user.uid,
                uploadedAt: serverTimestamp(),
                sentTo: [] // Will be populated when sending to individual patients
            });

            // Send via WhatsApp to matching patients
            const patientsQuery = query(collection(db, 'patients'));
            const patientsSnapshot = await getDocs(patientsQuery);
            const whatsappPatients: Array<{ name: string, phone: string }> = [];
            const emailPatients: Array<{ name: string, email: string }> = [];

            patientsSnapshot.forEach((patientDoc) => {
                const patient = patientDoc.data();
                const patientTags = patient.clinicalProfile?.tags || [];

                // Check if patient matches any selected group
                const hasMatchingTag = selectedGroups.some(group => patientTags.includes(group));

                if (hasMatchingTag) {
                    if (patient.phone) {
                        // Has WhatsApp
                        whatsappPatients.push({
                            name: `${patient.firstName} ${patient.lastName}`,
                            phone: patient.phone.replace(/[^0-9]/g, '')
                        });
                    } else if (patient.email) {
                        // No phone but has email
                        emailPatients.push({
                            name: `${patient.firstName} ${patient.lastName}`,
                            email: patient.email
                        });
                    }
                }
            });

            const totalPatients = whatsappPatients.length + emailPatients.length;

            if (totalPatients === 0) {
                toast({ title: 'No matching patients', description: 'No patients found with contact info in selected groups', variant: 'destructive' });
                setIsUploading(false);
                return;
            }

            // Prepare WhatsApp message
            const whatsappMessage = `*${title}*\n\n${description || 'New health information for you'}\n\nView here: ${downloadURL}\n\n_Sent from NephroLite Health System_`;

            // Send via WhatsApp
            if (whatsappPatients.length > 0) {
                toast({
                    title: 'Opening WhatsApp...',
                    description: `Sending to ${whatsappPatients.length} patient(s) via WhatsApp`,
                    duration: 5000
                });

                for (const patient of whatsappPatients) {
                    const whatsappUrl = `https://wa.me/91${patient.phone}?text=${encodeURIComponent(whatsappMessage)}`;
                    window.open(whatsappUrl, '_blank');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // Send via Email for patients without phone
            if (emailPatients.length > 0) {
                // Small delay if we just sent WhatsApp
                if (whatsappPatients.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                toast({
                    title: 'Opening Email...',
                    description: `Sending to ${emailPatients.length} patient(s) via Email`,
                    duration: 5000
                });

                const emailSubject = `Health Update: ${title}`;
                const emailBody = `Dear Patient,\n\n${title}\n\n${description || 'New health information'}\n\nView here: ${downloadURL}\n\nBest regards,\nNephroLite Health System`;

                for (const patient of emailPatients) {
                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${patient.email}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}&authuser=nirogyams93@gmail.com`;
                    window.open(gmailUrl, '_blank');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            toast({
                title: '✅ Messages prepared!',
                description: `WhatsApp: ${whatsappPatients.length} | Email: ${emailPatients.length}. Click send in each tab.`,
                duration: 10000
            });

            // Reset form
            setTitle('');
            setDescription('');
            setFile(null);
            setSelectedGroups([]);
        } catch (error) {
            console.error('Error uploading health feed:', error);
            toast({ title: 'Upload failed', description: 'An error occurred while uploading', variant: 'destructive' });
        }
        setIsUploading(false);
    };

    return (
        <Card className="lg:col-span-1 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center">
                    <Upload className="mr-2 h-5 w-5 text-primary" />
                    Health Feeds
                </CardTitle>
                <CardDescription>Send educational material to patient groups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="feed-title">Title</Label>
                    <Input
                        id="feed-title"
                        placeholder="e.g., Diet Guidelines for CKD"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="feed-description">Description (Optional)</Label>
                    <Textarea
                        id="feed-description"
                        placeholder="Brief description of the material..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="resize-none"
                    />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                    <Label>Upload File (PDF or Image, max 10MB)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        {file ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {file.type.includes('pdf') ? <FileText className="h-5 w-5 text-red-500" /> : <FileImage className="h-5 w-5 text-blue-500" />}
                                    <span className="text-sm">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                                    <Upload className="h-5 w-5" />
                                    <span className="text-sm">Click to upload file</span>
                                </div>
                            </label>
                        )}
                    </div>
                </div>

                {/* Patient Groups Selection */}
                <div className="space-y-2">
                    <Label>Send to Patient Groups</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {PATIENT_GROUPS.map((group) => (
                            <div key={group.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={group.id}
                                    checked={selectedGroups.includes(group.id)}
                                    onCheckedChange={() => handleGroupToggle(group.id)}
                                />
                                <label
                                    htmlFor={group.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {group.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upload Button */}
                <Button
                    className="w-full"
                    onClick={handleUpload}
                    disabled={isUploading || !file || !title || selectedGroups.length === 0}
                >
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload & Send
                </Button>
            </CardContent>
        </Card>
    );
}
