import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isBrowser = typeof window !== 'undefined';

// Base configuration
const baseConfig: pino.LoggerOptions = {
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    base: {
        env: process.env.NODE_ENV,
    },
};

// Browser logger (simpler, no pretty printing)
const browserLogger = pino({
    ...baseConfig,
    browser: {
        asObject: true,
    },
});

// Server logger - simplified for Next.js compatibility
// Logs as JSON (no pretty printing to avoid Next.js webpack issues)
const serverLogger = pino(baseConfig);

// Export the appropriate logger
export const logger = isBrowser ? browserLogger : serverLogger;

// Create child loggers for different modules
export const apiLogger = logger.child({ module: 'api' });
export const authLogger = logger.child({ module: 'auth' });
export const dbLogger = logger.child({ module: 'database' });
export const uiLogger = logger.child({ module: 'ui' });

// Helper function to create contextual logger
export function createLogger(module: string) {
    return logger.child({ module });
}

// Type-safe log methods with context
export type LogContext = {
    [key: string]: any;
};

// Convenience exports that match original API but with structured logging
export const logError = (message: string, error?: any) => {
    const context = error ? { error: error instanceof Error ? error.message : error } : {};
    logger.error(context, message);
};

export const logWarn = (message: string, data?: any) => {
    logger.warn(data || {}, message);
};

export const logInfo = (message: string, data?: any) => {
    logger.info(data || {}, message);
};

export const logDebug = (message: string, data?: any) => {
    logger.debug(data || {}, message);
};

export default logger;
