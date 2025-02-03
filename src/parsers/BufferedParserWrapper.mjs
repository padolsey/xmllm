/**
 * Wraps a parser instance to provide buffering capabilities.
 * This helps reduce CPU overhead by batching small chunks before parsing.
 */
class BufferedParserWrapper {

  constructor(parser, options = {}) {
    this.parser = parser;
    
    // Handle buffer config
    if (options.buffer === false) {
      this.timeout = 0;
      this.maxSize = 0;
    } else {
      const bufferConfig = options.buffer === true ? {} : (options.buffer || {});
      // Enforce minimum timeout to prevent race conditions
      this.timeout = Math.max(bufferConfig.timeout ?? 10, 1); // Minimum 1ms timeout
      
      // Enforce reasonable maxSize 
      this.maxSize = Math.min(
        Math.max(bufferConfig.maxSize ?? 1024, 10), // Minimum 10 bytes
        1024 * 1024 // Maximum 1MB
      );
    }

    this.buffer = '';
    this.timeoutHandle = null;
  }

  add(chunk) {
    // Guard against null/undefined
    if (chunk == null) return false;
    
    // Convert to string and check if empty
    const str = String(chunk);
    if (!str) return false;

    try {
      this.buffer += str;
      
      if (this.buffer.length >= this.maxSize) {
        const flushed = this.flush();
        return flushed;  // Return the flushed content
      } else {
        if (this.timeoutHandle) {
          clearTimeout(this.timeoutHandle);
        }
        this.timeoutHandle = setTimeout(() => this.flush(), this.timeout);
        return false; // Indicate we buffered
      }
    } catch (err) {
      // Clear buffer on error
      this.buffer = '';
      throw err;
    }
  }

  flush() {
    if (this.buffer) {
      try {
        this.parser.add(this.buffer);
        const flushed = this.buffer;
        this.buffer = '';
        return flushed;
      } catch (err) {
        this.buffer = '';
        throw err;
      }
    }
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
    return false; // Nothing to flush
  }

  makeMapSelectScaffold(schema, hints) {
    return this.parser.makeMapSelectScaffold(schema, hints);
  }

  // Proxy all parser methods
  select(...args) { return this.parser.select(...args); }
  dedupeSelect(...args) { return this.parser.dedupeSelect(...args); }
  mapSelect(...args) { return this.parser.mapSelect(...args); }
  mapSelectClosed(...args) { return this.parser.mapSelectClosed(...args); }
  formatElement(...args) { return this.parser.formatElement(...args); }
  formatResults(...args) { return this.parser.formatResults(...args); }
  getTextContent(...args) { return this.parser.getTextContent(...args); }
}

BufferedParserWrapper.makeMapSelectScaffold = function(schema, hints) {
  return this.parser.makeMapSelectScaffold(schema, hints);
}

export default BufferedParserWrapper; 