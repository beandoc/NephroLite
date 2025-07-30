
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Send, Users, FileImage, FileTextIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CommunicationPage() {
    const { toast } = useToast();
    const handleAction = (feature: string) => {
        toast({
            title: "Feature Under Development",
            description: `The ${feature} feature is a work in progress.`
        })
    }

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Communication Hub" description="Manage internal messages, patient communication, and health feeds." />
      
      <Card className="mt-6 mb-6">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Search className="mr-2 h-5 w-5 text-primary"/>Notification Search</CardTitle>
          <CardDescription>Search across all patient notifications and internal messages.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input placeholder="Search notifications by patient, keyword, or date..." />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary"/>Internal Staff Messaging</CardTitle>
            <CardDescription>Secure messaging between clinic staff members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/40">
                 <p className="text-muted-foreground">Staff Chat Interface</p>
            </div>
            <Button className="w-full" onClick={() => handleAction('Internal Messaging')}><Send className="mr-2 h-4 w-4"/>Send Internal Message</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Mail className="mr-2 h-5 w-5 text-primary"/>Patient Outreach</CardTitle>
            <CardDescription>Send templated or custom messages to patients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Patient Email or Phone"/>
            <Textarea placeholder="Compose message or select template" rows={3}/>
            <Button className="w-full" onClick={() => handleAction('Patient Outreach')}><Send className="mr-2 h-4 w-4"/>Send to Patient</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Health Feeds</CardTitle>
            <CardDescription>Send PDF or image files to patient groups (e.g., educational material).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" className="text-sm"/>
             <Input placeholder="Select patient group"/>
            <Textarea placeholder="Optional message with file" rows={2}/>
            <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleAction('Send Image')}><FileImage className="mr-2 h-4 w-4"/>Send Image</Button>
                <Button className="flex-1" onClick={() => handleAction('Send PDF')}><FileTextIcon className="mr-2 h-4 w-4"/>Send PDF</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
