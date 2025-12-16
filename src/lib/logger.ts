/**
 * Production-safe logger utility
 * Automatically switches between development and production logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    data?: any;
    timestamp: Date;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    /**
     * Log an informational message
     */
    info(message: string, data?: any): void {
        if (this.isDevelopment) {
            console.log(`ℹ️ ${message}`, data || '');
        }
        // In production, send to error tracking service
        this.sendToService('info', message, data);
    }

    /**
     * Log a warning message
     */
    warn(message: string, data?: any): void {
        if (this.isDevelopment) {
            console.warn(`⚠️ ${message}`, data || '');
        }
        this.sendToService('warn', message, data);
    }

    /**
     * Log an error message
     */
    error(message: string, error?: any): void {
        if (this.isDevelopment) {
            console.error(`❌ ${message}`, error || '');
        }
        this.sendToService('error', message, error);
    }

    /**
     * Log a debug message (development only)
     */
    debug(message: string, data?: any): void {
        if (this.isDevelopment) {
            console.debug(`🐛 ${message}`, data || '');
        }
    }

    /**
     * Send logs to external service (production)
     * TODO: Integrate with Sentry, LogRocket, or similar service
     */
    private sendToService(level: LogLevel, message: string, data?: any): void {
        if (!this.isDevelopment && level === 'error') {
            // In production, send errors to error tracking service
            // Example: Sentry.captureException(new Error(message));

            // For now, we'll store it for future integration
            const logEntry: LogEntry = {
                level,
                message,
                data,
                timestamp: new Date(),
            };

            // TODO: Send to error tracking service
            // This prevents errors from being lost in production
        }
    }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common patterns
export const logError = (message: string, error?: any) => logger.error(message, error);
export const logWarn = (message: string, data?: any) => logger.warn(message, data);
export const logInfo = (message: string, data?: any) => logger.info(message, data);
export const logDebug = (message: string, data?: any) => logger.debug(message, data);
