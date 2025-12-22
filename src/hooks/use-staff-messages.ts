"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-provider';

export interface StaffMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: 'doctor' | 'staff';
    recipientId: string;
    recipientName: string;
    recipientRole: 'doctor' | 'staff';
    message: string;
    subject?: string;
    isRead: boolean;
    createdAt: Timestamp;
    readAt?: Timestamp;
}

export function useStaffMessages() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<StaffMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Use two separate queries instead of OR to avoid index requirement
        const messagesRef = collection(db, 'staffMessages');

        let sentMessages: StaffMessage[] = [];
        let receivedMessages: StaffMessage[] = [];

        // Query 1: Messages where user is sender (no orderBy to avoid index)
        const sentQuery = query(
            messagesRef,
            where('senderId', '==', user.uid)
        );

        // Query 2: Messages where user is recipient (no orderBy to avoid index)
        const receivedQuery = query(
            messagesRef,
            where('recipientId', '==', user.uid)
        );

        const updateCombinedMessages = () => {
            // Combine and sort all messages
            const combined = [...sentMessages, ...receivedMessages];
            const uniqueMessages = Array.from(
                new Map(combined.map(m => [m.id, m])).values()
            ).sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
            });

            setMessages(uniqueMessages);

            // Count unread messages where user is recipient
            const unread = uniqueMessages.filter(
                m => m.recipientId === user.uid && !m.isRead
            ).length;
            setUnreadCount(unread);

            setLoading(false);
        };

        // Listen to sent messages
        const unsubscribeSent = onSnapshot(sentQuery, (snapshot) => {
            sentMessages = [];
            snapshot.forEach((doc) => {
                sentMessages.push({ id: doc.id, ...doc.data() } as StaffMessage);
            });
            updateCombinedMessages();
        });

        // Listen to received messages
        const unsubscribeReceived = onSnapshot(receivedQuery, (snapshot) => {
            receivedMessages = [];
            snapshot.forEach((doc) => {
                receivedMessages.push({ id: doc.id, ...doc.data() } as StaffMessage);
            });
            updateCombinedMessages();
        });

        return () => {
            unsubscribeSent();
            unsubscribeReceived();
        };
    }, [user]);

    const sendMessage = async (
        recipientId: string,
        recipientName: string,
        recipientRole: 'doctor' | 'staff',
        message: string,
        subject?: string
    ) => {
        if (!user) throw new Error('Not authenticated');

        await addDoc(collection(db, 'staffMessages'), {
            senderId: user.uid,
            senderName: user.displayName || user.email || 'Staff Member',
            senderRole: user.role || 'staff',
            recipientId,
            recipientName,
            recipientRole,
            message,
            subject,
            isRead: false,
            createdAt: serverTimestamp()
        });
    };

    const markAsRead = async (messageId: string) => {
        const messageRef = doc(db, 'staffMessages', messageId);
        await updateDoc(messageRef, {
            isRead: true,
            readAt: serverTimestamp()
        });
    };

    const markAllAsRead = async () => {
        const unreadMessages = messages.filter(
            m => m.recipientId === user?.uid && !m.isRead
        );

        for (const msg of unreadMessages) {
            await markAsRead(msg.id);
        }
    };

    return {
        messages,
        loading,
        unreadCount,
        sendMessage,
        markAsRead,
        markAllAsRead
    };
}
