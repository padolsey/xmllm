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
    beforeAll(async () => {
        await mainCache._reset();
    });

    afterAll(async () => {
        await mainCache._reset();
        // Add a small delay to allow any pending operations to complete
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    beforeEach(async () => {
        // Reset cache state before each test
        await mainCache._reset();
        jest.clearAllMocks();
        mainCache.stats.hits = 0;
        mainCache.stats.misses = 0;
    });

    afterEach(async () => {
        // Clean up after each test
        await mainCache._reset();
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
        beforeEach(() => {
            // Reset stats before each test
            mainCache.stats.hits = 0;
            mainCache.stats.misses = 0;
        });

        it('should track hits and misses correctly', async () => {
            // Set a value
            await mainCache.set('stats-test', 'value');
            
            // Hit
            await mainCache.get('stats-test');
            expect(mainCache.stats.hits).toBe(1);
            expect(mainCache.stats.misses).toBe(0);
            
            // Miss
            await mainCache.get('non-existent');
            expect(mainCache.stats.hits).toBe(1);
            expect(mainCache.stats.misses).toBe(1);
        });

        it('should track expired entries as misses', async () => {
            // Set a value with very short TTL
            await mainCache.set('expire-test', 'value', 1); // 1ms TTL
            
            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Should count as a miss when expired
            await mainCache.get('expire-test');
            expect(mainCache.stats.hits).toBe(0);
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
        it('should create cache directory when needed', async () => {
            // Initially, no directory should be created
            expect(mockFs.mkdir).not.toHaveBeenCalled();
            
            // Force cache initialization by setting a value
            await mainCache.set('test-key', 'test-value');
            
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
        let originalError;
        
        beforeEach(() => {
            originalError = console.error;
            console.error = jest.fn(); // Suppress error output during these tests
        });
        
        afterEach(() => {
            console.error = originalError;
        });

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

    describe('Cache Initialization', () => {
        it('should not create cache directory until first cache operation', async () => {
            expect(mockFs.mkdir).not.toHaveBeenCalled();
            
            // Just importing should not trigger directory creation
            await import('../src/mainCache.mjs?timestamp=' + Date.now());
            expect(mockFs.mkdir).not.toHaveBeenCalled();
            
            // But setting a value should
            await mainCache.set('test-key', 'test-value');
            expect(mockFs.mkdir).toHaveBeenCalledWith(
                expect.stringContaining('.cache'),
                { recursive: true }
            );
        });

        it('should not persist cache if no modifications made', async () => {
            // Reset write tracking
            mockFs.writeFile.mockClear();
            mockFs.rename.mockClear();
            
            // Just reading should not trigger persistence
            await mainCache.get('non-existent');
            
            // No write operations should have occurred
            expect(mockFs.writeFile).not.toHaveBeenCalled();
            expect(mockFs.rename).not.toHaveBeenCalled();
        });
    });

    describe('Cache Persistence Behavior', () => {
        it('should only persist when cache is modified', async () => {
            // Reading shouldn't trigger persistence
            await mainCache.get('test-key');
            expect(mockFs.writeFile).not.toHaveBeenCalled();
            
            // Writing should mark cache for persistence
            await mainCache.set('test-key', 'test-value');
            
            // Force persistence
            await mainCache.cleanup();
            
            // Should have written to temp file and renamed
            expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
            expect(mockFs.rename).toHaveBeenCalledTimes(1);
        });

        it('should handle persistence errors gracefully', async () => {
            // Setup mock to fail writing
            mockFs.writeFile.mockRejectedValueOnce(new Error('Write failed'));
            
            // Should not throw when persistence fails
            await mainCache.set('test-key', 'test-value');
            await expect(mainCache.cleanup()).resolves.not.toThrow();
        });
    });

    describe('Memory Management', () => {
        it('should clear memory under pressure', async () => {
            // Fill cache with some entries
            for (let i = 0; i < 100; i++) {
                await mainCache.set(`key-${i}`, `value-${i}`);
            }
            
            // Mock high memory usage
            const originalMemoryUsage = process.memoryUsage;
            process.memoryUsage = jest.fn().mockReturnValue({
                heapUsed: 900,
                heapTotal: 1000
            });
            
            // Trigger memory pressure check
            await mainCache.checkMemoryPressure();
            
            // Should have cleared some entries
            const stats = await mainCache.getStats();
            expect(stats.entryCount).toBeLessThan(100);
            
            // Restore original function
            process.memoryUsage = originalMemoryUsage;
        });

        it('should respect entry size limits', async () => {
            const largeValue = 'x'.repeat(DEFAULT_CONFIG.maxEntrySize + 100);
            await mainCache.set('large-key', largeValue);
            
            // Large value should not be cached
            const result = await mainCache.get('large-key');
            expect(result).toBeNull();
            
            // Cache should not be marked as modified
            expect(mockFs.writeFile).not.toHaveBeenCalled();
        });
    });

    describe('Cache Cleanup', () => {
        it('should properly clean up resources', async () => {
            // Setup intervals
            await mainCache.set('test-key', 'test-value');
            
            // Cleanup should clear intervals and persist changes
            await mainCache.cleanup();
            
            // Should have attempted final persistence
            expect(mockFs.writeFile).toHaveBeenCalled();
            expect(mockFs.rename).toHaveBeenCalled();
        });
    });
});