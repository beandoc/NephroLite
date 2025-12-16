import { toast } from '@/hooks/use-toast';

/**
 * Centralized notification helpers to eliminate duplicated toast calls
 * Provides consistent messaging and reduces code duplication across 50+ components
 */

export const notifications = {
    /**
     * Show success notification
     */
    success: (message: string, description?: string) => {
        toast({
            title: "Success",
            description: description || message,
        });
    },

    /**
     * Show error notification
     */
    error: (message: string, description?: string) => {
        toast({
            title: "Error",
            description: description || message,
            variant: "destructive",
        });
    },

    /**
     * Show info notification
     */
    info: (message: string, description?: string) => {
        toast({
            title: "Info",
            description: description || message,
        });
    },

    /**
     * Show warning notification
     */
    warning: (message: string, description?: string) => {
        toast({
            title: "Warning",
            description: description || message,
            variant: "destructive",
        });
    },

    // Domain-specific notifications
    patient: {
        created: (name: string) => notifications.success(`Patient ${name} registered successfully`),
        updated: (name: string) => notifications.success(`Patient ${name} updated successfully`),
        deleted: (name: string) => notifications.success(`Patient ${name} deleted successfully`),
    },

    visit: {
        created: () => notifications.success("Visit created successfully"),
        updated: () => notifications.success("Visit updated successfully"),
        deleted: () => notifications.success("Visit deleted successfully"),
    },

    investigation: {
        saved: () => notifications.success("Investigation record saved successfully"),
        deleted: () => notifications.success("Investigation record deleted successfully"),
    },

    portal: {
        created: (patientName: string) =>
            notifications.success("Portal Access Created", `Patient portal account created successfully for ${patientName}`),
        deactivated: () => notifications.success("Portal Deactivated", "Patient portal access has been deactivated"),
        reactivated: () => notifications.success("Portal Reactivated", "Patient portal access has been reactivated"),
        passwordReset: (email: string) =>
            notifications.success("Password Reset Sent", `Password reset email sent to ${email}`),
    },

    auth: {
        loginSuccess: () => notifications.success("Login successful"),
        logoutSuccess: () => notifications.success("Logged out successfully"),
        sessionExpired: () => notifications.error("Session expired", "Please log in again"),
    },

    validation: {
        required: (field: string) => notifications.error(`${field} is required`),
        invalid: (field: string) => notifications.error(`Invalid ${field}`),
        passwordMismatch: () => notifications.error("Passwords do not match"),
        passwordTooShort: () => notifications.error("Password must be at least 6 characters"),
    },
};
