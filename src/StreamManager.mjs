import Logger from './Logger.mjs';

const logger = new Logger('StreamManager');

class StreamManager {
  constructor(config = {}) {
    this.timeout = config.timeout || 30000; // 30 second default timeout
    this.activeStreams = new Set();
  }

  async createStream(stream, res) {
    const timeoutId = setTimeout(() => {
      this.handleTimeout(res);
    }, this.timeout);

    const reader = stream.getReader();
    this.activeStreams.add(reader);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (value instanceof Uint8Array) {
          const content = new TextDecoder().decode(value);
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        } else if (typeof value === 'string') {
          res.write(`data: ${JSON.stringify({ content: value })}\n\n`);
        }
      }
    } catch (error) {
      logger.error('Stream error:', error);
      this.handleError(res, error);
    } finally {
      clearTimeout(timeoutId);
      this.cleanup(reader, res);
    }
  }

  handleTimeout(res) {
    logger.error('Stream timeout');
    res.write(`event: error\ndata: ${JSON.stringify({ 
      error: 'Stream timeout',
      code: 'STREAM_TIMEOUT'
    })}\n\n`);
    res.end();
  }

  handleError(res, error) {
    const errorResponse = {
      error: 'Stream error',
      code: 'STREAM_ERROR',
      message: error.message
    };
    res.write(`event: error\ndata: ${JSON.stringify(errorResponse)}\n\n`);
  }

  cleanup(reader, res) {
    try {
      reader.releaseLock();
      this.activeStreams.delete(reader);
      res.write('event: close\ndata: Stream ended\n\n');
      res.end();
    } catch (error) {
      logger.error('Error during stream cleanup:', error);
    }
  }

  // For graceful shutdown
  async closeAll() {
    const closePromises = Array.from(this.activeStreams).map(async (reader) => {
      try {
        reader.releaseLock();
      } catch (error) {
        logger.error('Error closing stream:', error);
      }
    });
    await Promise.all(closePromises);
    this.activeStreams.clear();
  }
}

export default StreamManager; 