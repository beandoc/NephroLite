
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users, BellDot, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SystemSettingsPage() {
    const { toast } = useToast();

    const handleAction = (feature: string) => {
        toast({
            title: "Feature Under Development",
            description: `The ${feature} feature is a work in progress.`
        })
    }
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="System Settings" description="Configure application settings and preferences." />
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">User role and permission settings.</p>
            <Button onClick={() => handleAction('User Management')}>Manage Users</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><BellDot className="mr-2 h-5 w-5 text-primary"/>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive email updates for critical alerts.
                </span>
              </Label>
              <Switch id="email-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications" className="flex flex-col space-y-1">
                <span>SMS Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive SMS for urgent appointment changes.
                </span>
              </Label>
              <Switch id="sms-notifications" />
            </div>
          </CardContent>
        </Card>
         <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary"/>Security & Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Access audit logs and security settings.</p>
            <Button onClick={() => handleAction('Audit Logs')}>View Audit Logs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
