"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
}

interface PrescriptionRefillDialogProps {
    medication: Medication;
}

export function PrescriptionRefillDialog({ medication }: PrescriptionRefillDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();

    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!user?.patientId) return;

        try {
            setLoading(true);

            await addDoc(collection(db, 'prescriptionRefills'), {
                patientId: user.patientId,
                patientName: user.displayName || 'Patient',
                patientNephroId: user.nephroId || 'N/A',
                medicationName: medication.name,
                dosage: medication.dosage,
                frequency: medication.frequency,
                notes: notes.trim(),
                status: 'pending',
                requestedAt: serverTimestamp(),
            });

            toast({
                title: "Refill Request Submitted",
                description: `Your refill request for ${medication.name} has been sent to the doctor.`,
            });

            setNotes('');
            setOpen(false);
        } catch (error) {
            console.error('Error submitting refill request:', error);
            toast({
                title: "Submission Failed",
                description: "Could not submit refill request. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Request Refill
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Prescription Refill</DialogTitle>
                    <DialogDescription>
                        Submit a refill request for your medication. Your doctor will review and approve it.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Medication</Label>
                        <Input value={medication.name} disabled />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Dosage</Label>
                            <Input value={medication.dosage} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Input value={medication.frequency} disabled />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any changes needed? (e.g., dosage adjustment, side effects, etc.)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                            Let your doctor know if you need any adjustments
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
