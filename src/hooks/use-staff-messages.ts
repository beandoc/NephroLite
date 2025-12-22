"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, or, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
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

        // Listen to messages where user is sender OR recipient
        const messagesRef = collection(db, 'staffMessages');
        const q = query(
            messagesRef,
            or(
                where('senderId', '==', user.uid),
                where('recipientId', '==', user.uid)
            ),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesList: StaffMessage[] = [];
            snapshot.forEach((doc) => {
                messagesList.push({ id: doc.id, ...doc.data() } as StaffMessage);
            });

            setMessages(messagesList);

            // Count unread messages where user is recipient
            const unread = messagesList.filter(
                m => m.recipientId === user.uid && !m.isRead
            ).length;
            setUnreadCount(unread);

            setLoading(false);
        });

        return () => unsubscribe();
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
