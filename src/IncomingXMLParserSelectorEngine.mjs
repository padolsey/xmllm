import { Parser } from 'htmlparser2';
import { selectOne, selectAll } from 'css-select';

class Node {

  constructor(name, o) {
    // super();
    this.length = 0;
    this.__isNodeObj__ = true;
    if (o) {
      this.$tagkey = o.key;
      this.$attr = o.attr;
      this.$text = o.aggregateText;
      this.$tagclosed = o.closed;
      this.$children = o.children || [];
      this.$tagname = name;

      const { key, attr, text, closed, children, ...rest } = o;
      
      Object.assign(this, rest);
    }
  }
}

class IncomingXMLParserSelectorEngine {
  static RESERVED_PROPERTIES = new Set([
    '$attr',
    '$tagclosed',
    '$tagkey',
    '$children',
    '$tagname',
    '__isNodeObj__'
  ]);

  constructor() {
    this.buffer = '';
    this.parsedData = [];
    this.openElements = [];
    this.selectors = new Map();
    this.returnedElementSignatures = new Map();
    this.elementIndex = 0;
    
    this.parser = new Parser({
      onopentag: (name, attributes) => {
        const element = {
          key: this.elementIndex++,
          type: 'tag',
          name,
          attribs: attributes,
          children: [],
          parent: this.openElements[this.openElements.length - 1] || null,
          closed: false,
          textContent: '',
          prev: null,
          next: null
        };
        
        if (element.parent) {
          const siblings = element.parent.children;
          element.prev = siblings[siblings.length - 1] || null;
          if (element.prev) {
            element.prev.next = element;
          }
          element.parent.children.push(element);
        } else {
          this.parsedData.push(element);
        }
        
        this.openElements.push(element);
      },
      ontext: (text) => {
        if (this.openElements.length > 0) {
          const currentElement = this.openElements[this.openElements.length - 1];
          const textNode = {
            type: 'text',
            data: text,
            parent: currentElement,
            prev: currentElement.children[currentElement.children.length - 1] || null,
            next: null
          };
          
          if (textNode.prev) {
            textNode.prev.next = textNode;
          }
          
          currentElement.children.push(textNode);
        }
      },
      onclosetag: (name) => {
        const closedElement = this.openElements.pop();
        if (closedElement) {
          closedElement.closed = true;
          this.updateTextContent(closedElement);
        }
      },
    }, { xmlMode: true });
    
    // Add cache for normalized schemas
    this.normalizedSchemaCache = new WeakMap();
  }

  // Helper to normalize and cache schemas
  normalizeSchemaWithCache(schema) {
    // Check cache first
    let cached = this.normalizedSchemaCache.get(schema);
    if (cached) return cached;

    // Helper to validate and normalize schema
    const validateAndNormalizeSchema = (schema, path = '') => {
      // Handle primitives and functions
      if (typeof schema !== 'object' || schema === null) return schema;
      if (typeof schema === 'function') return schema;
      if (Array.isArray(schema)) return schema.map(s => validateAndNormalizeSchema(s, `${path}[]`));

      // Check for reserved properties
      Object.keys(schema).forEach(key => {
        if (IncomingXMLParserSelectorEngine.RESERVED_PROPERTIES.has(key)) {
          throw new Error(
            `Invalid schema: "${key}" at "${path}" is a reserved node property and cannot be used in schemas`
          );
        }
      });

      const result = {};
      for (let [key, value] of Object.entries(schema)) {
        result[key] = validateAndNormalizeSchema(
          value, 
          path ? `${path}.${key}` : key
        );
      }
      return result;
    };

    // Normalize and validate
    const normalized = Array.isArray(schema)
      ? schema.map(m => validateAndNormalizeSchema(m))
      : validateAndNormalizeSchema(schema);
    
    this.normalizedSchemaCache.set(schema, normalized);
    return normalized;
  }

