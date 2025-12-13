
"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Trash2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface PatientDocumentsTabProps {
    patientId: string;
}

export function PatientDocumentsTabContent({ patientId }: PatientDocumentsTabProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const docsRef = collection(db, `patients/${patientId}/documents`);
        const q = query(docsRef, orderBy('uploadedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDocuments(docs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching documents:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [patientId]);

    const handleDelete = async (docId: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            await deleteDoc(doc(db, `patients/${patientId}/documents/${docId}`));
            toast({ title: "Document deleted" });
        } catch (error) {
            console.error(error);
            toast({ title: "Error deleting document", variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading documents...</div>;
    }

    return (
        <Card className="shadow-md">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline text-xl">Patient Documents</CardTitle>
                        <CardDescription>
                            Files uploaded by patient and staff
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {documents.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {documents.map((doc) => (
                            <div key={doc.id} className="group relative border rounded-lg p-4 hover:bg-muted/30 transition-colors bg-white dark:bg-slate-950">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => window.open(doc.url, '_blank')}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <h3 className="font-semibold truncate mb-1" title={doc.description || doc.name}>
                                    {doc.description || doc.name}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate mb-4" title={doc.name}>
                                    {doc.name}
                                </p>

                                <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-auto">
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 h-3 w-3" />
                                        {doc.uploadedAt?.toDate ? format(doc.uploadedAt.toDate(), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                                    </div>
                                    <div className="flex items-center">
                                        <User className="mr-2 h-3 w-3" />
                                        <span className="capitalize">{doc.uploadedBy || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                        <h3 className="text-lg font-medium">No documents found</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                            Uploaded documents and reports will appear here.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
