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

  GEN_TYPE_HINT(type) {
    return `...${type}...`;
  }

  GEN_CDATA_OPEN() {
    return '';
  }

  GEN_CDATA_CLOSE() {
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
    const attributeMarker = this.GEN_ATTRIBUTE_MARKER()
    
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
  getTypeHintForPrimitive(value) {
    return value === String ? this.GEN_TYPE_HINT('String') : 
           value === Number ? this.GEN_TYPE_HINT('Number') : 
           value === Boolean ? this.GEN_TYPE_HINT('Boolean') : '';
  }

  static makeMapSelectScaffold(schema, hints = {}, indent = 2, tagGenerators = {}) {
    return new this().makeMapSelectScaffold(schema, hints, indent);
  }

  makeMapSelectScaffold(schema, hints = {}, indent = 2) {
    return this.generateScaffold(schema, hints, indent);
  }

  generateScaffold(schema, hints = {}, indent = 2) {
    this.validateSchema(schema, '');

    const traverseSchema = (schemaNode, hintNode = {}, level = 0) => {
      let output = '';
      const indentation = ' '.repeat(level * indent);

      // Process attributes first
      for (let key in schemaNode) {
        if (key === '$$text') continue;
        if (!key.startsWith(this.GEN_ATTRIBUTE_MARKER())) continue;
        
        let value = schemaNode[key];
        const hint = hintNode[key];
        output += this.renderNode(value, key, hint, indentation, level, indent, traverseSchema);
      }

      // Process regular elements
      for (let key in schemaNode) {
        if (key === '$$text') continue;
        if (key.startsWith(this.GEN_ATTRIBUTE_MARKER())) continue;
        
        let value = schemaNode[key];
        const hint = hintNode[key];
        output += this.renderNode(value, key, hint, indentation, level, indent, traverseSchema);
      }

      return output;
    }

    return traverseSchema(schema, hints);
  }

  renderElementNode(tagName, schemaNode, hint, indentation, level, indent, traverseSchema) {
    let output = '';
    
    // Generate opening tag with attributes
    output += `${indentation}${this.GEN_OPEN_TAG(tagName, schemaNode, hint)}\n`;
    
    // Handle text content
    const textContent = this.extractTextContent(schemaNode, hint);
    if (textContent) {
      output += `${indentation}  ${textContent}\n`;
    }
    
    // Process child elements
    output += traverseSchema(schemaNode, hint || {}, level + 1);
    
    // Close tag
    output += `${indentation}${this.GEN_CLOSE_TAG(tagName)}\n`;
    
    return output;
  }

  extractTextContent(schemaNode, hint) {
    if (hint?.$$text) {
      return hint.$$text;
    }
    
    if (schemaNode.$$text !== undefined) {
      if (typeof schemaNode.$$text === 'function') {
        // If it's a built-in type (String, Number, etc), show type hint
        if (schemaNode.$$text === String || schemaNode.$$text === Number || schemaNode.$$text === Boolean) {
          return this.GEN_TYPE_HINT(schemaNode.$$text.name, hint);
        }
        // For custom transformations, just show ...
        return '...';
      }
      return typeof schemaNode.$$text === 'string' ? schemaNode.$$text : '...';
    }
    
    return null;
  }

  renderNode(value, key, hint, indentation, level, indent, traverseSchema) {
    if (this.constructor.SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD && 
        key.startsWith(this.GEN_ATTRIBUTE_MARKER())) {
      return '';
    }

    // Route to appropriate renderer based on type
    if (value instanceof Type) {
      return this.renderTypeNode(value, key, hint, indentation);
    }
    
    if (typeof value === 'string') {
      return this.renderStringNode(value, key, indentation);
    }
    
    if (typeof value === 'function') {
      return this.renderFunctionNode(value, key, hint, indentation);
    }
    
    if (Array.isArray(value)) {
      return this.renderArrayNode(key, value, hint, indentation, level, indent, traverseSchema);
    }
    
    if (typeof value === 'object' && value !== null) {
      return this.renderElementNode(key, value, hint, indentation, level, indent, traverseSchema);
    }

    return '';
  }

  renderTypeNode(value, key, hint, indentation) {
    const content = hint || value.generateScaffold(this.GEN_TYPE_HINT, { parser: this });
    if (value.isCData) {
      return `${indentation}${this.GEN_OPEN_TAG(key)}${this.GEN_CDATA_OPEN()}${content}${this.GEN_CDATA_CLOSE()}${this.GEN_CLOSE_TAG(key)}\n`;
    }
    return `${indentation}${this.GEN_OPEN_TAG(key)}${content}${this.GEN_CLOSE_TAG(key)}\n`;
  }

  renderStringNode(value, key, indentation) {
    return `${indentation}${this.GEN_OPEN_TAG(key)}${value}${this.GEN_CLOSE_TAG(key)}\n`;
  }

  renderFunctionNode(value, key, hint, indentation) {
    const typeHint = value === String || value === Number || value === Boolean ? this.GEN_TYPE_HINT(value.name, hint) : '...';
    const content = hint ? hint : typeHint || '...';
    return `${indentation}${this.GEN_OPEN_TAG(key)}${content}${this.GEN_CLOSE_TAG(key)}\n`;
  }

  renderArrayNode(key, value, hint, indentation, level, indent, traverseSchema) {
    let output = '';
    const itemValue = value[0];
    const itemHint = Array.isArray(hint) ? hint[0] : hint;

    // Show two examples for arrays
    for (let i = 0; i < 2; i++) {
      output += `${indentation}${this.GEN_OPEN_TAG(key, itemValue, itemHint)}\n`;
      
      if (typeof itemValue === 'object' && itemValue !== null) {
        // Always traverse for attributes/nested elements
        output += traverseSchema(itemValue, itemHint, level + 1);
      }
      
      // Then add text content if present
      const textContent = this.extractTextContent(itemValue, itemHint);
      if (textContent) {
        output += `${indentation}  ${textContent}\n`;
      } else if (typeof itemValue !== 'object' || itemValue === null) {
        const content =
          typeof itemHint === 'string' ? itemHint :
          typeof itemValue === 'string' ? itemValue :
          this.getTypeHintForPrimitive(itemValue) || '...';
        output += `${indentation}  ${content}\n`;
      }
      
      output += `${indentation}${this.GEN_CLOSE_TAG(key)}\n`;
    }
    output += `${indentation}/*etc.*/\n`;
    return output;
  }

  validateSchema(schema, path = '') {
    if (!schema || typeof schema !== 'object') {
      return;
    }

    // Track property names at current level (without $ prefix)
    const propertyNames = new Set();
    const attributeNames = new Set();

    for (const key in schema) {
      // Skip internal/reserved properties
      if (this.constructor.RESERVED_PROPERTIES.has(key)) {
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

  makeArrayScaffold(tag, content) {
    const schema = {
      [tag]: [content]
    };
    return this.makeMapSelectScaffold(schema);
  }

  static makeArrayScaffold(tag, content) {
    return new this().makeArrayScaffold(tag, content);
  }

  makeObjectScaffold(tag, { attributes, textContent, properties }) {
    const schema = {
      [tag]: {
        ...Object.fromEntries(attributes.map(({ key, value }) => [`$${key}`, value])),
        ...(textContent ? { $$text: textContent } : {}),
        ...Object.fromEntries(properties.map(({ key, value }) => [key, value]))
      }
    };
    return this.makeMapSelectScaffold(schema);
  }

  static makeObjectScaffold(tag, options) {
    return new this().makeObjectScaffold(tag, options);
  }

  GEN_ATTRIBUTE_MARKER() {
    throw new Error('Subclass must implement GEN_ATTRIBUTE_MARKER');
  }

  GEN_ATTRIBUTE(key, value) {
    throw new Error('Subclass must implement GEN_ATTRIBUTE');
  }

  static GEN_ATTRIBUTE = (key, value) => {
    return new this().GEN_ATTRIBUTE(key, value);
  }

  static getAttributeString(obj, hints) {
    return new this().getAttributeString(obj, hints);
  }
}

export { Node };
export default AbstractIncomingParserSelectorEngine;