  updateTextContent(element) {
    element.textContent = this.getTextContent(element);

    if (element.parent) {
      this.updateTextContent(element.parent);
    }
  }

  add(chunk) {
    this.buffer += chunk;
    this.parser.write(chunk);
  }

  getElementSignature(element, forDeduping = false) {
    const ancestry = [];
    let current = element;

    while (current.parent) {
      ancestry.unshift(`${current.name}[${current.parent.children.indexOf(current)}]`);
      current = current.parent;
    }
    
    const signature = {
      ancestry: ancestry.join('/'),
      name: element.name,
      key: element.key,
      closed: element.closed
    };

    if (!forDeduping) {
      signature.textContent = this.getTextContent(element);
    }

    return JSON.stringify(signature);
  }

  getTextContent(element) {
    if (element.type === 'text') {
      return element.data;
    }
    const tc = (element.children || []).reduce((text, child) => {
      if (child.type === 'text') {
        return text + child.data;
      } else if (child.type === 'tag') {
        return text + this.getTextContent(child);
      }
      return text;
    }, '');
    return tc;
  }

  select(selector, includeOpenTags = false) {
    function isClosed(el) {
      return el.closed || (el.children?.length && el.children.every(isClosed));
    }
    const decorateWithAggregateText = (el) => {
      el.aggregateText = this.getTextContent(el);
      if (el.children?.length) {
        el.children.map(decorateWithAggregateText);
      }
      return el;
    }
    const results = selectAll(selector, this.parsedData).map(decorateWithAggregateText);
    
    const filteredResults = results.filter(el => includeOpenTags || isClosed(el));
    return this.formatResults(filteredResults, includeOpenTags);
  }

  dedupeSelect(selector, includeOpenTags = false, doDedupeChildren = true) {
    
    const unfilteredResults = selectAll(selector, this.parsedData);
    const results = unfilteredResults.filter(el => {
      if (includeOpenTags) {
        return true;
      }
      return el.closed;
    });

    const dedupeElement = (el) => {
      const dedupeSignature = this.getElementSignature(el, true);
      const fullSignature = this.getElementSignature(el, false);

      el.aggregateText = this.getTextContent(el);

      if (!el.closed) {
        return el; // if it's open, we don't dedupe it
      }

      if (el.type !== 'tag') {
        return el;
      }
      
      const existingSignature = this.returnedElementSignatures.get(dedupeSignature);

      if (el.children?.length) {
        el.children.map(child => {
          child.aggregateText = this.getTextContent(child);
          return child;
        });
        
        el.dedupedChildren = el.children.map(child => {

          child.aggregateText = this.getTextContent(child);

          // If the child has not yet been returned, we can return it:
          // TODO: the meaning of 'deduped' is confusing now as it's
          // morphed from normalizaation/canonicalization to actual
          // removal from result-sets based on existing in previous
          // result-sets (intentional but still not fitting to the name)
          const dedupedChild = dedupeElement(child);
          if (dedupedChild) {
            // I.e. child has not been returned yet, so:
            return dedupedChild;
          }
          // Also!! If it is open and we're flagged to include open tags,
          // then we can return it too:
          if (includeOpenTags && !child.closed) {
            return child;
          }

          // Otherwise, we don't return it:
          return null;

          // If we are not de-duping children, then happily return:
          // return child;
        }).filter(Boolean);

        if (doDedupeChildren) {
          el.children = el.dedupedChildren;
        }
      }
      
      if (!existingSignature) {
        this.returnedElementSignatures.set(dedupeSignature, fullSignature);
        return el;
      }
      
      if (!el.closed && existingSignature !== fullSignature) {
        this.returnedElementSignatures.set(dedupeSignature, fullSignature);
        return el;
      }
      
      return null;
    }

    const newResults = results.filter(result => {
      const dedupedElement = dedupeElement(result);
      if (dedupedElement) {
        return true;
      }
      return false;
    });
    
    return this.formatResults(newResults, includeOpenTags);
  }

