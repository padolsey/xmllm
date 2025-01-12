import { Parser } from 'htmlparser2';
import { selectAll } from 'css-select';
import { Type } from '../types.mjs';

import AbstractIncomingParserSelectorEngine from './AbstractIncomingParserSelectorEngine.mjs';

import Node from './Node.mjs';

class IncomingXMLParserSelectorEngine extends AbstractIncomingParserSelectorEngine {

  static NAME = 'xmlParser';
  
  static SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD = true;

  static RESERVED_PROPERTIES = new Set([
    '$$tagclosed',
    '$$tagkey',
    '$$children',
    '$$tagname',
    '$$attr',
    '__isNodeObj__',
  ]);

  GEN_ATTRIBUTE_MARKER = () => '$';

  GEN_TYPE_HINT(type, hint) {

    // If we have a hint, use it
    if (hint?.$$text) {
      return hint.$$text;
    }
    
    // Otherwise use type formatting
    if (type === 'String') return `{String}${hint?` ${hint}`:''}`;
    if (type === 'Number') return `{Number}${hint?` ${hint}`:''}`;
    if (type === 'Boolean') return `{Boolean}${hint?` ${hint}`:''}`;
    return `{${type}}`;
  }

  GEN_OPEN_TAG(name, attrs, hints) {
    return `<${name}${attrs ? this.getAttributeString(attrs, hints) : ''}>`;
  }

  GEN_CLOSE_TAG(name) {
    return `</${name}>`;
  }

  GEN_CDATA_OPEN() {
    return '<![CDATA[';
  }

  GEN_CDATA_CLOSE() {
    return ']]>';
  }

  getAttributeString(obj, hints = {}) {
    if (typeof obj !== 'object' || obj === null) return '';

    let attrs = '';
    for (const key in obj) {
      if (key.startsWith(this.GEN_ATTRIBUTE_MARKER()) && key !== '$$text') {
        const attrName = key.slice(1);
        const value = obj[key];
        const hint = hints?.[key];

        // Use the hint text if available
        if (hint) {
          attrs += ` ${attrName}="${hint}"`;
          continue;
        }

        // Handle functions (including primitives)
        if (typeof value === 'function') {
          attrs += ` ${attrName}="${this.GEN_TYPE_HINT(value.name, hint)}"`;
          continue;
        }

        // Handle string literals
        if (typeof value === 'string') {
          attrs += ` ${attrName}="${value}"`;
          continue;
        }

        // Default case
        attrs += ` ${attrName}="..."`;
      }
    }
    return attrs;
  }

  GEN_ATTRIBUTE(key, value) {
    return `${key}="${value}"`;  // XML style: key="value"
  }

  constructor() {
    super();
    
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
    // let cached = this.normalizedSchemaCache.get(schema);
    // if (cached) return cached;

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

      if (schema instanceof Type) {
        return schema;
      }

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

  // Override processValue to skip attribute processing
  processValue(value, key, hint, indentation, level, indent, processObject) {
    // Skip if this is an attribute
    if (key.startsWith(this.GEN_ATTRIBUTE_MARKER())) {
      return '';  // Attributes are handled by getAttributeString
    }
    return super.processValue(value, key, hint, indentation, level, indent, processObject);
  }

}

export { Node };
export default IncomingXMLParserSelectorEngine;