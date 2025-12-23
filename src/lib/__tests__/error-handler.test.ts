import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, retryWithBackoff, isRetryableError, validateRequired } from '../error-handler';

describe('AppError', () => {
    it('should create error with correct properties', () => {
        const error = new AppError('Test error', 'TEST_CODE', 400, { foo: 'bar' });

        expect(error.message).toBe('Test error');
        expect(error.code).toBe('TEST_CODE');
        expect(error.statusCode).toBe(400);
        expect(error.metadata).toEqual({ foo: 'bar' });
        expect(error.name).toBe('AppError');
    });

    it('should have default status code of 500', () => {
        const error = new AppError('Server error', 'SERVER_ERROR');
        expect(error.statusCode).toBe(500);
    });
});

describe('retryWithBackoff', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('should return result on first try if successful', async () => {
        const fn = vi.fn(async () => 'Success');

        const promise = retryWithBackoff(fn, 3, 1000);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toBe('Success');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry failed function up to maxRetries times', async () => {
        let attempts = 0;
        const fn = vi.fn(async () => {
            attempts++;
            if (attempts < 3) {
                throw new Error('Failed');
            }
            return 'Success';
        });

        const promise = retryWithBackoff(fn, 3, 100);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toBe('Success');
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
        const fn = vi.fn(async () => {
            throw new Error('Always fails');
        });

        const promise = retryWithBackoff(fn, 2, 100);

        await expect(async () => {
            await vi.runAllTimersAsync();
            await promise;
        }).rejects.toThrow('Always fails');

        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry permission errors', async () => {
        const fn = vi.fn(async () => {
            throw new AppError('Permission denied', 'permission-denied', 403);
        });

        await expect(async () => {
            await retryWithBackoff(fn, 3, 100);
        }).rejects.toThrow('Permission denied');

        // Should only be called once (no retries)
        expect(fn).toHaveBeenCalledTimes(1);
    });
});

describe('isRetryableError', () => {
    it('should return true for network errors', () => {
        const error = { code: 'network-request-failed' };
        expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for timeout errors', () => {
        const error = new AppError('Timeout', 'TIMEOUT');
        expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for permission errors', () => {
        const error = { code: 'permission-denied' };
        expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for generic errors', () => {
        const error = new Error('Generic error');
        expect(isRetryableError(error)).toBe(false);
    });
});

describe('validateRequired', () => {
    it('should not throw for valid data', () => {
        const data = { name: 'John', age: 30 };
        expect(() => validateRequired(data, ['name', 'age'])).not.toThrow();
    });

    it('should throw AppError for missing fields', () => {
        const data = { name: 'John' };

        expect(() => validateRequired(data, ['name', 'age', 'email']))
            .toThrow(AppError);

        try {
            validateRequired(data, ['name', 'age']);
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).code).toBe('VALIDATION_ERROR');
            expect((error as AppError).message).toContain('age');
        }
    });

    it('should list all missing fields in error', () => {
        const data = {};

        try {
            validateRequired(data, ['name', 'email', 'phone']);
        } catch (error) {
            const appError = error as AppError;
            expect(appError.message).toContain('name');
            expect(appError.message).toContain('email');
            expect(appError.message).toContain('phone');
            expect(appError.metadata?.missingFields).toEqual(['name', 'email', 'phone']);
        }
    });
});
