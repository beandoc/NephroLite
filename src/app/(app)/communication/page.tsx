
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Send, Users, FileImage, FileTextIcon, Search } from 'lucide-react';

export default function CommunicationPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Communication Hub" description="Manage internal messages, patient communication, and health feeds." />
      
      <Card className="mt-6 mb-6">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Search className="mr-2 h-5 w-5 text-primary"/>Notification Search</CardTitle>
          <CardDescription>Search across all patient notifications and internal messages (Feature under development).</CardDescription>
        </CardHeader>
        <CardContent>
          <Input placeholder="Search notifications by patient, keyword, or date..." disabled />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary"/>Internal Staff Messaging</CardTitle>
            <CardDescription>Secure messaging between clinic staff members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">Feature under development.</p>
            <div className="h-48 border-2 border-dashed rounded-lg flex items-center justify-center">
                 <p className="text-muted-foreground">Staff Chat Interface Placeholder</p>
            </div>
            <Button disabled className="w-full"><Send className="mr-2 h-4 w-4"/>Send Internal Message</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Mail className="mr-2 h-5 w-5 text-primary"/>Patient Outreach</CardTitle>
            <CardDescription>Send templated or custom messages to patients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-muted-foreground text-sm">Feature under development.</p>
            <Input placeholder="Patient Email or Phone (disabled)" disabled/>
            <Textarea placeholder="Compose message or select template (disabled)" rows={3} disabled/>
            <Button disabled className="w-full"><Send className="mr-2 h-4 w-4"/>Send to Patient</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Health Feeds</CardTitle>
            <CardDescription>Send PDF or image files to patient groups (e.g., educational material).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">Feature under development.</p>
            <Input type="file" disabled className="text-sm"/>
             <Input placeholder="Select patient group (disabled)" disabled/>
            <Textarea placeholder="Optional message with file (disabled)" rows={2} disabled/>
            <div className="flex gap-2">
                <Button disabled className="flex-1"><FileImage className="mr-2 h-4 w-4"/>Send Image</Button>
                <Button disabled className="flex-1"><FileTextIcon className="mr-2 h-4 w-4"/>Send PDF</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
