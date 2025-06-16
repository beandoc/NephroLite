
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FolderSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function DocumentsPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Document Management" description="Upload, view, and manage patient-related documents." />
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Patient Document Repository</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline"><FolderSearch className="mr-2 h-4 w-4" />Browse Documents (Disabled)</Button>
            <Button><UploadCloud className="mr-2 h-4 w-4" />Upload New (Disabled)</Button>
          </div>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground mb-4">Document management features are under development.</p>
           <Input placeholder="Search documents by patient name, ID, or document type..." className="mb-4" disabled/>
          <div className="h-96 border-2 border-dashed rounded-lg flex items-center justify-center">
            <p className="text-xl text-muted-foreground">Document List / Viewer Placeholder</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
