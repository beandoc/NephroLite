
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Send } from 'lucide-react';

export default function CommunicationPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Communication Hub" description="Manage internal messages and patient communication." />
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary"/>Internal Messaging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Feature under development. Secure messaging between staff.</p>
            <div className="h-48 border-2 border-dashed rounded-lg flex items-center justify-center">
                 <p className="text-muted-foreground">Chat Interface Placeholder</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Mail className="mr-2 h-5 w-5 text-primary"/>Patient Outreach (Templates)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-muted-foreground">Feature under development. Send templated messages to patients.</p>
            <Input placeholder="Patient Email or Phone (disabled)" disabled/>
            <Textarea placeholder="Message template (disabled)" rows={3} disabled/>
            <Button disabled><Send className="mr-2 h-4 w-4"/>Send Message (Disabled)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
