import xmllm from './xmllm.mjs';

class XMLStream {
  constructor(pipeline = [], options = {}) {
    this.pipeline = pipeline;
    this.options = options;
  }

  // Get first matching element
  async first() {
    const {value} = await this[Symbol.asyncIterator]().next();
    return value;
  }

  select(selector) {
    return new XMLStream([
      ...this.pipeline,
      ['select', selector]
    ], this.options);
  }

  // Return new XMLStream that will collect all items
  all() {
    return new XMLStream([
      ...this.pipeline,
      ['accrue'],  // Collect all items into an array
      // STREAMOPS LIBRARY NOTE:
      // IMPORTANT: AFAIK the map() below is required to prevent accrue from
      // yielding items individually.
      // Without this map, accrue (being a Dam) would yield each collected
      // item separately.
      // With this map, we preserve the accumulated array as a single
      // unit because:
      // 1. accrue collects items: [a,b,c]
      // 2. map receives the whole array and passes it through intact
      // If we removed this map, we'd get individual items a,b,c instead of
      // [a,b,c]
      ['map', c => c]
    ], this.options);
  }

  map(fn) {
    return new XMLStream([
      ...this.pipeline,
      ['map', fn]
    ], this.options);
  }

  text() {
    return new XMLStream([
      ...this.pipeline,
      ['map', el => el?.$text]
    ], this.options);
  }

  async value() {
    try {
      const {value, done} = await this[Symbol.asyncIterator]().next();
      if (done) return undefined;
      return value;
    } catch (error) {
      const errorInfo = parseError(error);
      
      switch (errorInfo.type) {
        case 'TimeoutError':
          throw new Error(`LLM request timed out: ${errorInfo.message}`);
        case 'NetworkError':
          throw new Error(`Failed to connect to LLM service: ${errorInfo.message}`);
        default:
          throw error;
      }
    }
  }

  take(n) {
    return new XMLStream([
      ...this.pipeline,
      ['take', n]
    ], this.options);
  }

  skip(n) {
    return new XMLStream([
      ...this.pipeline,
      ['skip', n]
    ], this.options);
  }

  filter(predicate) {
    return new XMLStream([
      ...this.pipeline,
      ['filter', predicate]
    ], this.options);
  }

  mergeAggregate() {
    return new XMLStream([
      ...this.pipeline,
      ['mergeAggregate']
    ], this.options);
  }

  reduce(reducer, initialValue) {
    return new XMLStream([
      ...this.pipeline,
      ['reduce', { reducer, initialValue }]
    ], this.options);
  }

  raw() {
    return new XMLStream([
      ...this.pipeline,
      ['raw']
    ], this.options);
  }

  debug(label = '') {
    return new XMLStream([
      ...this.pipeline,
      ['map', value => {
        console.group(`Debug: ${label}`);
        console.log(value);
        console.groupEnd();
        return value;
      }]
    ], this.options);
  }

  [Symbol.asyncIterator]() {
    let iterator;

    const pipeline = this.pipeline;
    const options = this.options;
    
    return {
      async next() {
        try {
          if (!iterator) {
            iterator = xmllm(({req, select, mergeAggregate, map, filter, accrue, reduce, promptComplex, take, skip}) => {
              return pipeline.map(([type, arg]) => {
                switch(type) {
                  case 'select': return select.call(this, arg);
                  case 'mergeAggregate': return mergeAggregate.call(this, arg);
                  case 'map': return map.call(this, arg);
                  case 'text': return map.call(this, ({$text}) => $text);
                  case 'raw': return map.call(this, t=>t);
                  case 'filter': return filter.call(this, arg);
                  case 'accrue': return accrue.call(this);
                  case 'reduce': return reduce.call(this, arg.reducer, arg.initialValue);
                  case 'skip': return skip.call(this, arg);
                  case 'take': return take.call(this, arg);
                  case 'req': return arg.schema ? promptComplex.call(this, arg) : req.call(this, arg);
                }
              });
            }, options);
          }

          return iterator.next();
        } catch (error) {
          iterator = null;
          throw error;
        }
      },
      async return() {
        try {
          // Ensure cleanup when iteration is interrupted
          if (iterator && typeof iterator.return === 'function') {
            await iterator.return();
          }
        } finally {
          iterator = null;
        }
        return { done: true };
      }
    };
  }

  closedOnly() {
    return new XMLStream([
      ...this.pipeline,
      // Only let elements pass through if they're closed
      ['filter', el => el?.__isNodeObj__ ? !!el.$closed : true]
    ], this.options);
  }

  // Mark complete() as deprecated but keep it for backwards compatibility
  complete() {
    console.warn('Warning: complete() is deprecated. Use closedOnly() instead as it better describes what this method does - it filters for closed XML elements.');
    return this.closedOnly();
  }

  // async text() {
  //   const value = await this.value();
  //   if (Array.isArray(value)) {
  //     return value.map(el => el.$text);
  //   }
  //   return value?.$text;
  // }

  // Convenience method for schema-based collection
  async collect() {
    return this
      .all()
      .reduce((acc, chunk) => ({...acc, ...chunk}), {})
      .value();
  }

  merge() {
    return new XMLStream([
      ...this.pipeline,
      ['accrue'],
      ['map', chunks => {
        // Deep merge function
        const deepMerge = (target, source) => {
          for (const key in source) {
            if (source[key] !== null && typeof source[key] === 'object') {
              // Handle arrays
              if (Array.isArray(source[key])) {
                target[key] = target[key] || [];
                target[key] = target[key].concat(source[key]);
              }
              // Handle objects
              else {
                target[key] = target[key] || {};
                deepMerge(target[key], source[key]);
              }
            } else {
              target[key] = source[key];
            }
          }
          return target;
        };

        return chunks.reduce((acc, chunk) => deepMerge(acc, chunk), {});
      }]
    ], this.options);
  }
}

export default XMLStream;

function parseError(error) {
  // Start with the raw message
  let message = error.message || '';
  
  // First try to get error type from context
  let type = error.context?.name;
  
  if (!type) {
    // Look for [ErrorType] pattern
    const typeMatch = message.match(/\[([^\]]+)\]/);
    if (typeMatch) {
      type = typeMatch[1];
    } else {
      // If no explicit type, try to infer from message
      if (message.toLowerCase().includes('timeout')) {
        type = 'TimeoutError';
      } else if (message.toLowerCase().includes('network') || 
                 message.toLowerCase().includes('disconnect')) {
        type = 'NetworkError';
      } else {
        type = 'Error';
      }
    }
  }

  // Extract the actual message
  // Remove "Unhandled error. (" prefix if it exists
  message = message.replace(/^Unhandled error\. \(?(?:Error(?:\s+\[[^\]]+\])?\s*:\s*)?/, '');
  // Remove stack trace
  message = message.replace(/\n.*$/s, '');
  // Remove trailing parenthesis if it exists
  message = message.replace(/\)$/, '');

  return { type, message };
}
