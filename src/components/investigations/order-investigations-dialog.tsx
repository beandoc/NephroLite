
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePatientData } from '@/hooks/use-patient-data';
import type { Patient } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Label } from '../ui/label';

interface OrderInvestigationsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTestIds: string[];
}

export function OrderInvestigationsDialog({ isOpen, onOpenChange, selectedTestIds }: OrderInvestigationsDialogProps) {
  const router = useRouter();
  const { patients, isLoading } = usePatientData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const filteredPatients = useMemo(() => {
    if (isLoading) return [];
    const lowercasedQuery = searchQuery.toLowerCase();
    return patients.filter(p => {
        const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ').toLowerCase();
        return fullName.includes(lowercasedQuery) || p.nephroId.toLowerCase().includes(lowercasedQuery);
    });
  }, [searchQuery, patients, isLoading]);

  const handleConfirm = () => {
    if (!selectedPatientId || !selectedDate) return;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const testIdsQuery = selectedTestIds.join(',');

    // Navigate to the patient's investigation tab with query params
    router.push(`/patients/${selectedPatientId}?tab=investigations&date=${dateString}&tests=${testIdsQuery}`);
    onOpenChange(false);
  };
  
  const getPatientName = (patient: Patient) => {
    return [patient.firstName, patient.lastName].filter(Boolean).join(' ');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Log Investigation Results</DialogTitle>
          <DialogDescription>Select a patient and the date of investigation to proceed.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
                 <Label>1. Select Patient</Label>
                 <Input
                    placeholder="Search by name or Nephro ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <ScrollArea className="h-64 border rounded-md">
                    {isLoading ? <p className="p-4 text-muted-foreground">Loading patients...</p> :
                        filteredPatients.length > 0 ? (
                            <ul className="p-2 space-y-1">
                                {filteredPatients.map(p => (
                                    <li key={p.id}>
                                        <Button
                                            variant={selectedPatientId === p.id ? "default" : "ghost"}
                                            className="w-full justify-start text-left h-auto"
                                            onClick={() => setSelectedPatientId(p.id)}
                                        >
                                            <div>
                                                <p className="font-semibold">{getPatientName(p)}</p>
                                                <p className="text-xs text-muted-foreground">{p.nephroId}</p>
                                            </div>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="p-4 text-muted-foreground">No patients found.</p>
                    }
                </ScrollArea>
            </div>
             <div className="space-y-2">
                 <Label>2. Select Date</Label>
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="border rounded-md"
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selectedPatientId || !selectedDate}>
            Confirm & Proceed to Log Results
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
