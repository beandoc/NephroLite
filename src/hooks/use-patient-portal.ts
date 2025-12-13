
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/context/auth-provider';
import { Visit, Appointment, Medication } from '@/lib/types';

export function usePatientPortal() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [nextAppointment, setNextAppointment] = useState<any>(null); // loosen type as Appointment structure varies
    const [messages, setMessages] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [patientProfile, setPatientProfile] = useState<any>(null);

    useEffect(() => {
        if (!user?.patientId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // 0. Fetch Patient Profile (Root)
                const profileRef = doc(db, `patients/${user.patientId}`);
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                    setPatientProfile(profileSnap.data());
                }

                // 1. Fetch Visits (Root 'patients' collection)
                const visitsRef = collection(db, `patients/${user.patientId}/visits`);
                const visitsQuery = query(visitsRef, orderBy('date', 'desc'), limit(5));
                const visitsSnap = await getDocs(visitsQuery);

                const foundVisits = visitsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
                setVisits(foundVisits);

                let foundMeds: Medication[] = [];
                // Find latest meds from the most recent visit that has them
                for (const v of foundVisits) {
                    if (v.clinicalData?.medications && v.clinicalData.medications.length > 0) {
                        foundMeds = v.clinicalData.medications;
                        break;
                    }
                }
                setMedications(foundMeds);

                // 2. Fetch Next Appointment
                // Priority: 1. patientProfile.nextAppointmentDate 2. appointments query
                let nextAppt = null;
                if (profileSnap.exists()) {
                    const pData = profileSnap.data();
                    if (pData.nextAppointmentDate) {
                        // Create a dummy appointment object from the date string
                        nextAppt = {
                            date: pData.nextAppointmentDate,
                            type: 'Scheduled'
                        };
                    }
                }

                // 3. Fetch Messages (Root 'messages' collection)
                const messagesRef = collection(db, 'messages');
                // Use client-side sorting to avoid checking for composite index
                const messagesQuery = query(
                    messagesRef,
                    where('recipientId', '==', user.patientId)
                );
                // Real-time listener for messages
                const unsubMessages = onSnapshot(messagesQuery, (snap) => {
                    const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    // Sort descending by createdAt
                    msgs.sort((a: any, b: any) => {
                        const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                        const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                        return tB - tA;
                    });
                    setMessages(msgs.slice(0, 10)); // Limit to recent 10
                });

                // 4. Fetch Documents (Root 'patients/{id}/documents')
                const docsRef = collection(db, `patients/${user.patientId}/documents`);
                const docsQuery = query(docsRef, orderBy('uploadedAt', 'desc'));
                const unsubDocs = onSnapshot(docsQuery, (snap) => {
                    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setDocuments(docs);
                });

                setLoading(false);
                setNextAppointment(nextAppt);

                return () => {
                    unsubMessages();
                    unsubDocs();
                };

            } catch (error) {
                console.error("Error fetching portal data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.patientId]);

    const uploadDocument = async (file: File, description: string) => {
        if (!user?.patientId) throw new Error("No patient ID");

        const storageRef = ref(storage, `patients/${user.patientId}/documents/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(db, `patients/${user.patientId}/documents`), {
            name: file.name,
            url: url,
            type: file.type,
            size: file.size,
            description,
            uploadedAt: serverTimestamp(),
            uploadedBy: 'patient'
        });
    };

    return {
        loading,
        medications,
        nextAppointment,
        messages,
        documents,
        visits,
        patientProfile,
        uploadDocument
    };
}
