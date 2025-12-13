"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, getCountFromServer, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-provider';
import { isToday, parseISO } from 'date-fns';

interface DashboardMetrics {
    opdPatients: number;
    ipdPatients: number;
    dialysisSessionsToday: number;
    totalLabRecords: number;
    labResultsToReview: number;
    todaysAppointments: any[];
}

export function useDashboardMetrics() {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        opdPatients: 0,
        ipdPatients: 0,
        dialysisSessionsToday: 0,
        totalLabRecords: 0,
        labResultsToReview: 0,
        todaysAppointments: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const loadMetrics = async () => {
            try {
                setIsLoading(true);
                const today = new Date().toISOString().split('T')[0];

                // Parallel queries for fast loading
                const [
                    opdCount,
                    ipdCount,
                    dialysisCount,
                    appointmentsSnapshot
                ] = await Promise.all([
                    // Count OPD patients
                    getCountFromServer(
                        query(collection(db, 'patients'), where('patientStatus', '==', 'OPD'))
                    ),

                    // Count IPD patients
                    getCountFromServer(
                        query(collection(db, 'patients'), where('patientStatus', '==', 'IPD'))
                    ),

                    // Count today's dialysis appointments
                    getCountFromServer(
                        query(
                            collection(db, 'appointments'),
                            where('date', '==', today),
                            where('type', '==', 'Dialysis Session')
                        )
                    ),

                    // Get today's appointments (limited)
                    getDocs(
                        query(
                            collection(db, 'appointments'),
                            where('date', '==', today),
                            orderBy('time', 'asc'),
                            limit(10) // Only get first 10 for display
                        )
                    ),
                ]);

                // For lab records, we'll get a rough count from recent patients
                // This is better than loading ALL patients
                const recentPatientsSnapshot = await getDocs(
                    query(
                        collection(db, 'patients'),
                        orderBy('createdAt', 'desc'),
                        limit(100) // Sample recent 100 patients
                    )
                );

                let totalLabs = 0;
                let labsToReview = 0;

                recentPatientsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.investigationRecords) {
                        totalLabs += data.investigationRecords.length;

                        // Check for critical results
                        const hasCritical = data.investigationRecords.some((rec: any) =>
                            rec.tests?.some((t: any) => {
                                if (!t.result || !t.normalRange || t.normalRange === 'N/A') return false;
                                const resultValue = parseFloat(t.result);
                                if (isNaN(resultValue)) return false;
                                const rangeMatch = t.normalRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
                                if (rangeMatch) {
                                    return resultValue < parseFloat(rangeMatch[1]) || resultValue > parseFloat(rangeMatch[2]);
                                }
                                return false;
                            })
                        );
                        if (hasCritical) labsToReview++;
                    }
                });

                const appointments = appointmentsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setMetrics({
                    opdPatients: opdCount.data().count,
                    ipdPatients: ipdCount.data().count,
                    dialysisSessionsToday: dialysisCount.data().count,
                    totalLabRecords: totalLabs,
                    labResultsToReview: labsToReview,
                    todaysAppointments: appointments,
                });
            } catch (error) {
                console.error('Error loading dashboard metrics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMetrics();
    }, [user]);

    return { metrics, isLoading };
}
