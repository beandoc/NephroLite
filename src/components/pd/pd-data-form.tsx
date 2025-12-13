"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { savePDBaseline, addPDExchange, getPDExchanges, deletePDExchange } from '@/lib/pd-firestore-helpers';

const pdDataSchema = z.object({
    // Baseline data
    pdStartDate: z.string().optional(),
    transferSetDate: z.string().optional(),
    transporterStatus: z.string().optional(),
    ktVValue: z.string().optional(),
    baselineWeight: z.string().optional(),
    baselineBP: z.string().optional(),
    baselineUrineOutput: z.string().optional(),

    // Prescription
    numberOfCycles: z.number().optional(),
    generalDwellVolume: z.string().optional(),
});

const exchangeSchema = z.object({
    id: z.string().optional(),
    exchangeNo: z.number(),
    strength: z.string(),
    exchangeTime: z.string(),
    dwellTime: z.string(),
    dwellVolume: z.string(),
});

type PDDataForm = z.infer<typeof pdDataSchema>;
type ExchangeForm = z.infer<typeof exchangeSchema>;

interface PDDataFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    patientName: string;
    existingData?: any;
}

export function PDDataFormDialog({ isOpen, onOpenChange, patientId, patientName, existingData }: PDDataFormDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<PDDataForm>({
        resolver: zodResolver(pdDataSchema),
        defaultValues: existingData || {
            pdStartDate: '',
            transferSetDate: '',
            transporterStatus: '',
            ktVValue: '',
            baselineWeight: '',
            baselineBP: '',
            baselineUrineOutput: '',
            numberOfCycles: 0,
            generalDwellVolume: '',
        }
    });

    const [exchanges, setExchanges] = useState<any[]>([]);
    const [newExchange, setNewExchange] = useState<Partial<ExchangeForm>>({
        exchangeNo: 1,
        strength: '',
        exchangeTime: '',
        dwellTime: '',
        dwellVolume: '',
    });

    const onSubmit = async (data: PDDataForm) => {
        if (!user) return;

        try {
            setIsLoading(true);

            // Save baseline data
            await savePDBaseline(user.uid, patientId, data);

            toast({
                title: "PD Data Saved",
                description: "Patient PD data has been updated successfully.",
            });

            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving PD data:', error);
            toast({
                title: "Error",
                description: "Failed to save PD data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddExchange = async () => {
        if (!user || !newExchange.exchangeNo || !newExchange.strength) {
            toast({ title: "Error", description: "Please fill in exchange details", variant: "destructive" });
            return;
        }

        try {
            const exchange = {
                id: crypto.randomUUID(),
                ...newExchange as ExchangeForm,
            };

            await addPDExchange(user.uid, patientId, exchange);
            setExchanges([...exchanges, exchange]);

            // Reset form
            setNewExchange({
                exchangeNo: (newExchange.exchangeNo || 0) + 1,
                strength: '',
                exchangeTime: '',
                dwellTime: '',
                dwellVolume: '',
            });

            toast({ title: "Exchange Added", description: "PD exchange added successfully" });
        } catch (error) {
            console.error('Error adding exchange:', error);
            toast({ title: "Error", description: "Failed to add exchange", variant: "destructive" });
        }
    };

    const handleDeleteExchange = async (exchangeId: string) => {
        if (!user) return;

        try {
            await deletePDExchange(user.uid, patientId, exchangeId);
            setExchanges(exchanges.filter(ex => ex.id !== exchangeId));
            toast({ title: "Exchange Deleted" });
        } catch (error) {
            console.error('Error deleting exchange:', error);
            toast({ title: "Error", description: "Failed to delete exchange", variant: "destructive" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>PD Data for {patientName}</DialogTitle>
                    <DialogDescription>
                        Enter peritoneal dialysis baseline data, prescriptions, and exchange schedule.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="baseline" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="baseline">Baseline & Adequacy</TabsTrigger>
                        <TabsTrigger value="prescription">Prescription & Exchanges</TabsTrigger>
                    </TabsList>

                    <TabsContent value="baseline" className="space-y-4 mt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-md">PD Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="pdStartDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PD Start Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="transferSetDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Transfer Set Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-md">Baseline & Adequacy</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="transporterStatus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Transporter Status</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Low">Low</SelectItem>
                                                            <SelectItem value="Low Average">Low Average</SelectItem>
                                                            <SelectItem value="High Average">High Average</SelectItem>
                                                            <SelectItem value="High">High</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ktVValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kt/V Value</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 2.0" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="baselineWeight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Baseline Weight (kg)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 70" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="baselineBP"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Baseline BP (mmHg)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 120/80" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="baselineUrineOutput"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Baseline Urine Output (mL/day)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 1000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isLoading}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isLoading ? 'Saving...' : 'Save Baseline Data'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="prescription" className="space-y-4 mt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-md">PD Prescription</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="numberOfCycles"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Number of Cycles</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="generalDwellVolume"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>General Dwell Volume (mL)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 2000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-md">Exchange Schedule</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {exchanges.length > 0 && (
                                            <Table className="mb-4">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>#</TableHead>
                                                        <TableHead>Strength</TableHead>
                                                        <TableHead>Time</TableHead>
                                                        <TableHead>Dwell</TableHead>
                                                        <TableHead>Volume</TableHead>
                                                        <TableHead></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {exchanges.map((ex) => (
                                                        <TableRow key={ex.id}>
                                                            <TableCell>{ex.exchangeNo}</TableCell>
                                                            <TableCell>{ex.strength}</TableCell>
                                                            <TableCell>{ex.exchangeTime}</TableCell>
                                                            <TableCell>{ex.dwellTime}</TableCell>
                                                            <TableCell>{ex.dwellVolume}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteExchange(ex.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}

                                        <div className="border rounded-lg p-4 space-y-3">
                                            <h4 className="font-medium">Add New Exchange</h4>
                                            <div className="grid grid-cols-5 gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder="#"
                                                    value={newExchange.exchangeNo}
                                                    onChange={e => setNewExchange({ ...newExchange, exchangeNo: parseInt(e.target.value) })}
                                                />
                                                <Input
                                                    placeholder="Strength"
                                                    value={newExchange.strength}
                                                    onChange={e => setNewExchange({ ...newExchange, strength: e.target.value })}
                                                />
                                                <Input
                                                    type="time"
                                                    value={newExchange.exchangeTime}
                                                    onChange={e => setNewExchange({ ...newExchange, exchangeTime: e.target.value })}
                                                />
                                                <Input
                                                    placeholder="Dwell (hrs)"
                                                    value={newExchange.dwellTime}
                                                    onChange={e => setNewExchange({ ...newExchange, dwellTime: e.target.value })}
                                                />
                                                <Input
                                                    placeholder="Volume (mL)"
                                                    value={newExchange.dwellVolume}
                                                    onChange={e => setNewExchange({ ...newExchange, dwellVolume: e.target.value })}
                                                />
                                            </div>
                                            <Button type="button" onClick={handleAddExchange} variant="outline" size="sm">
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Add Exchange
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isLoading}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isLoading ? 'Saving...' : 'Save Prescription'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
