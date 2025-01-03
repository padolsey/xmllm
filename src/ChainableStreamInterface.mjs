import xmllm from './xmllm.mjs';
import Logger from './Logger.mjs';
import ValidationService from './ValidationService.mjs';

const logger = new Logger('ChainableStreamInterface');

export class ChainableStreamInterface {
  constructor(pipeline = [], options = {}) {
    this.pipeline = pipeline;
    this.options = options;
  }

  async first() {
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

  select(selector) {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['select', selector]
    ], this.options);
  }

  // Return new ChainableStreamInterface that will collect all items
  accrue() {
    return new ChainableStreamInterface([
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
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['map', fn]
    ], this.options);
  }

  text() {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['map', el => el?.$$text]
    ], this.options);
  }

  async all() {
    const result = [];
    for await (const value of this) {
      result.push(value);
    }
    return result;
  }
  
  async value() {
    logger.warn('Warning: value() is deprecated. Use first() or last() instead.');
    return this.first();
  }

  take(n) {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['take', n]
    ], this.options);
  }

  skip(n) {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['skip', n]
    ], this.options);
  }

  filter(predicate) {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['filter', predicate]
    ], this.options);
  }

  mergeAggregate() {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['mergeAggregate']
    ], this.options);
  }

  reduce(reducer, initialValue) {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['reduce', { reducer, initialValue }]
    ], this.options);
  }

  pipe(genFn) {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['pipe', genFn]
    ], this.options);
  }

  raw() {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['raw']
    ], this.options);
  }

  debug(label = '') {
    logger.log('Instigate debug() with label', label);
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['map', value => {
        console.log(`=== Debug ${label ? `(${label})` : ''} ===`);
        console.log(value);
        console.log('===================');
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
            iterator = xmllm(({
              req,
              select,
              mergeAggregate,
              map,
              filter,
              accrue,
              reduce,
              promptComplex,
              take,
              skip,
              batch
            }) => {
              return pipeline.map(([type, arg, arg2]) => {
                switch(type) {
                  case 'select': return select.call(this, arg);
                  case 'mergeAggregate': return mergeAggregate.call(this, arg);
                  case 'map': return map.call(this, arg);
                  case 'text': return map.call(this, ({$$text}) => $$text);
                  case 'raw': return map.call(this, t=>t);
                  case 'filter': return filter.call(this, arg);
                  case 'accrue': return accrue.call(this);
                  case 'reduce': return reduce.call(this, arg.reducer, arg.initialValue);
                  case 'skip': return skip.call(this, arg);
                  case 'take': return take.call(this, arg);
                  case 'batch': return batch.call(this, arg, arg2);
                  case 'req': {
                    return arg.schema ? promptComplex.call(this, arg) : req.call(this, arg);
                  }
                }

                throw new Error(`Unknown pipeline type: ${type}`);
              });
            }, options);
          }

          return iterator.next();
        } catch (error) {
          iterator = null;
          logger.error('ChainableStreamInterface error', error);
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
        return { done: true, value: undefined };
      }
    };
  }

  closedOnly() {
    // TODO: this will not work if is south of any element derivations e.g.
    // after stream()'d schema, it may already be too late because the data
    // is strings thus not a "node". Hmmmmmmmmmmm TODO
    return new ChainableStreamInterface([
      ...this.pipeline,
      // Only let elements pass through if they're closed
      ['filter', el => el?.__isNodeObj__ ? !!el.$$tagclosed : true]
    ], this.options);
  }

  // Mark complete() as deprecated but keep it for backwards compatibility
  complete() {
    logger.warn('Warning: complete() is deprecated. Use closedOnly() instead as it better describes what this method does - it filters for closed XML elements.');
    return this.closedOnly();
  }

  // Convenience method for schema-based collection
  async collect() {
    const results = [];
    for await (const item of this) {
      results.push(item);
    }
    return results;
  }

  merge() {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['accrue'],  // Collects all items into array
      ['map', chunks => {
        const deepMerge = (target, source) => {
          // Special case: if source is a special object type (Date, RegExp, etc), return it directly
          if (source !== null && 
              typeof source === 'object' && 
              source.constructor !== Object && 
              source.constructor !== Array) {
            return source;
          }

          for (const key in source) {
            const sourceValue = source[key];
            
            if (sourceValue !== null && typeof sourceValue === 'object') {
              // Special object type - pass through
              if (sourceValue.constructor !== Object && sourceValue.constructor !== Array) {
                target[key] = sourceValue;
              }
              // Array - concat
              else if (Array.isArray(sourceValue)) {
                target[key] = target[key] || [];
                target[key] = target[key].concat(sourceValue);
              }
              // Plain object - recurse
              else {
                target[key] = target[key] || {};
                deepMerge(target[key], sourceValue);
              }
            } else {
              target[key] = sourceValue;
            }
          }
          return target;
        };

        return chunks.reduce((acc, chunk) => {
          return deepMerge(acc, chunk);
        }, {});
      }]
    ], this.options);
  }

  async last(n = 1) {
    try {
      if (n < 1) {
        throw new Error('n must be greater than 0');
      }

      const allItems = [];
      for await (const value of this) {
        allItems.push(value);
      }

      if (allItems.length === 0) {
        return undefined;
      }

      // If n=1, return single value, otherwise return array of last n items
      return n === 1 
        ? allItems[allItems.length - 1]
        : allItems.slice(-n);

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

  /**
   * Process stream in batches of specified size
   * @param {number} size - Size of each batch
   * @param {Object} options - Batch options
   * @param {boolean} options.yieldIncomplete - Whether to yield incomplete final batch
   */
  batch(size, options = { yieldIncomplete: true }) {
    return new ChainableStreamInterface([
      ...this.pipeline,
      ['batch', size, options]  // Pass both size and options to existing batch operator
    ], this.options);
  }
}

export default ChainableStreamInterface;

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
