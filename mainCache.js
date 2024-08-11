const { Level } = require('level');
const { LRUCache: LRU } = require('lru-cache');
const Logger = require('./logger.js');
const fs = require('fs');
const path = require('path');


const CACHES_DIR = './_caches';

try {
  fs.statSync(CACHES_DIR);
} catch(e) {
  fs.mkdirSync(CACHES_DIR);
}

const logger = new Logger('mainCache');

// Function to delete old cache directories
async function deleteOldCacheDirs(basePath) {
  try {
    const files = await fs.promises.readdir(basePath);
    for (const file of files) {
      if (!/^db_\d+/.test(file)) continue;
      const filePath = path.join(basePath, file);
      if (fs.statSync(filePath).isDirectory()) {
        await fs.promises.rm(filePath, { recursive: true });
        logger.dev('Deleted old cache directory', filePath);
      }
    }
  } catch (e) {
    logger.error('Failed to delete old cache directories', e);
  }
}

// Function to initialize database and cache
async function initializeCache() {

  await deleteOldCacheDirs('./_caches');
  const cacheDir = path.join(CACHES_DIR, `./db_${+new Date}`);
  const db = new Level(cacheDir, { valueEncoding: 'json' });

  const cache = new LRU({
    maxSize: 100000, // 100 kb, for now...
    sizeCalculation: val => val?.value?.length || 1,
    dispose: async function (key, n) {
      try {
        await db.del(key);
        logger.dev('Disposed old cache entry', key);
      } catch (e) {
        logger.error('Dispose failed', key, e);
      }
    }
  });

  try {
    await db.open();
    logger.dev('Database is open and ready for operations');
  } catch (err) {
    logger.error('Failed to open database', err);
  }

  return { db, cache };
}

let db, cache;
const cachePromise = initializeCache().then(result => {
  db = result.db;
  cache = result.cache;
}).catch(e => {
  logger.error('Failed to initialize cache', e);
});

async function get(key) {
  await cachePromise;
  logger.dev('Getting value from cache', key);
  let data = cache && cache.get(key);
  if (!data) {
    try {
      data = await db.get(key);
      logger.dev('Retrieved value from LevelDB', key, data?.length);
      cache.set(key, data); // Repopulate LRU cache
    } catch (e) {
      // if something can't be found, it's okay to just passively fail
      // (because this is just a cache!)
      // logger.error('Failed to retrieve from LevelDB', key, e);
      data = null;
    }
  }
  return data;
}

async function del(key) {
  await cachePromise;
  if (!value) {
    logger.error('Attempted to delete a cache entry without value', key);
    return;
  }
  try {
    await db.del(key);
    cache.delete(key);
    logger.dev('Successfully deleted cache and db', key);
  } catch (e) {
    logger.error('Failed to delete cache and db', key, e);
    if (e.code === 'LEVEL_DATABASE_NOT_OPEN') {
      logger.dev('Database not open, trying to reopen', key);
      await db.open();
      cache.delete(key);
      logger.dev('Successfully deleted cache and db', key);
    }
  }
}

async function set(key, value) {
  await cachePromise;
  if (!value) {
    logger.error('Attempted to set a cache entry without value', key);
    return;
  }
  try {
    logger.dev('Committing to cache', key, 'json of length:', JSON.stringify(value).length);
    const data = { value: value, time: Date.now() };
    cache.set(key, data);
    await db.put(key, data);
    logger.dev('Successfully set cache and db', key);
  } catch (e) {
    logger.error('Failed to set cache and db', key, e);
    if (e.code === 'LEVEL_DATABASE_NOT_OPEN') {
      logger.dev('Database not open, trying to reopen', key);
      await db.open();
      await db.put(key, data);
      logger.dev('Successfully set cache and db after reopen', key);
    }
  }
}

async function purgeOldEntries() {
  logger.dev('Purging old entries');
  const OLD_TIME_PERIOD = 1000 * 60 * 60 * 24 * 5; // 5 days
  try {
    for await (const [key, value] of db.iterator()) {
      if (Date.now() - value.time > OLD_TIME_PERIOD) {
        await db.del(key);
        logger.dev('Purged old entry', key);
      }
    }
  } catch (err) {
    logger.error('Failed to purge old entries', err);
  }
}

setInterval(purgeOldEntries, 1000 * 60 * 15); // Every 15 minutes

module.exports = { get, set, del };
