import { jest } from '@jest/globals';

// Capture LRUCache constructor options so we can assert reinitializeCache()
// builds the cache with a `ttl` option (it previously dropped it). The
// reinitialized cache is not wired into the public get/set path, so this is
// the only way to observe the fix.
const constructorCalls = [];
class FakeLRU {
  constructor(opts) { this.opts = opts; this._map = new Map(); constructorCalls.push(opts); }
  set(k, v) { this._map.set(k, v); }
  get(k) { return this._map.get(k); }
  has(k) { return this._map.has(k); }
  delete(k) { return this._map.delete(k); }
  entries() { return this._map.entries(); }
  get size() { return this._map.size; }
}

jest.unstable_mockModule('lru-cache', () => ({ LRUCache: FakeLRU }));

const mainCache = await import('../src/mainCache.mjs');

const mockFs = {
  promises: {
    mkdir: jest.fn().mockResolvedValue(true),
    writeFile: jest.fn().mockResolvedValue(true),
    readFile: jest.fn().mockResolvedValue('{}'),
    rename: jest.fn().mockResolvedValue(true),
  },
  path: { join: (...a) => a.join('/'), dirname: (p) => p.split('/').slice(0, -1).join('/') },
};

describe('BUG-19: reinitializeCache constructs the LRU with native ttl (like initializeCache)', () => {
  beforeAll(() => { mainCache.setFileOps(mockFs); });
  beforeEach(async () => {
    await mainCache._reset();
    mainCache.resetConfig();
    constructorCalls.length = 0;
  });
  afterAll(async () => { await mainCache._reset(); });

  test('reinitialized cache is built with a ttl option', async () => {
    await mainCache.getCacheInstance();                 // initial construction
    constructorCalls.length = 0;                         // ignore the init call
    mainCache.configure({ cache: { maxEntries: 5 } });   // triggers reinitializeCache
    expect(constructorCalls.length).toBeGreaterThan(0);
    expect(constructorCalls.every(opts => 'ttl' in opts)).toBe(true);
  });
});
