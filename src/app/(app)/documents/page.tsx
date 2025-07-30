
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FolderSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function DocumentsPage() {
    const { toast } = useToast();

    const handleAction = (feature: string) => {
        toast({
            title: "Feature Under Development",
            description: `The ${feature} feature is a work in progress.`
        })
    }
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Document Management" description="Upload, view, and manage patient-related documents." />
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Patient Document Repository</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleAction('Browsing Documents')}><FolderSearch className="mr-2 h-4 w-4" />Browse Documents</Button>
            <Button onClick={() => handleAction('Uploading Documents')}><UploadCloud className="mr-2 h-4 w-4" />Upload New</Button>
          </div>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground mb-4">Document management features are under development.</p>
           <Input placeholder="Search documents by patient name, ID, or document type..." className="mb-4" />
          <div className="h-96 border-2 border-dashed rounded-lg flex items-center justify-center">
            <p className="text-xl text-muted-foreground">Document List / Viewer Placeholder</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
