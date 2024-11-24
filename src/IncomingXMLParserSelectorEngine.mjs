import { Parser } from 'htmlparser2';
import { selectOne, selectAll } from 'css-select';

class Node {

  constructor(name, o) {
    // super();
    this.length = 0;
    this.__isNodeObj__ = true;
    if (o) {
      this.$key = o.key;
      this.$attr = o.attr;
      this.$text = o.text;
      this.$closed = o.closed;
      this.$children = o.children || [];
      this.$name = name;

      const { key, attr, text, closed, children, ...rest } = o;
      
      Object.assign(this, rest);
    }
  }
}

class IncomingXMLParserSelectorEngine {
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
    const results = selectAll(selector, this.parsedData).filter(el => includeOpenTags || el.closed);
    return this.formatResults(results, includeOpenTags);
  }

  dedupeSelect(selector, includeOpenTags = false) {

    if (!this.returnedElementSignatures.has(selector)) {
      this.returnedElementSignatures.set(selector, new Map());
    }
    
    const unfilteredResults = selectAll(selector, this.parsedData);
    const results = unfilteredResults.filter(el => includeOpenTags || el.closed);
    
    const newResults = results.filter(result => {
      const dedupeSignature = this.getElementSignature(result, true);
      const fullSignature = this.getElementSignature(result, false);
      
      const existingSignature = this.returnedElementSignatures.get(selector).get(dedupeSignature);
      
      if (!existingSignature) {
        this.returnedElementSignatures.get(selector).set(dedupeSignature, fullSignature);
        return true;
      }
      
      if (!result.closed && existingSignature !== fullSignature) {
        this.returnedElementSignatures.get(selector).set(dedupeSignature, fullSignature);
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

  mapSelectClosed(mapping) {
    return this.mapSelect(mapping, false);
  }

  mapSelect(mapping, includeOpenTags = true) {
    // Helper to normalize the new [] syntax to old syntax
    const normalizeSchema = (schema) => {
      // Handle primitives and functions
      if (typeof schema !== 'object' || schema === null) return schema;
      if (typeof schema === 'function') return schema;
      if (Array.isArray(schema)) return schema.map(normalizeSchema);

      const result = {};
      for (let [key, value] of Object.entries(schema)) {
        result[key] = normalizeSchema(value);
      }
      return result;
    };

    const normalizedMapping = Array.isArray(mapping)
      ? mapping.map(m => normalizeSchema(m))
      : normalizeSchema(mapping);

    const applyMapping = (element, map) => {

      // Only handle as array notation if explicitly marked
      // if (typeof map === 'object' && map.__isArrayNotation__) {
      //   return (element.item || []).map(item => {
      //     const transformation = map.item;
      //     if (typeof transformation === 'string') {
      //       return String(item.$text);
      //     }
      //     if (typeof transformation === 'function') {
      //       if (transformation === String || transformation === Number || transformation === Boolean) {
      //         return transformation(item.$text);
      //       }
      //       return transformation(item.$text);
      //     }
      //     return applyMapping(item, transformation);
      //   });
      // }

      if (Array.isArray(map)) {
        if (map.length !== 1) {
          throw new Error('A map array must only have one element');
        }
        return Array.isArray(element)
          ? element.map(e => applyMapping(e, map[0]))
          : [applyMapping(element, map[0])];
      }

      // Add handling for string literals - treat them as String type
      if (typeof map === 'string') {
        return element.length ? element.map(e => String(e)) : String(element.$text);
      }

      if (typeof map === 'function') {
        // Handle built-in constructors specially
        if (map === String || map === Number || map === Boolean) {
          return map(element.$text);
        }
        // Pass full element to custom functions
        return map(element);
      }

      if (typeof map !== 'object') {
        throw new Error('Map must be an object, function, or array');
      }

      const out = {};

      for (const k in map) {

        const resultKey = k.replace(/\[\](?=\s+|$)/g, ''); // TODO: remove
        const mapItem = map[k];
        const isItemMapping = resultKey !== k;

        if (k.startsWith('$')) {
          // Handle attributes
          const attrName = k.slice(1);
          if (element.$attr && element.$attr[attrName] !== undefined) {
            out[resultKey] = mapItem(element.$attr[attrName]);
          }
        } else if (k === '_') {
          // Handle text content
          out[resultKey] = mapItem(element.$text);
        } else if (!element[resultKey]) {
          out[resultKey] = Array.isArray(mapItem) ? [] : undefined;
        } else if (Array.isArray(mapItem)) {
          out[resultKey] = applyMapping(element[resultKey], mapItem);
        } else {
          out[resultKey] = applyMapping(
            Array.isArray(element[resultKey]) ? element[resultKey][0] : element[resultKey],
            mapItem
          );
        }
      }
      return out;
    };

    const isArrayMapping = Array.isArray(normalizedMapping);

    if (isArrayMapping) {
      const rootSelector = Object.keys(normalizedMapping[0])[0];
      return this.dedupeSelect(rootSelector, includeOpenTags)
        .map(element => ({
          [rootSelector]: applyMapping(element, normalizedMapping[0][rootSelector])
        }));
    }

    const rootSelectors = Object.keys(normalizedMapping);
    const results = {};

    rootSelectors.forEach(selector => {
      const elements = this.dedupeSelect(selector, includeOpenTags);

      const resultName = selector.replace(/\[\](?=\s+|$)/g, '');
      const isArraySuffix = selector !== resultName;

      if (!elements?.length) return;

      if (Array.isArray(normalizedMapping[selector]) || isArraySuffix) {
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

  static makeMapSelectXMLScaffold(schema, indent = 2) {
    function processObject(obj, level = 0) {
      let xml = '';
      const indentation = ' '.repeat(level * indent);

      for (let key in obj) {
        const value = obj[key];

        if (key === '_') continue;
        if (key.startsWith('$')) continue;

        const attrs = getAttributes(obj[key]);
        
        // Handle string literals as explanation hints
        if (typeof value === 'string') {
          xml += `${indentation}<${key}${attrs}>${value}</${key}>\n`;
        } else if (typeof value === 'function' || value === String || value === Number || value === Boolean) {
          xml += `${indentation}<${key}${attrs}>...text content...</${key}>\n`;
        } else if (Array.isArray(value)) {
          const item = value[0];
          if (typeof item === 'string') {
            xml += `${indentation}<${key}>${item}</${key}>\n`;
            xml += `${indentation}<${key}>${item}</${key}>\n`;
            xml += `${indentation}/*etc.*/\n`;
          } else if (typeof item === 'function' || item === String || item === Number || item === Boolean) {
            xml += `${indentation}<${key}>...text content...</${key}>\n`;
            xml += `${indentation}<${key}>...text content...</${key}>\n`;
            xml += `${indentation}/*etc.*/\n`;
          } else {
            xml += `${indentation}<${key}${getAttributes(item)}>\n`;
            xml += processObject(item, level + 1);
            if ('_' in item) {
              xml += `${indentation}  ...text content...\n`;
            }
            xml += `${indentation}</${key}>\n`;
            xml += `${indentation}<${key}${getAttributes(item)}>\n`;
            xml += processObject(item, level + 1);
            if ('_' in item) {
              xml += `${indentation}  ...text content...\n`;
            }
            xml += `${indentation}</${key}>\n`;
            xml += `${indentation}/*etc.*/\n`;
          }
        } else if (typeof value === 'object') {
          xml += `${indentation}<${key}${attrs}>\n`;
          if ('_' in value) {
            xml += `${indentation}  ...text content...\n`;
          }
          xml += processObject(value, level + 1);
          xml += `${indentation}</${key}>\n`;
        }
      }

      return xml;
    }

    function getAttributes(obj) {
      if (typeof obj !== 'object' || obj === null) return '';
      let attrs = '';
      for (let key in obj) {
        if (key.startsWith('$')) {
          attrs += ` ${key.slice(1)}="..."`;
        }
      }
      return attrs;
    }

    return processObject(schema);
  }
}

export { Node };
export default IncomingXMLParserSelectorEngine;