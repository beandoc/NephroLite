"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SystemUser {
    uid: string;
    name: string;
    email: string;
    role: 'doctor' | 'nurse' | 'admin' | 'staff';
    department?: string;
    staffId?: string;
}

export function useSystemUsers() {
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to users collection in real-time
        const usersRef = collection(db, 'users');
        const q = query(usersRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList: SystemUser[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                usersList.push({
                    uid: doc.id,
                    name: data.name || data.displayName || data.email,
                    email: data.email,
                    role: data.role || 'staff',
                    department: data.department,
                    staffId: data.staffId
                });
            });

            setUsers(usersList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching users:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { users, loading };
}
