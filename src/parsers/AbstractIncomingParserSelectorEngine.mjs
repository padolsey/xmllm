import {
  Type,
  EnumType,
  StringType,
  NumberType,
  BooleanType
} from '../types.mjs';

class Node {
  constructor(name, options = {}) {
    this.length = 0;
    this.__isNodeObj__ = true;
    this.$tagname = name;
    this.$text = options.text || '';
    this.$children = options.children || [];
    this.$tagkey = options.key;
    this.$tagclosed = options.closed || false;
    const { text, children, key, closed, ...rest } = options;
    Object.assign(this, rest);
  }
}

class AbstractIncomingParserSelectorEngine {
  static GEN_ATTRIBUTE_MARKER = () => {
    throw new Error('Subclass must implement GEN_ATTRIBUTE_MARKER');
  };

  static RESERVED_PROPERTIES = new Set([
    '$tagclosed',
    '$tagkey',
    '$children',
    '$tagname',
    '__isNodeObj__',
  ]);

  static GEN_OPEN_TAG = () => {
    throw new Error('Subclass must implement GEN_OPEN_TAG');
  }

  static GEN_CLOSE_TAG = () => {
    throw new Error('Subclass must implement GEN_CLOSE_TAG');
  }

  constructor() {
    this.buffer = '';
    this.position = 0;
    this.elementIndex = 0;
    this.parsedData = [];
    this.openElements = [];
    this.returnedElementSignatures = new Map();
  }

  add(chunk) {
    throw new Error('Subclass must implement add');
  }

