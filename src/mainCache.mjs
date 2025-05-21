import { LRUCache } from 'lru-cache';
import { promises as fsPromises, path as fsPath } from './fs.mjs';

// Provides filesystem operations with error handling and logging
export const defaultFileOps = {
  promises: {
    mkdir: async (dirPath, options) => {
      try {
        await fsPromises.mkdir(dirPath, options);
        return true;
      } catch (err) {
        logger.error('Failed to create directory:', err);
        return false;
      }
    },
    writeFile: async (filePath, data) => {
      try {
        await fsPromises.writeFile(filePath, data);
        return true;
      } catch (err) {
        logger.error('Failed to write file:', err);
        return false;
      }
    },
    readFile: async (filePath) => {
      try {
        return await fsPromises.readFile(filePath, 'utf8');
      } catch (err) {
        logger.dev('Failed to read file:', err);
        return null;
      }
    },
    rename: async (oldPath, newPath) => {
      try {
        await fsPromises.rename(oldPath, newPath);
        return true;
      } catch (err) {
        logger.error('Failed to rename file:', err);
        return false;
      }
    }
  },
  path: fsPath
};

// Use default implementation initially
let fileOps = defaultFileOps;

// Export method to override fileOps (for testing)
export function setFileOps(mockFileOps) {
  fileOps = mockFileOps;
  // Update CACHE_FILE when fileOps changes
  updateCachePath(CACHE_DIR, CACHE_FILENAME);
}

// Use fileOps.path instead of direct path import
let CACHE_DIR = fileOps.path.join(process.cwd(), '.cache');
let CACHE_FILENAME = 'llm-cache.json';
let CACHE_FILE = fileOps.path.join(CACHE_DIR, CACHE_FILENAME);

const getDefaultConfig = () => ({
  maxSize: 5000000,
  maxEntries: 100000,
  persistInterval: 5 * 60 * 1000,
  ttl: 5 * 24 * 60 * 60 * 1000,
  maxEntrySize: 10000,
  cacheDir: CACHE_DIR,
  cacheFilename: CACHE_FILENAME
});

let CONFIG = getDefaultConfig();

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
let _logger = null;

const logger = {
  error: (...args) => {
    if (_logger) _logger.error(...args);
  },
  dev: (...args) => {
    if (_logger) _logger.dev(...args);
  }
};

export function setLogger(logger) {
  _logger = logger;
}

// Add internal file operation methods that can be mocked in tests
export const fileOperations = {
  async ensureDir(dirPath) {
    try {
      await fileOps.promises.mkdir(dirPath, { recursive: true });
      return true;
    } catch (err) {
      logger.error('Failed to create directory:', err);
      return false;
    }
  },

  async writeFile(filePath, data) {
    try {
      await fileOps.promises.writeFile(filePath, data);
      return true;
    } catch (err) {
      logger.error('Failed to write file:', err);
      return false;
    }
  },

  async readFile(filePath) {
    try {
      return await fileOps.promises.readFile(filePath);
    } catch (err) {
      logger.dev('Failed to read file:', err);
      return null;
    }
  },

  async rename(oldPath, newPath) {
    try {
      await fileOps.promises.rename(oldPath, newPath);
      return true;
    } catch (err) {
      logger.error('Failed to rename file:', err);
      return false;
    }
  }
};

// Add validation helpers
function validatePositiveNumber(value, name) {
  if (value !== undefined && (typeof value !== 'number' || value <= 0)) {
    throw new Error(`${name} must be a positive number`);
  }
}

function validateCacheConfig(config) {
  validatePositiveNumber(config.maxSize, 'maxSize');
  validatePositiveNumber(config.maxEntries, 'maxEntries');
  validatePositiveNumber(config.maxEntrySize, 'maxEntrySize');
  validatePositiveNumber(config.ttl, 'ttl');
  validatePositiveNumber(config.persistInterval, 'persistInterval');
}

// Add helper for TTL calculation
function calculateExpiry(ttl) {
  if (!ttl && !CONFIG.ttl) return undefined;
  return Date.now() + (ttl || CONFIG.ttl);
}

// Add helper for size calculation
function calculateSize(value) {
  return JSON.stringify(value).length;
}

// Add reinitialize function
async function reinitializeCache() {
  if (cache) {
    const entries = Array.from(cache.entries());
    
    const newCache = new LRUCache({
      max: CONFIG.maxEntries,
      maxSize: CONFIG.maxSize,
      sizeCalculation: (entry) => entry.size,
      dispose: function (value, key) {
        logger.dev('Disposed old cache entry', key);
      }
    });

    // Sort entries by time (most recent first)
    entries.sort((a, b) => b[1].time - a[1].time);

    // Only restore up to max entries, filtering expired
    const validEntries = entries
      .filter(([_, value]) => !value.expires || value.expires > Date.now())
      .slice(0, CONFIG.maxEntries);

    for (const [key, value] of validEntries) {
      newCache.set(key, value);
    }
    
    cache = newCache;
    cacheModified = true;
  }
}

