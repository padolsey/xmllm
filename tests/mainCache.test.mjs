import { jest } from '@jest/globals';
import path from 'path';
import * as fs from 'fs/promises';

// Create mock functions with better tracking
const mockFs = {
    mkdir: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue('{}'),
    writeFile: jest.fn().mockResolvedValue(undefined),
    rename: jest.fn().mockResolvedValue(undefined),
};

// Mock setup needs to happen before any imports
await jest.unstable_mockModule('fs/promises', () => mockFs);

// Import after mock is set up
const mainCache = await import('../src/mainCache.mjs');

// Get DEFAULT_CONFIG from mainCache
const { DEFAULT_CONFIG } = await import('../src/mainCache.mjs');

describe('mainCache', () => {
    beforeEach(() => {
        // Clear mocks before each test
        jest.clearAllMocks();
        mainCache.stats.hits = 0;
        mainCache.stats.misses = 0;
    });

    afterAll(async () => {
        await mainCache.cleanup();
    });

    describe('Basic Operations', () => {
        it('should set and get a value', async () => {
            const key = 'test-key';
            const value = 'test-value';
            
            await mainCache.set(key, value);
            const result = await mainCache.get(key);
            
            expect(result?.value).toBe(value);
        });

        it('should handle non-existent keys', async () => {
            const result = await mainCache.get('non-existent-key');
            expect(result).toBeNull();
            expect(mainCache.stats.misses).toBe(1);
        });

        it('should delete a value', async () => {
            const key = 'delete-test';
            await mainCache.set(key, 'value');
            await mainCache.del(key);
            const result = await mainCache.get(key);
            expect(result).toBeNull();
        });
    });

    describe('Cache Stats', () => {
        it('should track cache hits', async () => {
            const key = 'stats-test';
            await mainCache.set(key, 'value');
            await mainCache.get(key);
            expect(mainCache.stats.hits).toBe(1);
        });

        it('should track cache misses', async () => {
            await mainCache.get('missing-key');
            expect(mainCache.stats.misses).toBe(1);
        });
    });

    describe('TTL Functionality', () => {
        it('should expire items after TTL', async () => {
            const key = 'ttl-test';
            const shortTTL = 100; // 100ms
            
            await mainCache.set(key, 'value', shortTTL);
            
            // Should exist immediately
            let result = await mainCache.get(key);
            expect(result?.value).toBe('value');
            
            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, shortTTL + 10));
            
            // Should be expired now
            result = await mainCache.get(key);
            expect(result).toBeNull();
        });
    });

    describe('Configuration', () => {
        it('should allow configuration changes', async () => {
            mainCache.configure({
                maxSize: 1000000,
                maxEntries: 50000,
                ttl: 3600000 // 1 hour
            });

            const key = 'config-test';
            await mainCache.set(key, 'value');
            const result = await mainCache.get(key);
            expect(result?.value).toBe('value');
        });
    });

    describe('Persistence', () => {
        it('should attempt to create cache directory on startup', async () => {
            // Force a new initialization to trigger mkdir
            await import('../src/mainCache.mjs?timestamp=' + Date.now());
            
            // Now mkdir should have been called
            expect(mockFs.mkdir).toHaveBeenCalledWith(
                expect.stringContaining('.cache'),
                { recursive: true }
            );
        });

        it('should handle filesystem errors gracefully', async () => {
            // Reset the mock to track new calls
            mockFs.writeFile.mockClear();
            
            // Setup mock to reject once
            mockFs.writeFile.mockRejectedValueOnce(new Error('Write failed'));
            
            // Set a value and force persistence
            await mainCache.set('error-test', 'value');
            await mainCache.cleanup(); // This will force persistence
            
            // Verify writeFile was called
            expect(mockFs.writeFile).toHaveBeenCalled();
            
            // Verify the error didn't throw
            await expect(mainCache.get('error-test')).resolves.not.toThrow();
        });
    });

    describe('Edge Cases', () => {
        it('should handle null values', async () => {
            await mainCache.set('null-test', null);
            const result = await mainCache.get('null-test');
            expect(result).toBeNull();
        });

        it('should handle undefined values', async () => {
            await mainCache.set('undefined-test', undefined);
            const result = await mainCache.get('undefined-test');
            expect(result).toBeNull();
        });

        it('should handle complex objects', async () => {
            const complexValue = {
                nested: {
                    array: [1, 2, 3],
                    date: new Date(),
                    regex: /test/,
                }
            };
            
            await mainCache.set('complex-test', complexValue);
            const result = await mainCache.get('complex-test');
            expect(result?.value).toEqual(complexValue);
        });

        it('should handle concurrent operations', async () => {
            const operations = Array(10).fill().map((_, i) => 
                mainCache.set(`concurrent-${i}`, `value-${i}`)
            );
            
            await expect(Promise.all(operations)).resolves.not.toThrow();
        });
    });

    describe('Error Handling', () => {
        it('should handle set errors gracefully', async () => {
            const circular = {};
            circular.self = circular;
            
            await expect(mainCache.set('circular', circular)).resolves.not.toThrow();
        });

        it('should handle delete errors gracefully', async () => {
            await expect(mainCache.del('non-existent')).resolves.not.toThrow();
        });
    });

    describe('Cache Concurrency', () => {
        it('should handle concurrent writes to same key', async () => {
            const key = 'concurrent-key';
            const promises = [];
            
            for (let i = 0; i < 100; i++) {
                promises.push(mainCache.set(key, `value-${i}`));
            }
            
            await Promise.all(promises);
            const result = await mainCache.get(key);
            expect(result).toBeTruthy();
        });
        
        it('should handle cache size limits correctly', async () => {
            // Create a string that exceeds maxEntrySize
            const largeValue = 'x'.repeat(DEFAULT_CONFIG.maxEntrySize + 100);
            await mainCache.set('large-key', largeValue);
            const result = await mainCache.get('large-key');
            expect(result).toBeNull();
        });
    });

    describe('Cache Persistence', () => {
        it('should recover from corrupted cache file', async () => {
            // Write corrupted data using the mock
            mockFs.readFile.mockResolvedValueOnce('invalid json');
            
            // Force cache reload
            await mainCache.cleanup();
            const newCache = await import('../src/mainCache.mjs?timestamp=' + Date.now());
            
            // Should start with empty cache
            const result = await newCache.get('test-key');
            expect(result).toBeNull();
        });
    });
});