  formatResults(results, includeOpenTags = false) {
    return results.map(r => {
      return this.formatElement(r, includeOpenTags);
    });
  }

  formatElement(element, includeOpenTags = false) {

    element.aggregateText = element.aggregateText || this.getTextContent(element);
    // Special case for text nodes
    if (element.type === 'text') {
      return new Node('TEXT_NODE', {
        key: -1, // Text nodes don't need unique keys
        text: element.data,
        closed: true, // Text nodes are always "closed"
        children: [],
        attr: {}
      });
    }

    // Skip any non-text, non-tag nodes
    if (element.type !== 'tag' && element.type !== 'text') {
      return null;
    }

    // First format all children recursively
    const formattedChildren = element.children?.map(child => {
      return this.formatElement(child, includeOpenTags);
    }).filter(Boolean) || []; // Filter out null results from skipped nodes

    const formatted = new Node(element.name, {
      key: element.key,
      attr: { ...element.attribs },
      aggregateText: element.aggregateText, //???? NOTE TODO
      text: includeOpenTags ? (
        element.closed ? element.textContent : this.getTextContent(element)
      ) : element.textContent,
      closed: element.closed,
      children: formattedChildren
    });

    formatted.length = 0;
    
    if (element.children?.length) {
      element.children.forEach(child => {
        if (child.type === 'tag') {
          if (!formatted[child.name]) {
            formatted[child.name] = [];
          }
          if (!Array.isArray(formatted[child.name])) {
            formatted[child.name] = [formatted[child.name]];
          }
          const formattedChild = this.formatElement(child, includeOpenTags);
          if (formattedChild) {
            formatted[child.name].push(formattedChild);
          }
        }
      });
    }
    
    return formatted;
  }

  /**
   * Maps schema to elements, yielding only newly completed elements.
   * This is "delta mode" - you only see elements once, when they complete.
   */
  mapSelectClosed(schema) {
    // Add JSDoc to clarify this is "delta mode"
    return this.mapSelect(schema, false, true); // includeOpen=false, dedupe=true
  }

