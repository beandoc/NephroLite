"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    exportPatientsToCSV,
    exportSessionsToCSV,
    exportVisitsToCSV,
    exportAllDataToJSON
} from '@/lib/data-export';
import {
    Download,
    Database,
    FileText,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BackupManagementPage() {
    const { toast } = useToast();
    const [exporting, setExporting] = useState<string | null>(null);

    const handleExport = async (type: string, exportFn: () => Promise<void>) => {
        setExporting(type);
        try {
            await exportFn();
            toast({
                title: 'Export Successful',
                description: `${type} data has been exported successfully`,
            });
        } catch (error) {
            toast({
                title: 'Export Failed',
                description: error instanceof Error ? error.message : 'Export failed',
                variant: 'destructive',
            });
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Backup Management</h1>
                <p className="text-muted-foreground mt-1">
                    Manual data export and backup monitoring
                </p>
            </div>

            {/* Backup Status */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Today 2:00 AM</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            Completed successfully
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Backup Schedule</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Daily</div>
                        <p className="text-xs text-muted-foreground">
                            2:00 AM IST (Automated)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collections</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">6</div>
                        <p className="text-xs text-muted-foreground">
                            Being backed up
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Info Alert */}
            <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>Automated backups are running daily.</strong> Use manual export below for immediate data downloads.
                </AlertDescription>
            </Alert>

            {/* Manual Export Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Manual Data Export</CardTitle>
                    <CardDescription>
                        Download data in CSV or JSON format for offline storage
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Patients Export */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Patient Records</h4>
                                <p className="text-sm text-muted-foreground">
                                    Export all patient demographics and basic information
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleExport('Patients', exportPatientsToCSV)}
                            disabled={exporting !== null}
                        >
                            {exporting === 'Patients' ? (
                                <>
                                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Sessions Export */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Database className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Dialysis Sessions</h4>
                                <p className="text-sm text-muted-foreground">
                                    Export all dialysis session records
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleExport('Sessions', exportSessionsToCSV)}
                            disabled={exporting !== null}
                        >
                            {exporting === 'Sessions' ? (
                                <>
                                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Visits Export */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Patient Visits</h4>
                                <p className="text-sm text-muted-foreground">
                                    Export all visit records and clinical notes
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleExport('Visits', exportVisitsToCSV)}
                            disabled={exporting !== null}
                        >
                            {exporting === 'Visits' ? (
                                <>
                                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Full Backup */}
                    <div className="flex items-center justify-between p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <Database className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">Full Database Export</h4>
                                    <Badge variant="secondary">JSON</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Complete backup of all data in JSON format
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleExport('Full Backup', exportAllDataToJSON)}
                            disabled={exporting !== null}
                            variant="default"
                        >
                            {exporting === 'Full Backup' ? (
                                <>
                                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export JSON
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Backup Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Backup Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">📅 Automated Backups</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Run daily at 2:00 AM IST</li>
                            <li>Stored in Google Cloud Storage</li>
                            <li>Retained for 30 days</li>
                            <li>Includes: patients, visits, sessions, users, messages, audit logs</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">💾 Manual Exports</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>CSV format for spreadsheet compatibility</li>
                            <li>JSON format for full data structure</li>
                            <li>Downloaded directly to your computer</li>
                            <li>No automatic retention - save manually</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">🔐 Security</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Exports contain sensitive patient data</li>
                            <li>Store in secure, encrypted location</li>
                            <li>Delete after use if not needed</li>
                            <li>Follow HIPAA/data protection guidelines</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
