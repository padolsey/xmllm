import { jest } from '@jest/globals';
import ResourceLimiter from '../src/ResourceLimiter.mjs';

describe('ResourceLimiter', () => {
  let limiter;
  let now;

  beforeEach(() => {
    now = 1000000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    test('initializes with no limits', () => {
      limiter = new ResourceLimiter();
      const status = limiter.checkLimits({ any: 1 });
      expect(status.allowed).toBe(true);
    });

    test('handles null/infinite limits', () => {
      limiter = new ResourceLimiter({
        rpm: null,
        tpm: { limit: Infinity, window: 60000 },
        rph: { limit: null, window: 3600000 }
      });
      
      const status = limiter.checkLimits({ 
        rpm: 1000,
        tpm: 1000000,
        rph: 999999
      });
      
      expect(status.allowed).toBe(true);
    });

    test('tracks multiple limit types', () => {
      limiter = new ResourceLimiter({
        requests: { limit: 10, window: 60000 },
        tokens: { limit: 1000, window: 60000 }
      });

      const status = limiter.checkLimits({
        requests: 1,
        tokens: 100
      });

      expect(status.allowed).toBe(true);
      expect(status.limits.requests.remaining).toBe(10);
      expect(status.limits.tokens.remaining).toBe(1000);
    });
  });

  describe('Resource Consumption', () => {
    beforeEach(() => {
      limiter = new ResourceLimiter({
        requests: { limit: 10, window: 60000 },
        tokens: { limit: 1000, window: 60000 }
      });
    });

    test('shows correct state through consumption lifecycle', () => {
      // Initial state
      const initial = limiter.checkLimits();
      expect(initial.limits.requests.remaining).toBe(10);
      
      // During consumption check
      const preCheck = limiter.checkLimits({ requests: 1 });
      expect(preCheck.limits.requests.remaining).toBe(10);
      expect(preCheck.allowed).toBe(true);
      
      // After consumption
      const consumed = limiter.consume({ requests: 1 });
      expect(consumed.limits.requests.remaining).toBe(9);
      
      // Verify final state
      const final = limiter.checkLimits();
      expect(final.limits.requests.remaining).toBe(9);
    });

    test('maintains correct remaining amounts through multiple consumptions', () => {
      // First consumption
      const first = limiter.consume({ requests: 2 });
      expect(first.limits.requests.remaining).toBe(8);
      
      // Second consumption
      const second = limiter.consume({ requests: 3 });
      expect(second.limits.requests.remaining).toBe(5);
      
      // Verify via check
      const check = limiter.checkLimits();
      expect(check.limits.requests.remaining).toBe(5);
    });

    test('successfully consumes resources', () => {
      const status = limiter.consume({
        requests: 1,
        tokens: 100
      });

      expect(status.allowed).toBe(true);
      expect(status.limits.requests.remaining).toBe(9);
      expect(status.limits.tokens.remaining).toBe(900);
    });

    test('prevents exceeding limits', () => {
      const status = limiter.consume({
        requests: 11,
        tokens: 100
      });

      expect(status.allowed).toBe(false);
      expect(status.limits.requests.allowed).toBe(false);
      expect(status.limits.tokens.allowed).toBe(true);
    });

    test('tracks remaining amounts correctly', () => {
      // Consume multiple times
      limiter.consume({ requests: 3, tokens: 300 });
      limiter.consume({ requests: 2, tokens: 200 });
      
      const status = limiter.checkLimits();
      expect(status.limits.requests.remaining).toBe(5);
      expect(status.limits.tokens.remaining).toBe(500);
    });
  });

  describe('Time Windows', () => {
    beforeEach(() => {
      limiter = new ResourceLimiter({
        rpm: { limit: 10, window: 60000 }, // 1 minute
        rph: { limit: 100, window: 3600000 } // 1 hour
      });
    });

    test('resets limits after window expires', () => {
      // Consume some resources
      limiter.consume({ rpm: 5, rph: 50 });
      
      // Advance time past RPM window but not RPH
      now += 61000;
      
      const status = limiter.checkLimits();
      expect(status.limits.rpm.remaining).toBe(10); // Reset
      expect(status.limits.rph.remaining).toBe(50); // Not reset
    });

    test('provides accurate reset timing', () => {
      const status = limiter.consume({ rpm: 1 });
      expect(status.limits.rpm.resetInMs).toBe(60000);
      
      // Advance time partially
      now += 30000;
      
      const nextStatus = limiter.checkLimits();
      expect(nextStatus.limits.rpm.resetInMs).toBe(30000);
    });
  });

  describe('Dynamic Limit Updates', () => {
    beforeEach(() => {
      limiter = new ResourceLimiter({
        requests: { limit: 10, window: 60000 }
      });
    });

    test('updates existing limits', () => {
      limiter.setLimits({
        requests: { limit: 20, window: 60000 }
      });

      const status = limiter.checkLimits();
      expect(status.limits.requests.limit).toBe(20);
    });

    test('adds new limits', () => {
      limiter.setLimits({
        tokens: { limit: 1000, window: 60000 }
      });

      const status = limiter.checkLimits({ tokens: 1 });
      expect(status.limits.tokens).toBeDefined();
    });

    test('removes limits', () => {
      limiter.setLimits({
        requests: null
      });

      const status = limiter.checkLimits({ requests: 999999 });
      expect(status.limits.requests).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('handles zero limits', () => {
      limiter = new ResourceLimiter({
        requests: { limit: 0, window: 60000 }
      });

      const status = limiter.checkLimits({ requests: 1 });
      expect(status.allowed).toBe(false);
    });

    test('handles missing amounts', () => {
      limiter = new ResourceLimiter({
        requests: { limit: 10, window: 60000 }
      });

      const status = limiter.consume({});
      expect(status.allowed).toBe(true);
    });

    test('ignores unknown limit types', () => {
      limiter = new ResourceLimiter({
        requests: { limit: 10, window: 60000 }
      });

      const status = limiter.consume({
        unknown: 999999
      });

      expect(status.allowed).toBe(true);
    });
  });

  describe('Input Validation', () => {
    test('rejects negative limits', () => {
      expect(() => {
        new ResourceLimiter({
          requests: { limit: -1, window: 60000 }
        });
      }).toThrow('Invalid limit config');
    });

    test('rejects invalid windows', () => {
      expect(() => {
        new ResourceLimiter({
          requests: { limit: 10, window: 0 }
        });
      }).toThrow('Invalid limit config');
    });
  });

  describe('Race Conditions', () => {
    test('handles concurrent consumption attempts safely', async () => {
      const limiter = new ResourceLimiter({
        requests: { limit: 5, window: 60000 }
      });

      // Simulate concurrent requests
      const results = await Promise.all(
        Array(10).fill().map(() => 
          Promise.resolve(limiter.consume({ requests: 1 }))
        )
      );

      const allowed = results.filter(r => r.allowed).length;
      expect(allowed).toBe(5); // Only first 5 should succeed
      
      const final = limiter.checkLimits();
      expect(final.limits.requests.remaining).toBe(0);
    });
  });
}); 