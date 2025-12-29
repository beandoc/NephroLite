"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

// Extended user type with role information
export interface ExtendedUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;

    // Role information
    role: 'doctor' | 'nurse' | 'admin' | 'patient';

    // Staff specific
    staffId?: string;
    department?: string;

    // Patient specific
    patientId?: string;
    nephroId?: string;
    isPD?: boolean;
}

interface AuthContextType {
    user: ExtendedUser | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, role: 'doctor' | 'nurse' | 'patient') => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Fetch user role and additional data from Firestore
    const fetchUserData = async (firebaseUser: FirebaseUser): Promise<ExtendedUser | null> => {
        try {
            // CHANGED: Check patientUsers FIRST to prioritize patient accounts
            const patientDocRef = doc(db, `patientUsers/${firebaseUser.uid}`);
            const patientDoc = await getDoc(patientDocRef);

            if (patientDoc.exists()) {
                const data = patientDoc.data();
                // Fetch patient details for nephroId
                const patientRecordRef = doc(db, `patients/${data.patientId}`);
                const patientRecord = await getDoc(patientRecordRef);
                if (patientRecord.exists()) {
                    const patientData = patientRecord.data();
                    const patientName = `${patientData.firstName} ${patientData.lastName}`;
                    const isPD = patientData.clinicalProfile?.primaryDiagnosis === 'Peritoneal Dialysis' ||
                        patientData.clinicalProfile?.tags?.includes('Peritoneal Dialysis') || false;

                    return {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: patientName,
                        photoURL: firebaseUser.photoURL,
                        role: 'patient',
                        patientId: data.patientId,
                        nephroId: patientData.nephroId,
                        isPD,
                    };
                } else {
                    // Fallback: Try to find patient by email (Self-Healing)
                    const { collection, query, where, getDocs, updateDoc } = await import('firebase/firestore');
                    const patientsRef = collection(db, 'patients');
                    const q = query(patientsRef, where('portalEmail', '==', firebaseUser.email));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const foundPatientDoc = querySnapshot.docs[0];
                        const patientData = foundPatientDoc.data();
                        const patientName = `${patientData.firstName} ${patientData.lastName}`;
                        const isPD = patientData.clinicalProfile?.primaryDiagnosis === 'Peritoneal Dialysis' ||
                            patientData.clinicalProfile?.tags?.includes('Peritoneal Dialysis') || false;

                        console.log('Self-healing: Found patient record by email, updating link.');
                        try {
                            await updateDoc(patientDocRef, { patientId: foundPatientDoc.id });
                        } catch (err) {
                            console.warn('Failed to update patient link during self-healing', err);
                        }

                        return {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: patientName,
                            photoURL: firebaseUser.photoURL,
                            role: 'patient',
                            patientId: foundPatientDoc.id,
                            nephroId: patientData.nephroId,
                            isPD,
                        };
                    }
                }

                // If still not found after checking patient record, return safe defaults
                return {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || 'Patient',
                    photoURL: firebaseUser.photoURL,
                    role: 'patient',
                    patientId: data.patientId,
                    nephroId: 'Pending',
                    isPD: false,
                };
            }

            // If not a patient, check staff users (users collection)
            const staffDocRef = doc(db, `users/${firebaseUser.uid}`);
            const staffDoc = await getDoc(staffDocRef);

            if (staffDoc.exists()) {
                const data = staffDoc.data();
                return {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || data.name || data.email,
                    photoURL: firebaseUser.photoURL,
                    role: data.role || 'doctor', // Default to doctor for existing users
                    staffId: data.staffId || firebaseUser.uid,
                    department: data.department,
                };
            }

            // Default for new users (shouldn't happen often)
            return {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                role: 'doctor', // Default role
                staffId: firebaseUser.uid,
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseUser(firebaseUser);

            if (firebaseUser) {
                const extendedUser = await fetchUserData(firebaseUser);
                setUser(extendedUser);
                setLoading(false);

                // Role-based redirect on login
                if (pathname === '/login' || pathname === '/login/staff' || pathname === '/login/patient') {
                    if (extendedUser?.role === 'patient') {
                        router.push('/patient/dashboard');
                    } else {
                        router.push('/dashboard');
                    }
                }
            } else {
                setUser(null);
                setLoading(false);

                // Redirect to login if not authenticated
                const publicPaths = ['/login', '/login/staff', '/login/patient'];
                if (!publicPaths.includes(pathname)) {
                    router.push('/login');
                }
            }
        });

        return () => unsubscribe();
    }, [router, pathname]);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing in with email:', error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string, role: 'doctor' | 'nurse' | 'patient') => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Create user document in appropriate collection
            const userDoc = {
                email: email,
                role: role,
                createdAt: new Date().toISOString(),
            };

            if (role === 'patient') {
                // This should be handled separately with proper patient linking
                console.warn('Patient signup should use createPatientAccount function');
            } else {
                // Create staff user document
                const { db } = await import('@/lib/firebase');
                const { setDoc, doc } = await import('firebase/firestore');
                await setDoc(doc(db, `users/${userCredential.user.uid}`), {
                    ...userDoc,
                    staffId: userCredential.user.uid,
                });
            }
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
