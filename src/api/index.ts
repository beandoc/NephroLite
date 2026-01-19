// Central API exports
// All API classes with comprehensive JSDoc documentation

export { BaseAPI } from './base-api';
export { PatientsAPI, patientsAPI, type Patient, type PatientInput } from './patients-api';
export { SessionsAPI, sessionsAPI, type DialysisSession, type SessionInput } from './sessions-api';
export { VisitsAPI, visitsAPI, type Visit, type VisitInput } from './visits-api';
export { UsersAPI, usersAPI, type User, type UserInput, type UserRole } from './users-api';
export { AppointmentsAPI, appointmentsAPI, type Appointment, type AppointmentInput, type AppointmentStatus } from './appointments-api';
export { InvestigationRecordsAPI, investigationRecordsAPI, type InvestigationRecord, type InvestigationRecordInput } from './investigation-records-api';
export { InterventionsAPI, interventionsAPI, type InterventionInput } from './interventions-api';
export { DialysisSessionsAPI, dialysisSessionsAPI, type DialysisSessionInput } from './dialysis-sessions-api';
export { MasterDataAPI, masterDataAPI } from './master-data-api';
export { TemplatesAPI, templatesAPI } from './templates-api';

// Centralized API object for easy imports
import { patientsAPI } from './patients-api';
import { sessionsAPI } from './sessions-api';
import { visitsAPI } from './visits-api';
import { usersAPI } from './users-api';
import { appointmentsAPI } from './appointments-api';
import { investigationRecordsAPI } from './investigation-records-api';
import { interventionsAPI } from './interventions-api';
import { dialysisSessionsAPI } from './dialysis-sessions-api';
import { masterDataAPI } from './master-data-api';
import { templatesAPI } from './templates-api';

/**
 * Centralized API object providing access to all data operations
 * 
 * All APIs use the same pattern:
 * - Automatic error handling with structured logging
 * - Type-safe operations
 * - Consistent return types
 * - Retry logic for transient failures
 * 
 * @example
 * ```typescript
 * import { api } from '@/api';
 * 
 * // Patients
 * const patients = await api.patients.getAll();
 * const patient = await api.patients.getById('patient123');
 * const newPatient = await api.patients.create({ ... });
 * 
 * // Sessions
 * const sessions = await api.sessions.getAll('patient123');
 * 
 * // Visits
 * const visits = await api.visits.getAll('patient123');
 * 
 * // Users
 * const doctors = await api.users.getByRole('doctor');
 * 
 * // Appointments
 * const todayAppointments = await api.appointments.getByDate('2024-12-23');
 * ```
 */
export const api = {
    /** Patient operations - CRUD, search, pagination */
    patients: patientsAPI,

    /** Dialysis session operations - CRUD, filtering */
    sessions: sessionsAPI,

    /** Visit operations - CRUD, patient filtering */
    visits: visitsAPI,

    /** User operations - role management, search */
    users: usersAPI,

    /** Appointment operations - scheduling, status management */
    appointments: appointmentsAPI,

    /** Investigation operations - CRUD, tracking */
    investigations: investigationRecordsAPI,

    /** Intervention operations */
    interventions: interventionsAPI,

    /** Dialysis operations */
    dialysis: dialysisSessionsAPI,

    /** Master Data operations */
    masterData: masterDataAPI,

    /** Template operations */
    templates: templatesAPI,
} as const;

export default api;
