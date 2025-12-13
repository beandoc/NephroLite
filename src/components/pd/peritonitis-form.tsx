"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { addPeritonitisEpisode } from '@/lib/pd-firestore-helpers';

const peritonitisSchema = z.object({
    date: z.string().min(1, "Date is required"),
    organism: z.string().min(1, "Organism is required"),
    outcome: z.enum(['Cured', 'Catheter Removed', 'Shifted to HD', 'Death', 'Ongoing']),
});

type PeritonitisForm = z.infer<typeof peritonitisSchema>;

interface PeritonitisFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    patientName: string;
    onSuccess: () => void;
}

export function PeritonitisFormDialog({ isOpen, onOpenChange, patientId, patientName, onSuccess }: PeritonitisFormDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<PeritonitisForm>({
        resolver: zodResolver(peritonitisSchema),
        defaultValues: {
            date: '',
            organism: '',
            outcome: 'Ongoing',
        }
    });

    const onSubmit = async (data: PeritonitisForm) => {
        if (!user) return;

        try {
            setIsLoading(true);

            await addPeritonitisEpisode(user.uid, patientId, {
                id: crypto.randomUUID(),
                ...data,
            });

            toast({
                title: "Peritonitis Episode Logged",
                description: "Episode has been recorded successfully.",
            });

            form.reset();
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Error logging peritonitis:', error);
            toast({
                title: "Error",
                description: "Failed to log episode. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Log Peritonitis Episode - {patientName}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date of Episode</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="organism"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organism</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Staphylococcus aureus" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="outcome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Outcome</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select outcome" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                                            <SelectItem value="Cured">Cured</SelectItem>
                                            <SelectItem value="Catheter Removed">Catheter Removed</SelectItem>
                                            <SelectItem value="Shifted to HD">Shifted to HD</SelectItem>
                                            <SelectItem value="Death">Death</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                <Save className="mr-2 h-4 w-4" />
                                {isLoading ? 'Saving...' : 'Save Episode'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
