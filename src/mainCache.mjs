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

// Add stats object early
const stats = {
  hits: 0,
  misses: 0
};

let cache = null;
let cachePromise = null;
let cacheModified = false;
let persistInterval = null;
let purgeInterval = null;
let memoryCheckInterval = null;
let memoryPressure = false;

function configure(options = {}) {
  Object.assign(DEFAULT_CONFIG, options);
}

async function ensureCacheDir() {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  } catch (err) {
    logger.error('Failed to create cache directory:', err);
  }
}

async function loadPersistedCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    logger.dev('No existing cache file found or error reading it:', err.code);
    return {};
  }
}

async function persistCache(cache) {
  if (!cache || !cacheModified) {
    logger.dev('Skip persisting cache - no changes');
    return;
  }
  
  try {
    await ensureCacheDir(); // Ensure directory exists before writing
    const entries = Array.from(cache.entries())
      .filter(([_, value]) => value && (!value.expires || value.expires > Date.now()));
      
    const serialized = JSON.stringify(Object.fromEntries(entries));
    
    // Write to temporary file first
    const tempFile = `${CACHE_FILE}.tmp`;
    await fs.writeFile(tempFile, serialized);
    
    // Atomically rename temp file to actual cache file
    await fs.rename(tempFile, CACHE_FILE);
    
    cacheModified = false;
    logger.dev('Cache persisted to disk');
  } catch (err) {
    logger.error('Failed to persist cache:', err);
  }
}

async function initializeCache() {
  if (!cache) {
    await ensureCacheDir();
    const persistedData = await loadPersistedCache();
    cache = new LRUCache({
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

    // Set up intervals
    if (!persistInterval) {
      persistInterval = setInterval(async () => {
        await persistCache(cache);
      }, DEFAULT_CONFIG.persistInterval);
    }

    if (!purgeInterval) {
      purgeInterval = setInterval(purgeOldEntries, 1000 * 60 * 15);
    }

    if (!memoryCheckInterval) {
      memoryCheckInterval = setInterval(checkMemoryPressure, 60000);
    }
  }
  return cache;
}

async function getCacheInstance() {
  if (!cachePromise) {
    cachePromise = initializeCache();
  }
  return cachePromise;
}

// Lock mechanism for concurrent operations
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

async function get(key) {
  const cacheInstance = await getCacheInstance();
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

async function set(key, value, ttl = DEFAULT_CONFIG.ttl) {
  await acquireLock(key);
  try {
    const cacheInstance = await getCacheInstance();
    if (value === null || value === undefined) {
      logger.error('Attempted to set a cache entry without value', key);
      return null;
    }

    try {
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
      cacheModified = true;
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

async function del(key) {
  const cacheInstance = await getCacheInstance();
  if (!cacheInstance.has(key)) {
    logger.error('Attempted to delete a non-existent cache entry', key);
    return;
  }
  try {
    cacheInstance.delete(key);
    cacheModified = true;
    logger.dev('Successfully deleted cache entry', key);
  } catch (e) {
    logger.error('Failed to delete cache entry', key, e);
  }
}

function purgeOldEntries() {
  if (!cache) return;
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

async function checkMemoryPressure() {
  const used = process.memoryUsage();
  const heapUsedPercent = (used.heapUsed / used.heapTotal) * 100;
  
  if (heapUsedPercent > 85) {
    memoryPressure = true;
    await clearLeastRecentlyUsed(20);
  } else {
    memoryPressure = false;
  }
}

async function clearLeastRecentlyUsed(percentage) {
  const cacheInstance = await getCacheInstance();
  const entriesToRemove = Math.floor(cacheInstance.size * (percentage / 100));
  
  const entries = Array.from(cacheInstance.entries())
    .sort((a, b) => a[1].time - b[1].time)
    .slice(0, entriesToRemove);
    
  for (const [key] of entries) {
    cacheInstance.delete(key);
  }
}

async function _reset() {
  if (persistInterval) {
    clearInterval(persistInterval);
    persistInterval = null;
  }
  if (purgeInterval) {
    clearInterval(purgeInterval);
    purgeInterval = null;
  }
  if (memoryCheckInterval) {
    clearInterval(memoryCheckInterval);
    memoryCheckInterval = null;
  }
  cache = null;
  cachePromise = null;
  cacheModified = false;
}

async function cleanup() {
  try {
    if (cache && cacheModified) {
      await persistCache(cache);
    }
  } catch (err) {
    logger.error('Error during cleanup:', err);
  } finally {
    await _reset();
  }
}

async function getStats() {
  const cacheInstance = await getCacheInstance();
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

async function clearExpired() {
  const cacheInstance = await getCacheInstance();
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

export { 
  get, 
  set, 
  del, 
  stats,
  getStats,
  clearExpired,
  configure,
  cleanup,
  checkMemoryPressure,
  _reset,
};