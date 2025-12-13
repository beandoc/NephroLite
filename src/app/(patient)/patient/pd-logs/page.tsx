"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Plus, Calendar, Weight, Droplet, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { addDailyMonitoring, getDailyMonitoring } from '@/lib/pd-firestore-helpers';
import { format, parseISO } from 'date-fns';

interface DailyLog {
    id: string;
    date: string;
    weight: string;
    bloodPressureSystolic: string;
    bloodPressureDiastolic: string;
    urineOutput: string;
    ultrafiltration?: string;
    symptoms?: string;
    notes?: string;
}

export default function PDLogsPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        urineOutput: '',
        ultrafiltration: '',
        symptoms: '',
        notes: '',
    });

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        if (!user?.patientId) return;

        try {
            setLoading(true);
            const data = await getDailyMonitoring(user.uid, user.patientId, 30);
            setLogs(data as DailyLog[]);
        } catch (error) {
            console.error('Error loading logs:', error);
            toast({
                title: "Error",
                description: "Failed to load PD logs",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.patientId) return;

        // Validation
        if (!formData.date || !formData.weight || !formData.bloodPressureSystolic || !formData.bloodPressureDiastolic) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);

            const logData = {
                ...formData,
                bloodPressure: `${formData.bloodPressureSystolic}/${formData.bloodPressureDiastolic}`,
                createdAt: new Date().toISOString(),
                enteredBy: 'patient',
            };

            await addDailyMonitoring(user.uid, user.patientId, logData);

            toast({
                title: "Log Saved",
                description: "Your PD monitoring data has been recorded",
            });

            // Reset form
            setFormData({
                date: format(new Date(), 'yyyy-MM-dd'),
                weight: '',
                bloodPressureSystolic: '',
                bloodPressureDiastolic: '',
                urineOutput: '',
                ultrafiltration: '',
                symptoms: '',
                notes: '',
            });

            setShowForm(false);
            await loadLogs();
        } catch (error) {
            console.error('Error saving log:', error);
            toast({
                title: "Error",
                description: "Failed to save log. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <Activity className="mr-3 h-8 w-8 text-blue-500" />
                        PD Daily Monitoring
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track your peritoneal dialysis progress daily
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {showForm ? 'Cancel' : 'Log Today\'s Data'}
                </Button>
            </div>

            {/* Info Alert */}
            <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    Logging your data daily helps your doctor monitor your condition and adjust treatment as needed.
                    Try to log at the same time each day for consistency.
                </AlertDescription>
            </Alert>

            {/* Entry Form */}
            {showForm && (
                <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50">
                        <CardTitle>New PD Log Entry</CardTitle>
                        <CardDescription>
                            Record your vital signs and observations for today
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="flex items-center">
                                        <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                                        Date *
                                    </Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        max={format(new Date(), 'yyyy-MM-dd')}
                                        required
                                    />
                                </div>

                                {/* Weight */}
                                <div className="space-y-2">
                                    <Label htmlFor="weight" className="flex items-center">
                                        <Weight className="mr-2 h-4 w-4 text-blue-500" />
                                        Weight (kg) *
                                    </Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.1"
                                        placeholder="70.5"
                                        value={formData.weight}
                                        onChange={(e) => handleInputChange('weight', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Blood Pressure */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="flex items-center">
                                        <Activity className="mr-2 h-4 w-4 text-blue-500" />
                                        Blood Pressure (mmHg) *
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Systolic (e.g., 120)"
                                            value={formData.bloodPressureSystolic}
                                            onChange={(e) => handleInputChange('bloodPressureSystolic', e.target.value)}
                                            required
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Diastolic (e.g., 80)"
                                            value={formData.bloodPressureDiastolic}
                                            onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Urine Output */}
                                <div className="space-y-2">
                                    <Label htmlFor="urineOutput" className="flex items-center">
                                        <Droplet className="mr-2 h-4 w-4 text-blue-500" />
                                        Urine Output (mL)
                                    </Label>
                                    <Input
                                        id="urineOutput"
                                        type="number"
                                        placeholder="1000"
                                        value={formData.urineOutput}
                                        onChange={(e) => handleInputChange('urineOutput', e.target.value)}
                                    />
                                </div>

                                {/* Ultrafiltration */}
                                <div className="space-y-2">
                                    <Label htmlFor="ultrafiltration" className="flex items-center">
                                        <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
                                        Ultrafiltration (mL)
                                    </Label>
                                    <Input
                                        id="ultrafiltration"
                                        type="number"
                                        placeholder="500"
                                        value={formData.ultrafiltration}
                                        onChange={(e) => handleInputChange('ultrafiltration', e.target.value)}
                                    />
                                </div>

                                {/* Symptoms */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="symptoms">Symptoms (if any)</Label>
                                    <Input
                                        id="symptoms"
                                        placeholder="e.g., Mild abdominal discomfort"
                                        value={formData.symptoms}
                                        onChange={(e) => handleInputChange('symptoms', e.target.value)}
                                    />
                                </div>

                                {/* Notes */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any other observations or concerns..."
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                                    {submitting ? 'Saving...' : 'Save Log Entry'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Logs History */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Logs (Last 30 days)</CardTitle>
                    <CardDescription>
                        Your recorded PD monitoring data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-muted-foreground text-center py-8">Loading logs...</p>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8">
                            <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No logs recorded yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Start tracking your PD data by clicking "Log Today's Data"
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Weight (kg)</TableHead>
                                        <TableHead>BP (mmHg)</TableHead>
                                        <TableHead>Urine Output</TableHead>
                                        <TableHead>UF</TableHead>
                                        <TableHead>Symptoms</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">
                                                {log.date ? format(parseISO(log.date), 'PPP') : 'N/A'}
                                            </TableCell>
                                            <TableCell>{log.weight}</TableCell>
                                            <TableCell>
                                                {log.bloodPressureSystolic}/{log.bloodPressureDiastolic}
                                            </TableCell>
                                            <TableCell>{log.urineOutput || '-'}</TableCell>
                                            <TableCell>{log.ultrafiltration || '-'}</TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {log.symptoms || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