// Add function to update cache file path
function updateCachePath(dir, filename) {
  if (dir) CACHE_DIR = dir;
  if (filename) CACHE_FILENAME = filename;
  CACHE_FILE = fileOps.path.join(CACHE_DIR, CACHE_FILENAME);
}

// Update configure function to handle new options
function configure(options = {}) {
  if (options.cache) {
    validateCacheConfig(options.cache);
    CONFIG = { ...CONFIG, ...options.cache };
    
    // Update cache file path if specified
    if (options.cache.cacheDir || options.cache.cacheFilename) {
      updateCachePath(options.cache.cacheDir, options.cache.cacheFilename);
    }
    
    // Force cache reinitialization
    if (cache) {
      reinitializeCache();
    }
  }
}

async function ensureCacheDir() {
  return fileOperations.ensureDir(fileOps.path.dirname(CACHE_FILE));
}

async function loadPersistedCache() {
  const data = await fileOperations.readFile(CACHE_FILE);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch (err) {
    logger.dev('Failed to parse cache file:', err);
    return {};
  }
}

async function persistCache(cache) {
  if (!cache || !cacheModified) {
    logger.dev('Skip persisting cache - no changes');
    return;
  }
  
  try {
    const entries = Array.from(cache.entries())
      .filter(([_, value]) => value && (!value.expires || value.expires > Date.now()));
      
    const serialized = JSON.stringify(Object.fromEntries(entries));
    
    const tempFile = `${CACHE_FILE}.tmp`;
    await fileOperations.writeFile(tempFile, serialized);
    await fileOperations.rename(tempFile, CACHE_FILE);
    
    cacheModified = false;
    logger.dev('Cache persisted to disk');
  } catch (err) {
    logger.error('Failed to persist cache:', err);
  }
}

async function initializeCache() {
  if (!cache) {
    // Always ensure cache directory exists first
    const dirCreated = await ensureCacheDir();
    if (!dirCreated) {
      logger.error('Failed to create cache directory');
      return null;
    }
    
    const persistedData = await loadPersistedCache();
    const cacheOptions = {
      // Ensure we always have at least one limiting option
      max: CONFIG.maxEntries || 100000,  // Use default if not set
      ttl: CONFIG.ttl,  // Include TTL from config
      dispose: function (value, key) {
        logger.dev('Disposed old cache entry', key);
      }
    };

    // Only add size-related options if maxSize is set
    if (CONFIG.maxSize) {
      cacheOptions.maxSize = CONFIG.maxSize;
      cacheOptions.sizeCalculation = (entry) => entry.size;
    }

    cache = new LRUCache({
      ...cacheOptions
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
      }, CONFIG.persistInterval);
    }

    // Mark as modified to ensure first persistence
    cacheModified = true;
  }
  return cache;
}

export async function getCacheInstance() {
  if (!cachePromise) {
    cachePromise = initializeCache();
  }
  return cachePromise;
}

async function get(key) {

  const cacheInstance = await getCacheInstance();
  if (!cacheInstance) return null;

  const entry = cacheInstance.get(key);

  if (!entry) {
    stats.misses++;
    return null;
  }

  // Check expiration
  if (entry.expires && entry.expires < Date.now()) {
    cacheInstance.delete(key);
    stats.misses++;
    return null;
  }

  stats.hits++;
  return entry;
}

// Update set function to use calculateExpiry
async function set(key, value, ttl) {
  const cacheInstance = await getCacheInstance();
  if (!cacheInstance) return null;

  if (value === undefined || value === null) {
    logger.dev('Skipping null/undefined value');
    return null;
  }

  try {
    const size = calculateSize(value);
    
    // Check size limit before storing
    if (size > CONFIG.maxEntrySize) {
      logger.dev(`Value exceeds maxEntrySize (${size} > ${CONFIG.maxEntrySize})`);
      return null;
    }

    const entry = {
      value,
      time: Date.now(),
      size,
      expires: calculateExpiry(ttl)
    };

    cacheInstance.set(key, entry);
    cacheModified = true;
    return entry;
  } catch (e) {
    logger.error('Failed to set cache entry', key, e);
    return null;
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
    if (cache) {
      cacheModified = true;  // Force final persistence
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
    maxSize: CONFIG.maxSize,
    maxEntries: CONFIG.maxEntries
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

// Add function to force cache modification (for testing)
export function _setModified(value) {
  cacheModified = value;
}

export function getConfig() {
  return { ...CONFIG };  // Return a copy to prevent mutation
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
  _reset
};

export function resetConfig() {
  CONFIG = getDefaultConfig();
  // Recalculate CACHE_DIR and CACHE_FILE
  CACHE_DIR = fileOps.path.join(process.cwd(), '.cache');
  CACHE_FILENAME = 'llm-cache.json';
  CACHE_FILE = fileOps.path.join(CACHE_DIR, CACHE_FILENAME);
  cacheModified = true;
}