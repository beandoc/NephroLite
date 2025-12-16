import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileText, Trash2 } from 'lucide-react';

interface Document {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
    type: string;
}

interface DocumentUploadProps {
    patientId: string;
    documents: Document[];
    onUpload: (file: File) => Promise<string>; // Returns URL
    onDelete: (docId: string) => Promise<void>;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
    patientId,
    documents,
    onUpload,
    onDelete,
}) => {
    const [uploading, setUploading] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await onUpload(file);
            toast.success('Document uploaded successfully');
            e.target.value = ''; // Reset input
        } catch (error) {
            toast.error('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            await onDelete(docId);
            toast.success('Document deleted');
            if (selectedDoc?.id === docId) setSelectedDoc(null);
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload Document</CardTitle>
                    <CardDescription>Upload patient documents and generate QR codes for easy access</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="file-upload">Select File (PDF, Images)</Label>
                            <Input
                                id="file-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="mt-2"
                            />
                        </div>
                        {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Documents List with QR */}
            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Documents</CardTitle>
                    <CardDescription>Click a document to view its QR code</CardDescription>
                </CardHeader>
                <CardContent>
                    {documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Document List */}
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${selectedDoc?.id === doc.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                                            }`}
                                        onClick={() => setSelectedDoc(doc)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <div>
                                                <p className="font-medium text-sm">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(doc.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* QR Code Display */}
                            <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/30">
                                {selectedDoc ? (
                                    <>
                                        <h4 className="font-semibold mb-4 text-center">{selectedDoc.name}</h4>
                                        <QRCodeSVG
                                            value={selectedDoc.url}
                                            size={200}
                                            level="H"
                                            includeMargin
                                        />
                                        <p className="text-xs text-muted-foreground mt-4 text-center">
                                            Scan to access document
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4"
                                            onClick={() => window.open(selectedDoc.url, '_blank')}
                                        >
                                            Open Document
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Select a document to view QR code
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
