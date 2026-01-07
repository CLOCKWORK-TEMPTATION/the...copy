import { describe, it, expect, vi } from 'vitest';
import LoggerService, { logger } from '../LoggerService';

describe('LoggerService', () => {
    it('should be a singleton', () => {
        const instance1 = LoggerService.getInstance();
        const instance2 = LoggerService.getInstance();
        expect(instance1).toBe(instance2);
        expect(logger).toBe(instance1);
    });

    it('should expose logging methods', () => {
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.debug).toBe('function');
    });

    // Note: Detailed mocking of pino internals for output verification is complex in integration tests
    // and better suited for unit tests verifying specifically that pino is called.
    // Here we just ensure the wrapper structure works.
});
