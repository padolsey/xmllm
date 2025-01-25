import { jest } from '@jest/globals';
import { configure } from '../src/config.mjs';

describe('mainCache', () => {
  let mainCache;
  let mockFs;

  beforeAll(async () => {
    // Create mock before any imports to ensure proper initialization
    mockFs = {
      promises: {
        mkdir: jest.fn().mockResolvedValue(true),
        writeFile: jest.fn().mockResolvedValue(true),
        readFile: jest.fn().mockResolvedValue('{}'),
        rename: jest.fn().mockResolvedValue(true)
      },
      path: {
        join: (...args) => args.join('/'),
        dirname: (p) => p.split('/').slice(0, -1).join('/')
      }
    };

    // Import mainCache
    mainCache = await import('../src/mainCache.mjs');
    
    // Inject mock fileOps for testing filesystem operations
    mainCache.setFileOps(mockFs);
  });

  beforeEach(async () => {
    await mainCache._reset();
    mainCache.resetConfig();
    jest.clearAllMocks();
    mainCache.stats.hits = 0;
    mainCache.stats.misses = 0;
    
    // Reset mock implementations
    mockFs.promises.readFile.mockResolvedValue('{}');
  });

  afterAll(async () => {
    await mainCache._reset();
    // Add a small delay to allow any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
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
      await mainCache.set('test-key', 'test-value');
      expect(mockFs.promises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('.cache'),
        expect.objectContaining({ recursive: true })
      );
    });

    it('should handle filesystem errors gracefully', async () => {
      mockFs.promises.writeFile.mockRejectedValueOnce(new Error('Write failed'));
      await mainCache.set('test-key', 'test-value');
      await mainCache.cleanup();
      expect(mockFs.promises.writeFile).toHaveBeenCalled();
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
      const problematic = {
        toJSON: () => { throw new Error('Serialization error'); }
      };
      
      const result = await mainCache.set('error-test', problematic);
      expect(result).toBeNull();
      
      const cached = await mainCache.get('error-test');
      expect(cached).toBeNull();
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
      // Get current config
      const config = mainCache.getConfig();
      // Create a string that exceeds maxEntrySize
      const largeValue = 'x'.repeat(config.maxEntrySize + 100);
      await mainCache.set('large-key', largeValue);
      const result = await mainCache.get('large-key');
      expect(result).toBeNull();
    });
  });

  describe('Cache Persistence', () => {
    it('should recover from corrupted cache file', async () => {
      // Simulate corrupted cache file by returning invalid JSON
      mockFs.promises.readFile.mockResolvedValueOnce('invalid json');
      
      await mainCache.cleanup();
      await mainCache._reset();
      await mainCache.getCacheInstance();
      
      const result = await mainCache.get('test-key');
      expect(result).toBeNull();
    });

    it('should write to cache file when modified', async () => {
      await mainCache.set('test-key', 'test-value');
      await mainCache.cleanup();
      expect(mockFs.promises.writeFile).toHaveBeenCalled();
    });
  });

  describe('Cache Initialization', () => {
    it('should not create cache directory until first cache operation', async () => {
      expect(mockFs.promises.mkdir).not.toHaveBeenCalled();
      
      // Just importing should not trigger directory creation
      await import('../src/mainCache.mjs');
      expect(mockFs.promises.mkdir).not.toHaveBeenCalled();
      
      // But setting a value should
      await mainCache.set('test-key', 'test-value');
      expect(mockFs.promises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('.cache'),
        expect.objectContaining({ recursive: true })
      );
    });

    it('should not persist cache if no modifications made', async () => {
      // Reset write tracking
      mockFs.promises.writeFile.mockClear();
      mockFs.promises.rename.mockClear();
      
      // Just reading should not trigger persistence
      await mainCache.get('non-existent');
      
      // No write operations should have occurred
      expect(mockFs.promises.writeFile).not.toHaveBeenCalled();
      expect(mockFs.promises.rename).not.toHaveBeenCalled();
    });
  });

  describe('Cache Persistence Behavior', () => {
    it('should only persist when cache is modified', async () => {
      // Reading shouldn't trigger persistence
      await mainCache.get('test-key');
      expect(mockFs.promises.writeFile).not.toHaveBeenCalled();
      
      // Writing should mark cache for persistence
      await mainCache.set('test-key', 'test-value');
      
      // Force persistence
      await mainCache.cleanup();
      
      // Should have written to temp file and renamed
      expect(mockFs.promises.writeFile).toHaveBeenCalledTimes(1);
      expect(mockFs.promises.rename).toHaveBeenCalledTimes(1);
    });

    it('should handle persistence errors gracefully', async () => {
      // Setup mock to fail writing
      mockFs.promises.writeFile.mockRejectedValueOnce(new Error('Write failed'));
      
      // Should not throw when persistence fails
      await mainCache.set('test-key', 'test-value');
      await expect(mainCache.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Cache Cleanup', () => {
    it('should properly clean up resources', async () => {
      // Reset mocks
      mockFs.promises.writeFile.mockClear();
      mockFs.promises.rename.mockClear();
      
      // Setup intervals and ensure cache is modified
      await mainCache.set('test-key', 'test-value');
      
      // Force persistence
      await mainCache.cleanup();
      
      // Should have attempted final persistence
      expect(mockFs.promises.writeFile).toHaveBeenCalled();
      expect(mockFs.promises.rename).toHaveBeenCalled();
    });
  });

  describe('Cache Configuration', () => {
    beforeEach(async () => {
      await mainCache._reset();
      jest.clearAllMocks();
    });

    it('should apply cache settings from configure()', async () => {
      configure({
        cache: {
          maxSize: 1000000,      // 1MB
          maxEntries: 50,
          ttl: 60 * 60 * 1000,   // 1 hour
          maxEntrySize: 5000,
          persistInterval: 30000  // 30 seconds
        }
      });

      // Set a value to initialize cache with new settings
      await mainCache.set('test-key', 'test-value');

      // Get cache instance and verify settings
      const stats = await mainCache.getStats();
      expect(stats).toMatchObject({
        maxSize: 1000000,
        maxEntries: 50
      });

      // Get current config values
      const currentConfig = mainCache.getConfig();
      expect(currentConfig).toMatchObject({
        maxSize: 1000000,
        maxEntries: 50,
        ttl: 60 * 60 * 1000,
        maxEntrySize: 5000,
        persistInterval: 30000
      });
    });

    it('should merge partial cache configurations', async () => {
      const originalConfig = mainCache.getConfig();
      
      configure({
        cache: {
          maxEntries: 75,
          ttl: 120000
        }
      });

      // Verify partial update
      const currentConfig = mainCache.getConfig();
      expect(currentConfig).toMatchObject({
        maxSize: originalConfig.maxSize,  // Should retain original
        maxEntries: 75,                  // Should update
        ttl: 120000                      // Should update
      });
    });

    it('should respect configured maxEntrySize', async () => {
      configure({
        cache: {
          maxEntrySize: 10  // Very small for testing
        }
      });

      // Try to cache something larger than maxEntrySize
      const largeValue = 'x'.repeat(20);
      await mainCache.set('large-key', largeValue);

      // Should not be cached due to size
      const result = await mainCache.get('large-key');
      expect(result).toBeNull();
    });

    it('should respect configured TTL', async () => {
      configure({
        cache: {
          ttl: 50  // 50ms TTL for testing
        }
      });

      await mainCache.set('ttl-test', 'value');
      
      // Should exist immediately
      let result = await mainCache.get('ttl-test');
      expect(result?.value).toBe('value');
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Should be expired now
      result = await mainCache.get('ttl-test');
      expect(result).toBeNull();
    });

    describe('Config Validation', () => {
      it('should reject invalid config values', async () => {
        expect(() => configure({
          cache: { maxSize: -1 }
        })).toThrow('maxSize must be a positive number');

        expect(() => configure({
          cache: { maxEntries: 'invalid' }
        })).toThrow('maxEntries must be a positive number');
      });
    });

    describe('Cache Reinitialization', () => {
      beforeEach(async () => {
        await mainCache._reset();
        mainCache.resetConfig();
      });

      it('should reinitialize cache with new config', async () => {
        // Set initial values with default config
        await mainCache.set('key1', 'value1');
        await mainCache.set('key2', 'value2');

        // Verify initial state
        expect((await mainCache.get('key1'))?.value).toBe('value1');
        expect((await mainCache.get('key2'))?.value).toBe('value2');

        // Change config to smaller size and force reinitialization
        configure({
          cache: {
            maxEntries: 1  // Only allow 1 entry
          }
        });

        // Force cache reinitialization
        await mainCache._reset();
        
        // Set values again after reinitialization
        await mainCache.set('key1', 'value1');
        await mainCache.set('key2', 'value2');
        
        // Only the most recent entry should remain
        const key1Result = await mainCache.get('key1');
        const key2Result = await mainCache.get('key2');
        expect(key1Result).toBeNull();
        expect(key2Result?.value).toBe('value2');
      });

      it('should apply new size limits only to future entries', async () => {
        await mainCache.getCacheInstance();

        // Set initial entry with larger size
        const largeValue = 'x'.repeat(100);
        const result = await mainCache.set('existing', largeValue);
        
        expect(result).not.toBeNull();
        const initialGet = await mainCache.get('existing');
        expect(initialGet?.value).toBe(largeValue);

        // Change to more restrictive size limit
        configure({
          cache: {
            maxEntrySize: 75  // Only allow new entries up to 75 bytes
          }
        });

        // Existing large entry should still be accessible
        const existingEntry = await mainCache.get('existing');
        expect(existingEntry?.value).toBe(largeValue);

        // But new large entries should be rejected
        const newLargeResult = await mainCache.set('new-large', 'x'.repeat(100));
        expect(newLargeResult).toBeNull();
        expect(await mainCache.get('new-large')).toBeNull();

        // While new entries within limit should work
        const smallValue = 'x'.repeat(50);
        await mainCache.set('new-small', smallValue);
        const newSmallEntry = await mainCache.get('new-small');
        expect(newSmallEntry?.value).toBe(smallValue);
      });
    });

    describe('TTL Handling', () => {
      it('should handle undefined TTL correctly', async () => {
        configure({
          cache: {
            ttl: undefined  // No default TTL
          }
        });

        await mainCache.set('no-ttl', 'value');
        const entry = await mainCache.get('no-ttl');
        expect(entry?.expires).toBeUndefined();
      });

      it('should use configured default TTL when no TTL provided', async () => {
        const defaultTTL = 1000;
        configure({
          cache: {
            ttl: defaultTTL
          }
        });

        const now = Date.now();
        await mainCache.set('default-ttl', 'value');
        const entry = await mainCache.get('default-ttl');
        
        expect(entry?.expires).toBeGreaterThan(now + defaultTTL - 100);
        expect(entry?.expires).toBeLessThan(now + defaultTTL + 100);
      });
    });
  });
});