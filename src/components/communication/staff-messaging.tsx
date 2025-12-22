"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Send, MessageSquare, Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { useStaffMessages } from '@/hooks/use-staff-messages';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock staff list - in production, fetch from Firestore users collection
const STAFF_MEMBERS = [
    { id: 'staff1', name: 'Dr. Sarah Johnson', role: 'doctor' as const },
    { id: 'staff2', name: 'Nurse Mary Smith', role: 'staff' as const },
    { id: 'staff3', name: 'Admin John Doe', role: 'staff' as const },
];

export function StaffMessaging() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { messages, loading, sendMessage } = useStaffMessages();

    const [messageText, setMessageText] = useState('');
    const [subject, setSubject] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Filter staff members to exclude current user
    const availableRecipients = STAFF_MEMBERS.filter(s => s.id !== user?.uid);

    const handleSend = async () => {
        if (!messageText.trim() || !selectedRecipient) return;

        const recipient = STAFF_MEMBERS.find(s => s.id === selectedRecipient);
        if (!recipient) return;

        setIsSending(true);
        try {
            await sendMessage(
                recipient.id,
                recipient.name,
                recipient.role,
                messageText.trim(),
                subject.trim() || undefined
            );

            setMessageText('');
            setSubject('');
            setSelectedRecipient('');
            toast({ title: 'Message sent successfully' });
        } catch (error) {
            console.error('Error sending message:', error);
            toast({ title: 'Failed to send message', variant: 'destructive' });
        }
        setIsSending(false);
    };

    // Get conversation messages (all messages to/from current user)
    const conversationMessages = messages.slice(0, 10); // Show last 10

    return (
        <Card className="lg:col-span-1 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                    Internal Staff Messaging
                </CardTitle>
                <CardDescription>Secure messaging between clinic staff members.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
                {/* Message History */}
                <div className="flex-1">
                    <Label className="text-sm font-semibold mb-2 block">Recent Messages</Label>
                    <ScrollArea className="h-48 border rounded-md p-3 bg-muted/20">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : conversationMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground text-sm">No messages yet. Start a conversation!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {conversationMessages.map((msg) => {
                                    const isSent = msg.senderId === user?.uid;
                                    const isUnread = msg.recipientId === user?.uid && !msg.isRead;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`p-2 rounded-md ${isSent ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'
                                                } ${isUnread ? 'border-2 border-primary' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <span className="font-semibold text-sm">
                                                        {isSent ? msg.recipientName : msg.senderName}
                                                    </span>
                                                    {isUnread && (
                                                        <span className="text-xs bg-primary text-primary-foreground px-1 rounded">NEW</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
                                                </span>
                                            </div>
                                            {msg.subject && (
                                                <p className="text-xs font-medium text-primary mb-1">{msg.subject}</p>
                                            )}
                                            <p className="text-sm">{msg.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {isSent ? '→ Sent to' : '← From'} {isSent ? msg.recipientName : msg.senderName}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Send New Message */}
                <div className="space-y-3 border-t pt-3">
                    <div className="space-y-2">
                        <Label htmlFor="recipient">Send To</Label>
                        <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                            <SelectTrigger id="recipient">
                                <SelectValue placeholder="Select staff member..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableRecipients.map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id}>
                                        {staff.name} ({staff.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject (Optional)</Label>
                        <Input
                            id="subject"
                            placeholder="Message subject..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Type your message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            rows={2}
                            className="resize-none"
                        />
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleSend}
                        disabled={isSending || !messageText.trim() || !selectedRecipient}
                    >
                        {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Send Message
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
