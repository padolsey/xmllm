import { LRUCache } from 'lru-cache';
import Logger from './Logger.mjs';
import * as fs from 'fs/promises';
import path from 'path';

const logger = new Logger('mainCache');
const CACHE_FILE = path.join(
    process.cwd(),
    '.cache',
    'llm-cache.json'
);

export const DEFAULT_CONFIG = {
    maxSize: 5000000,
    maxEntries: 100000,
    persistInterval: 5 * 60 * 1000,
    ttl: 5 * 24 * 60 * 60 * 1000,
    maxEntrySize: 3000
};

function configure(options = {}) {
    Object.assign(DEFAULT_CONFIG, options);
}

// Ensure cache directory exists
async function ensureCacheDir() {
    try {
        await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    } catch (err) {
        logger.error('Failed to create cache directory:', err);
    }
}

// Load cached data from disk
async function loadPersistedCache() {
    try {
        await ensureCacheDir();
        const data = await fs.readFile(CACHE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        logger.dev('No existing cache file found or error reading it:', err.code);
        return {};
    }
}

// Add a flag to track if cache has changed
let cacheModified = false;

// Save cache to disk
async function persistCache(cache) {
    try {
        if (!cache || !cacheModified) {
            logger.dev('Skip persisting cache - no changes');
            return;
        }
        
        const entries = Array.from(cache.entries())
            .filter(([_, value]) => value && (!value.expires || value.expires > Date.now()));
            
        const serialized = JSON.stringify(Object.fromEntries(entries));
        
        // Write to temporary file first
        const tempFile = `${CACHE_FILE}.tmp`;
        await fs.writeFile(tempFile, serialized);
        
        // Atomically rename temp file to actual cache file
        await fs.rename(tempFile, CACHE_FILE);
        
        cacheModified = false;  // Reset the modified flag
        logger.dev('Cache persisted to disk');
    } catch (err) {
        logger.error('Failed to persist cache:', err);
    }
}

// Initialize cache with persisted data
async function initializeCache() {
    const persistedData = await loadPersistedCache();
    const cache = new LRUCache({
        max: DEFAULT_CONFIG.maxEntries,
        maxSize: DEFAULT_CONFIG.maxSize,
        sizeCalculation: (value, key) => JSON.stringify(value).length,
        dispose: function (value, key) {
            logger.dev('Disposed old cache entry', key);
        }
    });

    // Restore persisted data
    for (const [key, value] of Object.entries(persistedData)) {
        if (!value.expires || value.expires > Date.now()) {
            cache.set(key, value);
        }
    }

    return cache;
}

let persistInterval = null;
let purgeInterval = null;
let cache = null;

// Create a single promise for cache initialization
const cachePromise = (async () => {
    const c = await initializeCache();
    cache = c;
    logger.log('Cache initialized');

    // Only set up intervals after cache is initialized
    persistInterval = setInterval(async () => {
        await persistCache(cache);
    }, DEFAULT_CONFIG.persistInterval);

    purgeInterval = setInterval(purgeOldEntries, 1000 * 60 * 15);

    return c;
})();

const stats = {
    hits: 0,
    misses: 0
};

// Persist cache on process exit
process.on('SIGINT', async () => {
    logger.log('Persisting cache before exit...');
    if (cache) {
        await persistCache(cache);
    }
    process.exit();
});

async function get(key) {
    const cacheInstance = await cachePromise;
    if (!cacheInstance) throw new Error('Cache failed to initialize');
    logger.dev('Getting value from cache', key);
    const value = cacheInstance.get(key);
    if (!value) {
        stats.misses++;
        return null;
    }
    if (value.expires && value.expires < Date.now()) {
        cacheInstance.delete(key);
        stats.misses++;
        return null;
    }
    stats.hits++;
    return value;
}

// Add a lock mechanism for concurrent operations
const locks = new Map();

async function acquireLock(key) {
    while (locks.has(key)) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    locks.set(key, true);
}

async function releaseLock(key) {
    locks.delete(key);
}

// Update the set function to mark cache as modified
async function set(key, value, ttl = DEFAULT_CONFIG.ttl) {
    await acquireLock(key);
    try {
        const cacheInstance = await cachePromise;
        if (!cacheInstance) {
            logger.error('Cache not yet initialized');
            return null;
        }
        if (value === null || value === undefined) {
            logger.error('Attempted to set a cache entry without value', key);
            return null;
        }

        try {
            // Check entry size
            const valueSize = JSON.stringify(value).length;
            if (valueSize > DEFAULT_CONFIG.maxEntrySize) {
                logger.warn(`Cache entry too large (${valueSize} chars), skipping cache`, key);
                return null;
            }

            logger.dev('Committing to cache', key, 'json of length:', valueSize);
            const data = { 
                value: value, 
                time: Date.now(),
                expires: Date.now() + ttl,
                size: valueSize
            };
            cacheInstance.set(key, data);
            cacheModified = true;  // Mark cache as modified
            logger.dev('Successfully set cache', key);
            return data;
        } catch (e) {
            logger.error('Failed to set cache', key, e);
            return null;
        }
    } finally {
        releaseLock(key);
    }
}

// Also update del and invalidateByPattern to mark cache as modified
async function del(key) {
    const cacheInstance = await cachePromise;
    if (!cacheInstance) {
        logger.error('Cache not yet initialized');
        return;
    }
    if (!cacheInstance.has(key)) {
        logger.error('Attempted to delete a non-existent cache entry', key);
        return;
    }
    try {
        cacheInstance.delete(key);
        cacheModified = true;  // Mark cache as modified
        logger.dev('Successfully deleted cache entry', key);
    } catch (e) {
        logger.error('Failed to delete cache entry', key, e);
    }
}

function purgeOldEntries() {
    const OLD_TIME_PERIOD = 1000 * 60 * 60 * 24 * 5; // 5 days
    try {
        for (const [key, value] of cache.entries()) {
            if (Date.now() - value.time > OLD_TIME_PERIOD) {
                cache.delete(key);
                logger.dev('Purged old entry', key);
            }
        }
    } catch (err) {
        logger.error('Failed to purge old entries', err);
    }
}

async function invalidateByPattern(pattern) {
    let found = false;
    for (const [key] of cache.entries()) {
        if (key.includes(pattern)) {
            cache.delete(key);
            found = true;
        }
    }
    if (found) {
        cacheModified = true;  // Mark cache as modified only if entries were deleted
    }
}

async function warmup(entries) {
    const cacheInstance = await cachePromise;
    for (const [key, value] of entries) {
        await set(key, value);
    }
}

// Add cleanup function for tests
async function cleanup() {
    clearInterval(persistInterval);
    clearInterval(purgeInterval);
    try {
        if (cache) {
            await persistCache(cache);
        }
    } catch (err) {
        logger.error('Error during cleanup:', err);
    }
}

// Add cache info/stats function
async function getStats() {
    const cacheInstance = await cachePromise;
    if (!cacheInstance) return null;

    const entries = Array.from(cacheInstance.entries());
    const totalSize = entries.reduce((acc, [_, value]) => acc + (value.size || 0), 0);
    const largestEntry = entries.reduce((max, [key, value]) => 
        (value.size || 0) > (max.size || 0) ? { key, size: value.size } : max
    , { size: 0 });

    return {
        ...stats,
        entryCount: cacheInstance.size,
        totalSize,
        largestEntry,
        maxSize: DEFAULT_CONFIG.maxSize,
        maxEntries: DEFAULT_CONFIG.maxEntries
    };
}

// Add method to clear expired entries immediately
async function clearExpired() {
    const cacheInstance = await cachePromise;
    if (!cacheInstance) return;

    const now = Date.now();
    let cleared = 0;
    
    for (const [key, value] of cacheInstance.entries()) {
        if (value.expires && value.expires < now) {
            cacheInstance.delete(key);
            cleared++;
        }
    }
    
    return cleared;
}

// Add memory pressure monitoring
let memoryPressure = false;

async function checkMemoryPressure() {
    const used = process.memoryUsage();
    const heapUsedPercent = (used.heapUsed / used.heapTotal) * 100;
    
    if (heapUsedPercent > 85) {
        memoryPressure = true;
        await clearLeastRecentlyUsed(20); // Clear 20% of entries
    } else {
        memoryPressure = false;
    }
}

async function clearLeastRecentlyUsed(percentage) {
    const cacheInstance = await cachePromise;
    const entriesToRemove = Math.floor(cacheInstance.size * (percentage / 100));
    
    const entries = Array.from(cacheInstance.entries())
        .sort((a, b) => a[1].time - b[1].time)
        .slice(0, entriesToRemove);
        
    for (const [key] of entries) {
        cacheInstance.delete(key);
    }
}

// Add memory check interval
setInterval(checkMemoryPressure, 60000); // Check every minute

export { 
    get, 
    set, 
    del, 
    stats,
    getStats,
    clearExpired,
    configure,
    cleanup,
};