import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    limit as limitToLast
} from 'firebase/firestore';
import { cleanUndefined } from './firestore-helpers';

// ==================== PD (PERITONEAL DIALYSIS) DATA ====================

export const getPDDataRef = (userId: string, patientId: string) =>
    doc(db, `patients/${patientId}/pdData/baseline`);

// Nested under 'baseline' document to ensure valid odd-number segment count for collections
// Path: patients(1)/pid(2)/pdData(3)/baseline(4)/exchanges(5) -> Valid Collection
export const getPDExchangesRef = (userId: string, patientId: string) =>
    collection(db, `patients/${patientId}/pdData/baseline/exchanges`);

export const getPeritonitisRef = (userId: string, patientId: string) =>
    collection(db, `patients/${patientId}/pdData/baseline/peritonitisEpisodes`);

export const getDailyMonitoringRef = (userId: string, patientId: string) =>
    collection(db, `patients/${patientId}/pdData/baseline/dailyMonitoring`);

// Save PD baseline data
export const savePDBaseline = async (userId: string, patientId: string, data: any) => {
    const pdRef = getPDDataRef(userId, patientId);
    await setDoc(pdRef, cleanUndefined(data), { merge: true });
};

// Get PD baseline data
export const getPDBaseline = async (userId: string, patientId: string) => {
    const pdRef = getPDDataRef(userId, patientId);
    const snap = await getDoc(pdRef);
    return snap.exists() ? snap.data() : null;
};

// Add PD exchange
export const addPDExchange = async (userId: string, patientId: string, exchange: any) => {
    const exchangesRef = getPDExchangesRef(userId, patientId);
    const exchangeDoc = doc(exchangesRef, exchange.id || crypto.randomUUID());
    await setDoc(exchangeDoc, cleanUndefined(exchange));
};

// Get all PD exchanges
export const getPDExchanges = async (userId: string, patientId: string) => {
    const exchangesRef = getPDExchangesRef(userId, patientId);
    const snap = await getDocs(exchangesRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Delete PD exchange
export const deletePDExchange = async (userId: string, patientId: string, exchangeId: string) => {
    const exchangeRef = doc(getPDExchangesRef(userId, patientId), exchangeId);
    await deleteDoc(exchangeRef);
};

// Add peritonitis episode
export const addPeritonitisEpisode = async (userId: string, patientId: string, episode: any) => {
    const episodesRef = getPeritonitisRef(userId, patientId);
    const episodeDoc = doc(episodesRef, episode.id || crypto.randomUUID());
    await setDoc(episodeDoc, cleanUndefined(episode));
};

// Get peritonitis episodes
export const getPeritonitisEpisodes = async (userId: string, patientId: string) => {
    const episodesRef = getPeritonitisRef(userId, patientId);
    const snap = await getDocs(episodesRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Delete peritonitis episode
export const deletePeritonitisEpisode = async (userId: string, patientId: string, episodeId: string) => {
    const episodeRef = doc(getPeritonitisRef(userId, patientId), episodeId);
    await deleteDoc(episodeRef);
};

// Add daily monitoring entry
export const addDailyMonitoring = async (userId: string, patientId: string, monitoring: any) => {
    const monitoringRef = getDailyMonitoringRef(userId, patientId);
    const monitoringDoc = doc(monitoringRef, monitoring.id || crypto.randomUUID());
    await setDoc(monitoringDoc, cleanUndefined(monitoring));
};

// Get daily monitoring entries
export const getDailyMonitoring = async (userId: string, patientId: string, maxLimit = 30) => {
    const monitoringRef = getDailyMonitoringRef(userId, patientId);
    const q = query(monitoringRef, orderBy('date', 'desc'), limitToLast(maxLimit));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
