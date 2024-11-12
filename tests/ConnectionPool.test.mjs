import { jest } from '@jest/globals';
import ConnectionPool from '../src/ConnectionPool.mjs';
import { ConnectionTimeoutError } from '../src/errors/ConnectionErrors.mjs';

describe('ConnectionPool', () => {
  let pool;

  beforeEach(() => {
    jest.useFakeTimers();
    pool = new ConnectionPool({
      maxConnections: 2,
      timeout: 100,
      providerLimits: {
        'openai': 2,
        'claude': 1
      }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Connection Acquisition', () => {
    test('successfully acquires connection when under limit', async () => {
      const connectionId = await pool.acquire('openai');
      expect(connectionId).toMatch(/^conn_\d+_[a-z0-9]+$/);
      expect(pool.getStats().totalActive).toBe(1);
    });

    test('respects provider-specific limits', async () => {
      const realDateNow = Date.now;
      Date.now = jest.fn(() => 1234567890);

      try {
        const conn1 = await pool.acquire('claude');
        const connPromise = pool.acquire('claude');
        
        jest.advanceTimersByTime(pool.timeout);
        
        await expect(connPromise).rejects.toThrow(ConnectionTimeoutError);
      } finally {
        Date.now = realDateNow;
      }
    });

    test('queues requests when at capacity', async () => {
      const conn1 = await pool.acquire('openai');
      const conn2 = await pool.acquire('openai');
      
      const connPromise = pool.acquire('openai');
      
      pool.release(conn1);
      
      await Promise.resolve();
      
      const conn3 = await connPromise;
      expect(conn3).toBeDefined();
    });

    test('handles timeout for queued requests', async () => {
      await pool.acquire('openai');
      await pool.acquire('openai');
      
      const connPromise = pool.acquire('openai');
      
      jest.advanceTimersByTime(pool.timeout);
      
      await expect(connPromise).rejects.toThrow(ConnectionTimeoutError);
    });
  });

  describe('Connection Release', () => {
    test('successfully releases connection', async () => {
      const connectionId = await pool.acquire('openai');
      pool.release(connectionId);
      expect(pool.getStats().totalActive).toBe(0);
    });

    test('handles release of non-existent connection', () => {
      expect(() => pool.release('fake-id')).not.toThrow();
    });

    test('processes waiting queue on release', async () => {
      const conn1 = await pool.acquire('openai');
      await pool.acquire('openai');
      
      const queuedPromise = pool.acquire('openai');
      
      pool.release(conn1);
      
      await Promise.resolve();
      
      const conn3 = await queuedPromise;
      expect(conn3).toBeDefined();
    });
  });

  describe('Stats and Monitoring', () => {
    test('provides accurate stats', async () => {
      await pool.acquire('openai');
      await pool.acquire('claude');
      
      const stats = pool.getStats();
      expect(stats).toEqual({
        totalActive: 2,
        queueLength: 0,
        byProvider: {
          openai: {
            active: 1,
            limit: 2
          },
          claude: {
            active: 1,
            limit: 1
          }
        }
      });
    });

    test('tracks waiting queue length', async () => {
      await pool.acquire('openai');
      await pool.acquire('openai');
      
      const queuedPromise = pool.acquire('openai');
      
      expect(pool.getStats().queueLength).toBe(1);
    });
  });

  describe('Error Handling', () => {
    test('handles concurrent requests gracefully', async () => {
      const realDateNow = Date.now;
      Date.now = jest.fn(() => 1234567890);

      try {
        const promises = Array(5).fill().map(() => pool.acquire('openai'));
        
        jest.advanceTimersByTime(pool.timeout);
        
        const results = await Promise.allSettled(promises);
        
        const fulfilled = results.filter(r => r.status === 'fulfilled');
        const rejected = results.filter(r => r.status === 'rejected');
        
        expect(fulfilled.length).toBe(2);
        expect(rejected.length).toBe(3);
        expect(rejected[0].reason).toBeInstanceOf(ConnectionTimeoutError);
      } finally {
        Date.now = realDateNow;
      }
    });

    test('cleans up timeouts on release', async () => {
      const conn1 = await pool.acquire('openai');
      await pool.acquire('openai');
      
      const queuedPromise = pool.acquire('openai');
      
      pool.release(conn1);
      
      await Promise.resolve();
      
      const conn3 = await queuedPromise;
      expect(conn3).toBeDefined();
    });
  });
}); 