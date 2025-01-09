import {
  Type,
  EnumType,
  StringType,
  NumberType,
  BooleanType,
  ItemsType
} from '../types.mjs';

class Node {
  constructor(name, options = {}) {
    this.length = 0;
    this.__isNodeObj__ = true;
    this.$$tagname = name;
    this.$$text = options.text || '';
    this.$$children = options.children || [];
    this.$$tagkey = options.key;
    this.$$tagclosed = options.closed || false;
    const { text, children, key, closed, ...rest } = options;
    Object.assign(this, rest);
  }
}

class AbstractIncomingParserSelectorEngine {

  static SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD = true;
  static NAME = 'AbstractIncomingParserSelectorEngine';
  static RESERVED_PROPERTIES = new Set([
    '$$tagclosed',
    '$$tagkey',
    '$$children',
    '$$tagname',
    '__isNodeObj__',
  ]);

  static GEN_ATTRIBUTE_MARKER = () => {
    throw new Error('Subclass must implement GEN_ATTRIBUTE_MARKER');
  };

  static GEN_OPEN_TAG = () => {
    throw new Error('Subclass must implement GEN_OPEN_TAG');
  }

  static GEN_CLOSE_TAG = () => {
    throw new Error('Subclass must implement GEN_CLOSE_TAG');
  }

  static GEN_TYPE_HINT = (type, enumValues = []) => {
    return `{${type}${
      enumValues?.length ? `: ${enumValues.join('|')}` : ''
    }}`;
  }

  static GEN_CDATA_OPEN = () => {
    return '';
  }

