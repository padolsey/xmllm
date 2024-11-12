import Logger from './Logger.mjs';
import { ConnectionTimeoutError } from './errors/ConnectionErrors.mjs';

const logger = new Logger('ConnectionPool');

class ConnectionPool {
  constructor(config = {}) {
    this.maxConnections = config.maxConnections || 10;
    this.timeout = config.timeout || 30000;
    this.activeConnections = new Map();
    this.waitingQueue = [];
    this.providerLimits = config.providerLimits || {};
  }

  async acquire(providerId) {
    const providerLimit = this.providerLimits[providerId] || this.maxConnections;
    const currentConnections = this.getActiveConnectionCount(providerId);

    if (currentConnections >= providerLimit) {
      logger.log(`Connection limit reached for provider ${providerId}. Queuing request.`);
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          this.waitingQueue = this.waitingQueue.filter(req => req.id !== timeoutId);
          reject(new ConnectionTimeoutError());
        }, this.timeout);

        this.waitingQueue.push({
          id: timeoutId,
          providerId,
          resolve,
          reject
        });
      });
    }

    const connectionId = this.generateConnectionId();
    this.activeConnections.set(connectionId, {
      providerId,
      timestamp: Date.now()
    });

    logger.log(`Created new connection ${connectionId} for provider ${providerId}`);
    return connectionId;
  }

  release(connectionId) {
    if (!this.activeConnections.has(connectionId)) {
      logger.error(`Attempting to release non-existent connection: ${connectionId}`);
      return;
    }

    const connection = this.activeConnections.get(connectionId);
    this.activeConnections.delete(connectionId);
    logger.log(`Released connection ${connectionId}`);

    // Process waiting queue
    this.processWaitingQueue(connection.providerId);
  }

  // Internal methods (previously private)
  processWaitingQueue(providerId) {
    const waitingRequest = this.waitingQueue.find(req => req.providerId === providerId);
    if (waitingRequest) {
      clearTimeout(waitingRequest.id);
      this.waitingQueue = this.waitingQueue.filter(req => req.id !== waitingRequest.id);
      
      const newConnectionId = this.generateConnectionId();
      this.activeConnections.set(newConnectionId, {
        providerId,
        timestamp: Date.now()
      });

      waitingRequest.resolve(newConnectionId);
    }
  }

  getActiveConnectionCount(providerId) {
    return Array.from(this.activeConnections.values())
      .filter(conn => conn.providerId === providerId)
      .length;
  }

  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // For monitoring/debugging
  getStats() {
    const stats = {
      totalActive: this.activeConnections.size,
      queueLength: this.waitingQueue.length,
      byProvider: {}
    };

    for (const [providerId, limit] of Object.entries(this.providerLimits)) {
      stats.byProvider[providerId] = {
        active: this.getActiveConnectionCount(providerId),
        limit
      };
    }

    return stats;
  }
}

export default ConnectionPool; 