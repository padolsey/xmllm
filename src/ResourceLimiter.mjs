/**
 * @typedef {Object} LimitConfig
 * @property {number} limit - Maximum value allowed
 * @property {number} window - Time window in milliseconds
 */

/**
 * @typedef {Object} LimitStatus
 * @property {boolean} allowed - Whether action is allowed
 * @property {number} remaining - Resources remaining
 * @property {number} limit - Maximum limit
 * @property {number} resetInMs - Milliseconds until reset
 */

/**
 * Manages multiple types of resource limits with customizable time windows
 */
class ResourceLimiter {
  constructor(limits = {}) {
    this.buckets = new Map();
    this.setLimits(limits);
  }

  /**
   * Set or update limits
   * @param {Object.<string, LimitConfig|null>} limits - Map of limit names to configs
   */
  setLimits(limits) {
    for (const [name, config] of Object.entries(limits)) {
      if (config === null || config.limit === null || config.limit === Infinity) {
        this.buckets.delete(name);
        continue;
      }
      
      if (config.limit < 0 || config.window <= 0) {
        throw new Error(
          `Invalid limit config for ${name}: limit must be >= 0 and window must be > 0`
        );
      }
      
      this.buckets.set(name, {
        name,
        limit: config.limit,
        window: config.window,
        remaining: config.limit,
        resetTime: Date.now() + config.window
      });
    }
  }

  /**
   * Check if consuming resources would exceed any limits
   * @param {Object} amounts - Resources to consume
   * @returns {Object} Status of all limits
   */
  checkLimits(amounts = {}) {
    const now = Date.now();
    const status = {
      allowed: true,
      limits: {}
    };

    for (const [name, bucket] of this.buckets) {
      // Reset if window expired
      if (now >= bucket.resetTime) {
        bucket.remaining = bucket.limit;
        bucket.resetTime = now + bucket.window;
      }

      const amount = amounts[name] || 0;
      const wouldExceed = bucket.remaining < amount;
      
      status.limits[name] = {
        allowed: !wouldExceed,
        remaining: bucket.remaining,
        limit: bucket.limit,
        resetInMs: Math.max(0, bucket.resetTime - now)
      };

      if (wouldExceed) {
        status.allowed = false;
      }
    }

    return status;
  }

  /**
   * Attempt to consume resources
   * @param {Object} amounts - Resources to consume
   * @returns {Object} Success status and limit details
   */
  consume(amounts = {}) {
    const status = this.checkLimits(amounts);
    
    if (!status.allowed) {
      return status;
    }

    // Actually consume the resources
    for (const [name, bucket] of this.buckets) {
      if (name in amounts) {
        bucket.remaining -= amounts[name] || 0;
      }
    }

    // Return post-consumption state
    return {
      allowed: true,
      limits: Object.fromEntries(
        Array.from(this.buckets).map(([name, bucket]) => [
          name,
          {
            allowed: true,
            remaining: bucket.remaining,
            limit: bucket.limit,
            resetInMs: Math.max(0, bucket.resetTime - Date.now())
          }
        ])
      )
    };
  }

  /**
   * Clear all limits and free memory
   */
  reset() {
    this.buckets.clear();
  }
}

export default ResourceLimiter; 