  static GEN_CDATA_CLOSE = () => {
    return '';
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
   * Gets all text content from an element and its children
   * @param {Object} element - The element to get text from
   * @param {Function} [filterFn] - Optional function to filter which children to include
   * @returns {string} The concatenated text content
   */
  getTextContent(element, filterFn = null) {
    if (element.type === 'text') {
      return element.data;
    }
    let text = '';
    for (const child of (element.children || [])) {
      if (filterFn && !filterFn(child)) {
        continue;
      }
      if (child.type === 'text') {
        text += child.data;
      } else if (child.type === 'tag') {
        text += this.getTextContent(child, filterFn);
      }
    }
    return text;
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
    const attributeMarker = this.constructor.GEN_ATTRIBUTE_MARKER()
    
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
        if (!element && map.default === undefined) {
          return undefined;
        }
        
        const value = map.parse(element?.$$text, element, applyMapping);
        // let result = map.transform ? map.transform(value) : value;
        let result = value;
        
        if ((result === '' || (typeof result === 'number' && isNaN(result))) && map.default !== undefined) {
          result = map.default;
        }
        
        if (result === '' && map.default === undefined) {
          return undefined;
        }
        
        return result;
      }

      // Handle built-in constructors
      if (typeof map === 'function') {
        if (map === Number) {
          return parseFloat(element.$$text?.trim?.() || '');
        }
        if (map === String) {
          return String(element.$$text);
        }
        if (map === Boolean) {
          const text = element.$$text?.trim?.().toLowerCase() || '';
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
          if (k === '_' || k === '$$text') {
            const value = applyMapping(element?.$$text, mapItem);
            if (value !== undefined) out[k] = value;
          } else if (
            !attributeMarker &&
            k.startsWith('$')
          ) {
            throw new Error(`There is no attribute marker defined for this parser (${this.constructor.NAME}); it looks like you are trying to use the $$attr pattern, but it will not work with this parser.`);
          } else if (
            attributeMarker &&
            k.startsWith(attributeMarker)
          ) {
            const attrName = k.slice(1);
            if (element?.$$attr && element.$$attr[attrName] != null) {
              const value = applyMapping(element.$$attr[attrName], mapItem);
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

  // New helper method
  static getTypeHintForPrimitive(value) {
    return value === String ? this.GEN_TYPE_HINT('String') : 
           value === Number ? this.GEN_TYPE_HINT('Number') : 
           value === Boolean ? this.GEN_TYPE_HINT('Boolean') : '';
  }

  static makeMapSelectScaffold(schema, hints = {}, indent = 2) {
    // Add validation before processing
    this.validateSchema(schema);
    
    const processObject = (obj, hintObj = {}, level = 0) => {
      let xml = '';
      const indentation = ' '.repeat(level * indent);

      for (let key in obj) {
        let value = obj[key];
        const hint = hintObj[key];

        // Skip attribute markers if configured to do so
        if (
          this.SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD &&
          this.GEN_ATTRIBUTE_MARKER() &&
          key.startsWith(this.GEN_ATTRIBUTE_MARKER())
        ) {
          continue;
        }

        // Handle Type instances
        if (value instanceof Type) {
          const content = hint || value.generateScaffold(
            type => this.GEN_TYPE_HINT(type)
          );
          
          if (value.isCData) {
            xml += `${indentation}${this.GEN_OPEN_TAG(key)}${this.GEN_CDATA_OPEN()}${content}${this.GEN_CDATA_CLOSE()}${this.GEN_CLOSE_TAG(key)}\n`;
          } else {
            xml += `${indentation}${this.GEN_OPEN_TAG(key)}${content}${this.GEN_CLOSE_TAG(key)}\n`;
          }
          continue;
        }

        // Handle string literals as pure hints
        if (typeof value === 'string') {
          xml += `${indentation}${this.GEN_OPEN_TAG(key)}${value}${this.GEN_CLOSE_TAG(key)}\n`;
          continue;
        }

        // Handle functions (including primitives) with optional hints
        if (typeof value === 'function') {
          const typeHint = this.getTypeHintForPrimitive(value);
          const content = hint ? hint : typeHint || '...';
          xml += `${indentation}${this.GEN_OPEN_TAG(key)}${content}${this.GEN_CLOSE_TAG(key)}\n`;
          continue;
        }

        // Handle arrays
        if (Array.isArray(value)) {
          xml += this.processArrayScaffold(key, value, hint, indentation, level, indent, processObject);
          continue;
        }

        // Handle objects
        if (typeof value === 'object' && value !== null) {
          xml += this.processObjectScaffold(key, value, hint, indentation, level, indent, processObject);
        }
      }

      return xml;
    }

    return processObject(schema, hints);
  }

  // New extracted method for object scaffold generation
  static processObjectScaffold(key, value, hint, indentation, level, indent, processObject) {
    let xml = '';
    xml += `${indentation}${this.GEN_OPEN_TAG(key, value, hint)}\n`;
    
    if (value.$$text !== undefined) {
      const textContent = hint?.$$text || (
        typeof value.$$text === 'function' ? 
          this.getTypeHintForPrimitive(value.$$text) || '...' :
          (typeof value.$$text === 'string' ? value.$$text : '...')
      );
      xml += `${indentation}  ${textContent}\n`;
    } else if (hint?.$$text) {
      xml += `${indentation}  ${hint.$$text}\n`;
    }
    
    xml += processObject(value, hint || {}, level + 1);
    xml += `${indentation}${this.GEN_CLOSE_TAG(key)}\n`;
    return xml;
  }

  // New extracted method for array scaffold generation
  static processArrayScaffold(key, value, hint, indentation, level, indent, processObject) {
    let xml = '';
    const itemValue = value[0];
    const itemHint = Array.isArray(hint) ? hint[0] : hint;

    // Show two examples for arrays
    for (let i = 0; i < 2; i++) {
      xml += `${indentation}${this.GEN_OPEN_TAG(key, itemValue, itemHint)}\n`;
      
      // Handle text content for array items
      if (typeof itemValue !== 'object' || itemValue === null) {
        const content =
          typeof itemHint === 'string' ? itemHint :
          typeof itemValue === 'string' ? itemValue :
          this.getTypeHintForPrimitive(itemValue) || '...';
        xml += `${indentation}  ${content}\n`;
      } else {
        // Handle text content from $$text in object
        if (itemValue.$$text !== undefined) {
          const textContent = itemHint?.$$text || (
            typeof itemValue.$$text === 'function' ? 
              this.getTypeHintForPrimitive(itemValue.$$text) || '...' :
              (typeof itemValue.$$text === 'string' ? itemValue.$$text : '...')
          );
          xml += `${indentation}  ${textContent}\n`;
        } else if (itemHint?.$$text) {
          xml += `${indentation}  ${itemHint.$$text}\n`;
        }
        xml += processObject(itemValue, itemHint, level + 1);
      }
      
      xml += `${indentation}${this.GEN_CLOSE_TAG(key)}\n`;
    }
    xml += `${indentation}/*etc.*/\n`;
    return xml;
  }

  static validateSchema(schema, path = '') {
    if (!schema || typeof schema !== 'object') {
      return;
    }

    // Track property names at current level (without $ prefix)
    const propertyNames = new Set();
    const attributeNames = new Set();

    for (const key in schema) {
      // Skip internal/reserved properties
      if (this.RESERVED_PROPERTIES.has(key)) {
        continue;
      }

      // Special case: Allow $$text alongside $text
      if (key === '$$text') {
        continue;
      }

      const isAttribute = key.startsWith(this.GEN_ATTRIBUTE_MARKER());
      const baseName = isAttribute ? key.slice(1) : key;
      
      // Check for duplicate names between attributes and properties
      if (isAttribute) {
        if (propertyNames.has(baseName)) {
          throw new Error(
            `Schema validation error at ${path}: Cannot have both property "${baseName}" and attribute "${key}" at the same level`
          );
        }
        attributeNames.add(baseName);
      } else {
        if (attributeNames.has(baseName)) {
          throw new Error(
            `Schema validation error at ${path}: Cannot have both property "${key}" and attribute "$${baseName}" at the same level`
          );
        }
        propertyNames.add(baseName);
      }

      const value = schema[key];
      
      // Continue validating nested objects and arrays
      if (Array.isArray(value)) {
        if (value.length === 1) {
          this.validateSchema(value[0], `${path}.${key}[0]`);
        }
      } else if (value && typeof value === 'object' && !('type' in value)) {
        this.validateSchema(value, `${path}.${key}`);
      }
    }
  }
}

export { Node };
export default AbstractIncomingParserSelectorEngine;