  /**
   * Maps schema to elements. Can operate in different modes:
   * - State mode: (includeOpen=true, dedupe=false) - Shows growing state including partials
   * - RootOnce mode: (includeOpen=false, dedupe=true) - Shows only new complete elements
   * - Snapshot mode: (includeOpen=false, dedupe=false) - Shows current complete state
   */
  mapSelect(mapping, includeOpenTags = true, doDedupe = true) {
    const normalizedMapping = this.normalizeSchemaWithCache(mapping);
    
    const applyMapping = (element, map) => {

      if (Array.isArray(map)) {
        if (map.length !== 1) {
          throw new Error('A map array must only have one element');
        }
        return Array.isArray(element)
          ? element.map(e => applyMapping(e, map[0]))
          : [applyMapping(element, map[0])];
      }

      if (!element?.__isNodeObj__ && element != null) {
        // Treat it as a plain value:
        if (typeof map === 'function') {
          return map(element);
        } else {
          return element;
        }
      }

      // Add handling for string literals - treat them as String type
      if (typeof map === 'string') {
        map = String;
      }

      if (typeof map === 'function') {
        // Handle built-in constructors specially
        if (map === Number) {
          // Use parseFloat for more robust number parsing
          // Trim whitespace and handle edge cases
          return parseFloat(element.$text?.trim?.() || '');
        }
        if (map === String) {
          return String(element.$text);
        }
        if (map === Boolean) {
          const text = element.$text?.trim?.().toLowerCase() || '';
          
          // Anything that's not obviously false is considered true
          const isWordedAsFalse = ['false', 'no', 'null'].includes(text);
          const isEssentiallyFalsey = text === '' || isWordedAsFalse || parseFloat(text) === 0;
          return !isEssentiallyFalsey;
        }
        // Pass full element to custom functions
        return map(element);
      }

      if (typeof map !== 'object') {
        throw new Error('Map must be an object, function, or array');
      }

      const out = {};

      for (const k in map) {

        const mapItem = map[k];

        if (k === '_' || k === '$text') {
          // Handle text content
          out[k] = applyMapping(element.$text, mapItem);
        } else if (k.startsWith('$')) {
          // Handle attributes
          const attrName = k.slice(1);
          if (element.$attr && element.$attr[attrName] != null) {
            out[k] = applyMapping(element.$attr[attrName], mapItem);
          }
        } else if (!element[k]) {
          out[k] = Array.isArray(mapItem) ? [] : undefined;
        } else if (Array.isArray(mapItem)) {
          out[k] = applyMapping(element[k], mapItem);
        } else {
          out[k] = applyMapping(
            Array.isArray(element[k]) ? element[k][0] : element[k],
            mapItem
          );
        }
      }
      return out;
    };

    const isArrayMapping = Array.isArray(normalizedMapping);

    if (isArrayMapping) {
      const rootSelector = Object.keys(normalizedMapping[0])[0];
      return (doDedupe
        ? this.dedupeSelect(rootSelector, includeOpenTags)
        : this.select(rootSelector, includeOpenTags)
      ).map(element => ({
        [rootSelector]: applyMapping(element, normalizedMapping[0][rootSelector])
      }));
    }

    const rootSelectors = Object.keys(normalizedMapping);
    const results = {};

    rootSelectors.forEach(selector => {
      const elements = doDedupe
        ? this.dedupeSelect(selector, includeOpenTags)
        : this.select(selector, includeOpenTags);

      // If no elements found, just return/skip
      if (!elements?.length) return;

      const resultName = selector;

      if (Array.isArray(normalizedMapping[selector])) {
        elements.forEach((el) => {
          results[resultName] = (
            results[resultName] || []
          ).concat(applyMapping(el, normalizedMapping[selector]));
        });
      } else {
        results[resultName] = applyMapping(elements[0], normalizedMapping[selector]);
      }
    });

    // Returns empty object if no matches found
    return results;
  }

  static validateHints(schema, hints) {
    function validateStructure(schemaObj, hintsObj, path = '') {
      if (!hintsObj) return; // Hints are optional

      // Handle primitives in schema
      if (typeof schemaObj !== 'object' || schemaObj === null) {
        return;
      }

      // Handle arrays
      if (Array.isArray(schemaObj)) {
        if (schemaObj.length !== 1) {
          throw new Error(`Schema array at ${path} must have exactly one element`);
        }
        if (hintsObj && !Array.isArray(hintsObj) && typeof hintsObj !== 'string') {
          throw new Error(`Hints at ${path} must be array or string for array schema`);
        }
        validateStructure(schemaObj[0], Array.isArray(hintsObj) ? hintsObj[0] : hintsObj, `${path}[]`);
        return;
      }

      // Check each hint has corresponding schema definition
      for (const key in hintsObj) {
        if (!schemaObj.hasOwnProperty(key)) {
          throw new Error(`Hint "${key}" has no corresponding schema definition at ${path}`);
        }
        validateStructure(schemaObj[key], hintsObj[key], path ? `${path}.${key}` : key);
      }
    }

    validateStructure(schema, hints);
  }

