
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ManageRegistryStatusDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    currentTags: string[];
    onSave: (newTags: string[]) => void;
    patientName: string;
}

const REGISTRY_TAGS = {
    'HD': 'On Hemodialysis',
    'PD': 'On Peritoneal Dialysis',
    'Transplant Prospect': 'Post Kidney Transplant'
};

export function ManageRegistryStatusDialog({ 
    isOpen, 
    onOpenChange, 
    currentTags, 
    onSave,
    patientName
}: ManageRegistryStatusDialogProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedTags(currentTags);
        }
    }, [isOpen, currentTags]);

    const handleCheckedChange = (tag: string, checked: boolean) => {
        setSelectedTags(prev => {
            if (checked) {
                return [...prev, tag];
            } else {
                return prev.filter(t => t !== tag);
            }
        });
    };
    
    const handleSave = () => {
        onSave(selectedTags);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Registry Status for {patientName}</DialogTitle>
                    <DialogDescription>
                        Select the primary clinical status for this patient. This will update their tags and include them in relevant registries.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                    {Object.entries(REGISTRY_TAGS).map(([tag, label]) => (
                        <div key={tag} className="flex items-center space-x-3 p-3 border rounded-md">
                            <Checkbox
                                id={`tag-${tag}`}
                                checked={selectedTags.includes(tag)}
                                onCheckedChange={(checked) => handleCheckedChange(tag, !!checked)}
                            />
                            <Label htmlFor={`tag-${tag}`} className="font-medium cursor-pointer">{label}</Label>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Status</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

