import { LRUCache } from 'lru-cache';
import Logger from './Logger.mjs';

const logger = new Logger('mainCache');

// Function to initialize cache
function initializeCache() {
  return new LRUCache({
    max: 100000, // Maximum number of items in cache
    maxSize: 5000000, // Maximum cache size (in arbitrary units, here bytes)
    sizeCalculation: (value, key) => JSON.stringify(value).length,
    dispose: function (value, key) {
      logger.dev('Disposed old cache entry', key);
    }
  });
}

let cache = initializeCache();

async function get(key) {
  logger.dev('Getting value from cache', key);
  return cache.get(key);
}

async function del(key) {
  if (!cache.has(key)) {
    logger.error('Attempted to delete a non-existent cache entry', key);
    return;
  }
  try {
    cache.delete(key);
    logger.dev('Successfully deleted cache entry', key);
  } catch (e) {
    logger.error('Failed to delete cache entry', key, e);
  }
}

async function set(key, value) {
  if (!value) {
    logger.error('Attempted to set a cache entry without value', key);
    return;
  }
  try {
    logger.dev('Committing to cache', key, 'json of length:', JSON.stringify(value).length);
    const data = { value: value, time: Date.now() };
    cache.set(key, data);
    logger.dev('Successfully set cache', key);
  } catch (e) {
    logger.error('Failed to set cache', key, e);
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

setInterval(purgeOldEntries, 1000 * 60 * 15); // Every 15 minutes

export { get, set, del };