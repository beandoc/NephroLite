import DOMPurify from 'isomorphic-dompurify';

/**
 * Input sanitization utilities to prevent XSS attacks
 * and ensure data integrity
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for any user-generated content that will be rendered as HTML
 */
export function sanitizeHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
}

/**
 * Sanitize plain text input
 * Removes potentially harmful characters and scripts
 */
export function sanitizeText(input: string): string {
    if (!input) return '';

    return input
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove inline event handlers
}

/**
 * Sanitize email input
 * Basic email format validation and sanitization
 */
export function sanitizeEmail(email: string): string {
    if (!email) return '';

    const sanitized = email.toLowerCase().trim();

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(sanitized)) {
        return '';
    }

    return sanitized;
}

/**
 * Sanitize phone number
 * Removes all non-numeric characters except + at the start
 */
export function sanitizePhone(phone: string): string {
    if (!phone) return '';

    let sanitized = phone.trim();

    // Allow + at the start for international numbers
    if (sanitized.startsWith('+')) {
        sanitized = '+' + sanitized.slice(1).replace(/\D/g, '');
    } else {
        sanitized = sanitized.replace(/\D/g, '');
    }

    return sanitized;
}

/**
 * Sanitize numeric input
 * Ensures value is a valid number within optional min/max range
 */
export function sanitizeNumber(
    value: string | number,
    options?: { min?: number; max?: number; decimals?: number }
): number | null {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return null;

    let sanitized = num;

    // Apply min/max constraints
    if (options?.min !== undefined && sanitized < options.min) {
        sanitized = options.min;
    }
    if (options?.max !== undefined && sanitized > options.max) {
        sanitized = options.max;
    }

    // Round to specified decimals
    if (options?.decimals !== undefined) {
        sanitized = parseFloat(sanitized.toFixed(options.decimals));
    }

    return sanitized;
}

/**
 * Sanitize URL
 * Ensures URL is safe and properly formatted
 */
export function sanitizeURL(url: string): string {
    if (!url) return '';

    const sanitized = url.trim();

    // Only allow http, https, and mailto protocols
    const allowedProtocols = /^(https?|mailto):/i;

    try {
        const urlObj = new URL(sanitized);

        if (!allowedProtocols.test(urlObj.protocol)) {
            return '';
        }

        return urlObj.toString();
    } catch {
        // If URL parsing fails, return empty string
        return '';
    }
}

/**
 * Sanitize form data object
 * Applies appropriate sanitization based on field types
 */
export function sanitizeFormData<T extends Record<string, any>>(
    data: T,
    schema?: {
        [K in keyof T]?: 'text' | 'email' | 'phone' | 'number' | 'html' | 'url';
    }
): T {
    const sanitized = { ...data };

    for (const key in sanitized) {
        const value = sanitized[key];
        const type = schema?.[key];

        if (typeof value !== 'string') continue;

        switch (type) {
            case 'email':
                sanitized[key] = sanitizeEmail(value) as any;
                break;
            case 'phone':
                sanitized[key] = sanitizePhone(value) as any;
                break;
            case 'html':
                sanitized[key] = sanitizeHTML(value) as any;
                break;
            case 'url':
                sanitized[key] = sanitizeURL(value) as any;
                break;
            case 'text':
            default:
                sanitized[key] = sanitizeText(value) as any;
                break;
        }
    }

    return sanitized;
}

/**
 * Escape special characters for use in RegExp
 */
export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate and sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
    if (!fileName) return '';

    // Remove path traversal attempts
    let sanitized = fileName.replace(/\.\./g, '');

    // Remove special characters that could cause issues
    sanitized = sanitized.replace(/[<>:"|?*]/g, '');

    // Limit length
    const maxLength = 255;
    if (sanitized.length > maxLength) {
        const ext = sanitized.split('.').pop() || '';
        const name = sanitized.substring(0, maxLength - ext.length - 1);
        sanitized = `${name}.${ext}`;
    }

    return sanitized;
}