  static makeMapSelectXMLScaffold(schema, hints = {}, indent = 2) {
    function processObject(obj, hintObj = {}, level = 0) {
      let xml = '';
      const indentation = ' '.repeat(level * indent);

      for (let key in obj) {
        const value = obj[key];
        const hint = hintObj[key];

        // Skip attribute markers
        if (key.startsWith('$')) continue;

        // Handle string literals as pure hints
        if (typeof value === 'string') {
          xml += `${indentation}<${key}>${value}</${key}>\n`;
          continue;
        }

        // Handle functions (including primitives) with optional hints
        if (typeof value === 'function') {
          const typeHint = value === String ? '{String}' : 
                          value === Number ? '{Number}' : 
                          value === Boolean ? '{Boolean}' : '';
          const content = hint ? hint : typeHint || '...';
          xml += `${indentation}<${key}>${content}</${key}>\n`;
          continue;
        }

        // Handle arrays
        if (Array.isArray(value)) {
          const itemValue = value[0];
          const itemHint = Array.isArray(hint) ? hint[0] : hint;

          // Show two examples for arrays
          for (let i = 0; i < 2; i++) {
            xml += `${indentation}<${key}${getAttributeString(itemValue, itemHint)}>\n`;
            
            // Handle text content for array items
            if (typeof itemValue !== 'object') {
              // For primitive arrays, use the hint directly if it's a string
              const content =
                typeof itemHint === 'string' ? itemHint :
                typeof itemValue === 'string' ? itemValue :
                itemValue === String ? '{String}' :
                itemValue === Number ? '{Number}' :
                itemValue === Boolean ? '{Boolean}' :
                '...';
              xml += `${indentation}  ${content}\n`;
            } else {
              // Handle text content from $text in object
              if (itemValue.$text !== undefined) {
                const textContent = itemHint?.$text || (
                  typeof itemValue.$text === 'function' ? 
                    (itemValue.$text === String ? '{String}' :
                     itemValue.$text === Number ? '{Number}' :
                     itemValue.$text === Boolean ? '{Boolean}' : '...') :
                    (typeof itemValue.$text === 'string' ? itemValue.$text : '...')
                );
                xml += `${indentation}  ${textContent}\n`;
              } else if (itemHint?.$text) {
                xml += `${indentation}  ${itemHint.$text}\n`;
              }
              xml += processObject(itemValue, itemHint, level + 1);
            }
            
            xml += `${indentation}</${key}>\n`;
          }
          xml += `${indentation}/*etc.*/\n`;
          continue;
        }

        // Handle objects
        if (typeof value === 'object' && value !== null) {
          const attrs = getAttributeString(value, hint);
          xml += `${indentation}<${key}${attrs}>\n`;
          
          // Handle text content - check if it's explicitly typed
          if (value.$text !== undefined) {
            const textContent = typeof value.$text === 'function' ? 
              (value.$text === String ? '{String}' :
               value.$text === Number ? '{Number}' :
               value.$text === Boolean ? '{Boolean}' : '...') :
              (typeof value.$text === 'string' ? value.$text : '...');
            xml += `${indentation}  ${textContent}\n`;
          } else if (hint?.$text) {
            xml += `${indentation}  ${hint.$text}\n`;
          }
          
          xml += processObject(value, hint || {}, level + 1);
          xml += `${indentation}</${key}>\n`;
        }
      }

      return xml;
    }

    function getAttributeString(obj, hints = {}) {
      if (typeof obj !== 'object' || obj === null) return '';

      let attrs = '';
      for (const key in obj) {
        if (key.startsWith('$') && key !== '$text') {
          const attrName = key.slice(1);
          const value = obj[key];
          const hint = hints?.[key];

          // Handle string literals as pure hints
          if (typeof value === 'string') {
            attrs += ` ${attrName}="${value}"`;
            continue;
          }

          // Handle functions (including primitives) with optional hints
          if (typeof value === 'function') {
            const typeHint = value === String ? '{String}' : 
                            value === Number ? '{Number}' : 
                            value === Boolean ? '{Boolean}' : '';
            const content = hint ? hint : typeHint || '...';
            attrs += ` ${attrName}="${content}"`;
            continue;
          }

          // Default case
          attrs += ` ${attrName}="${hint || '...'}"`;
        }
      }
      return attrs;
    }

    // Validate hints against schema if provided
    if (Object.keys(hints).length > 0) {
      IncomingXMLParserSelectorEngine.validateHints(schema, hints);
    }

    return processObject(schema, hints);
  }
}

export { Node };
export default IncomingXMLParserSelectorEngine;