  /**
   * Generates a unique signature for an element
   */
  getElementSignature(element, forDeduping = false) {
    const ancestry = [];
    let current = element;

    while (current.parent) {
      const index = current.parent.children.indexOf(current);
      ancestry.unshift(`${current.name}[${index}]`);
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

  /**
   * Gets the text content of an element including children
   */
  getTextContent(element) {
    if (element.type === 'text') {
      return element.data;
    }
    return (element.children || []).reduce((text, child) => {
      if (child.type === 'text') {
        return text + child.data;
      } else if (child.type === 'tag') {
        return text + this.getTextContent(child);
      }
      return text;
    }, '');
  }

  select(selector, includeOpenTags = false) {
    throw new Error('Subclass must implement select');
  }

  dedupeSelect(selector, includeOpenTags = false) {
    throw new Error('Subclass must implement dedupeSelect');
  }

  formatElement(element, includeOpenTags = false) {
    throw new Error('Subclass must implement formatElement');
  }

  formatResults(results, includeOpenTags = false) {
    return results.map(r => {
      return this.formatElement(r, includeOpenTags);
    }).filter(Boolean);
  }

  mapSelect(mapping, includeOpenTags = true, doDedupe = true) {
    const normalizedMapping = this.normalizeSchemaWithCache(mapping);
    
    const applyMapping = (element, map) => {
      // Handle arrays first
      if (Array.isArray(map)) {
        if (map.length !== 1) {
          throw new Error('A map array must only have one element');
        }
        return Array.isArray(element)
          ? element.map(e => applyMapping(e, map[0]))
          : [applyMapping(element, map[0])];
      }

      // Handle non-Node values
      if (!element?.__isNodeObj__ && element != null) {
        // Treat it as a plain value:
        if (typeof map === 'function') {
          return map(element);
        } else {
          return element;
        }
      }

      // Handle string literals as String type
      if (typeof map === 'string') {
        map = String;
      }

      // Handle Type instances
      if (map instanceof Type) {
        
        // If there's no element and no default, return undefined
        if (!element && map.default === undefined) {
          return undefined;
        }
        
        // Get the raw value and parse it according to the type
        const value = map.parse(element?.$text);
        
        // Apply transform or use default transformer
        let result = map.transform ? map.transform(value) : value;
        
        // Apply default value if result is empty or NaN
        if ((result === '' || (typeof result === 'number' && isNaN(result))) && map.default !== undefined) {
          result = map.default;
        }
        
        // If we still have an empty result and no default, return undefined
        if (result === '' && map.default === undefined) {
          return undefined;
        }
        
        return result;
      }

      // Handle built-in constructors
      if (typeof map === 'function') {
        if (map === Number) {
          return parseFloat(element.$text?.trim?.() || '');
        }
        if (map === String) {
          return String(element.$text);
        }
        if (map === Boolean) {
          const text = element.$text?.trim?.().toLowerCase() || '';
          const isWordedAsFalse = ['false', 'no', 'null'].includes(text);
          const isEssentiallyFalsey = text === '' || isWordedAsFalse || parseFloat(text) === 0;
          return !isEssentiallyFalsey;
        }
        return map(element);
      }

      // Handle objects (nested schemas)
      if (typeof map === 'object') {
        const out = {};
        for (const k in map) {
          const mapItem = map[k];
          if (k === '_' || k === '$text') {
            const value = applyMapping(element?.$text, mapItem);
            if (value !== undefined) out[k] = value;
          } else if (k.startsWith(this.constructor.GEN_ATTRIBUTE_MARKER())) {
            const attrName = k.slice(1);
            if (element?.$attr && element.$attr[attrName] != null) {
              const value = applyMapping(element.$attr[attrName], mapItem);
              if (value !== undefined) out[k] = value;
            }
          } else {
            const childElement = element?.[k];
            if (!childElement) {
              // Handle unfulfilled schema parts
              if (mapItem instanceof Type && mapItem.default !== undefined) {
                out[k] = mapItem.default;
              } else if (typeof mapItem === 'object' && !Array.isArray(mapItem)) {
                // Recursively handle nested objects with null element
                const value = applyMapping(null, mapItem);
                // Only include the object if it has properties
                if (value !== undefined && Object.keys(value).length > 0) {
                  out[k] = value;
                }
              } else {
                // Don't include arrays or undefined values
                if (Array.isArray(mapItem)) out[k] = [];
              }
            } else if (Array.isArray(mapItem)) {
              const value = applyMapping(childElement, mapItem);
              if (value !== undefined) out[k] = value;
            } else {
              const value = applyMapping(
                Array.isArray(childElement) ? childElement[0] : childElement,
                mapItem
              );
              if (value !== undefined) out[k] = value;
            }
          }
        }
        return Object.keys(out).length > 0 ? out : undefined;
      }

      throw new Error('Invalid mapping type');
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

    return results;
  }

  normalizeSchemaWithCache(schema) {
    return schema;
  }

  static validateHints(schema, hints) {
    function validateStructure(schemaObj, hintsObj, path = '') {
      if (!hintsObj) return; // Hints are optional

      // Handle primitives in schema
      if (typeof schemaObj !== 'object' || schemaObj === null || schemaObj instanceof Type) {
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
        validateStructure(
          schemaObj[key],
          hintsObj[key],
          path ? `${path}.${key}` : key
        );
      }
    }

    validateStructure(schema, hints);
  }

  static makeMapSelectScaffold(schema, hints = {}, indent = 2) {
    const processObject = (obj, hintObj = {}, level = 0) => {
      let xml = '';
      const indentation = ' '.repeat(level * indent);

      for (let key in obj) {
        const value = obj[key];
        const hint = hintObj[key];

        // Skip attribute markers
        if (key.startsWith(this.GEN_ATTRIBUTE_MARKER())) {
          continue;
        }

        // Handle string literals as pure hints
        if (typeof value === 'string') {
          xml += `${indentation}${this.GEN_OPEN_TAG(key)}${value}${this.GEN_CLOSE_TAG(key)}\n`;
          continue;
        }

        // Handle functions (including primitives) with optional hints
        if (typeof value === 'function') {
          const typeHint = value === String ? '{String}' : 
                          value === Number ? '{Number}' : 
                          value === Boolean ? '{Boolean}' : '';
          const content = hint ? hint : typeHint || '...';
          xml += `${indentation}${this.GEN_OPEN_TAG(key)}${content}${this.GEN_CLOSE_TAG(key)}\n`;
          continue;
        }

        // Handle Type instances
        if (value instanceof Type) {
          // Determine content following the same pattern as other types
          let typeHint = '';
          if (value instanceof StringType) typeHint = '{String}';
          else if (value instanceof NumberType) typeHint = '{Number}';
          else if (value instanceof BooleanType) typeHint = '{Boolean}';
          else if (value instanceof EnumType) typeHint = `{Enum: ${value.allowedValues?.join('|')}}`;
          
          const content = hint || typeHint || '...';
          
          if (value.isCData) {
            xml += `${indentation}${this.GEN_OPEN_TAG(key)}<![CDATA[${content}]]>${this.GEN_CLOSE_TAG(key)}\n`;
          } else {
            xml += `${indentation}${this.GEN_OPEN_TAG(key)}${content}${this.GEN_CLOSE_TAG(key)}\n`;
          }
          continue;
        }

        // Handle arrays
        if (Array.isArray(value)) {
          const itemValue = value[0];
          const itemHint = Array.isArray(hint) ? hint[0] : hint;

          // Show two examples for arrays
          for (let i = 0; i < 2; i++) {
            xml += `${indentation}${this.GEN_OPEN_TAG(key, itemValue, itemHint)}\n`;
            
            // Handle text content for array items
            if (typeof itemValue !== 'object' || itemValue === null) {
              // For primitive arrays, use the hint directly if it's a string
              const content =
                typeof itemHint === 'string' ? itemHint :
                typeof itemValue === 'string' ? itemValue :
                itemValue === String ? '{String}' :
                itemValue === Number ? '{Number}' :
                itemValue === Boolean ? '{Boolean}' : '...';
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
            
            xml += `${indentation}${this.GEN_CLOSE_TAG(key)}\n`;
          }
          xml += `${indentation}/*etc.*/\n`;
          continue;
        }

        // Handle objects
        if (typeof value === 'object' && value !== null) {
          xml += `${indentation}${this.GEN_OPEN_TAG(key, value, hint)}\n`;
          
          // Handle text content - check if it's explicitly typed
          if (value.$text !== undefined) {
            const textContent = hint?.$text || (
              typeof value.$text === 'function' ? 
                (value.$text === String ? '{String}' :
                 value.$text === Number ? '{Number}' :
                 value.$text === Boolean ? '{Boolean}' :
                 '...') :
              (typeof value.$text === 'string' ? value.$text : '...')
            );
            xml += `${indentation}  ${textContent}\n`;
          } else if (hint?.$text) {
            xml += `${indentation}  ${hint.$text}\n`;
          }
          
          xml += processObject(value, hint || {}, level + 1);
          xml += `${indentation}${this.GEN_CLOSE_TAG(key)}\n`;
        }
      }

      return xml;
    }

    // Validate hints against schema if provided
    if (Object.keys(hints).length > 0) {
      AbstractIncomingParserSelectorEngine.validateHints(schema, hints);
    }

    return processObject(schema, hints);
  }
}

export { Node };
export default AbstractIncomingParserSelectorEngine;