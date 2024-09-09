import { Parser } from 'htmlparser2';
import { selectOne, selectAll } from 'css-select';

class Node {
  constructor(name, o) {
    Object.assign(this, o);
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
          attributes,
          children: [],
          parent: this.openElements[this.openElements.length - 1] || null,
          closed: false,
          textContent: ''
        };
        
        if (element.parent) {
          element.parent.children.push(element);
        } else {
          this.parsedData.push(element);
        }
        
        this.openElements.push(element);
      },
      ontext: (text) => {
        if (this.openElements.length > 0) {
          const currentElement = this.openElements[this.openElements.length - 1];
          currentElement.children.push({
            type: 'text',
            data: text,
          });
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

  select(selector) {
    const results = selectAll(selector, this.parsedData).filter(el => el.closed);
    return this.formatResults(results);
  }

  dedupeSelect(selector, includeOpenTags = false) {
    if (!this.returnedElementSignatures.has(selector)) {
      this.returnedElementSignatures.set(selector, new Map());
    }
    
    const results = selectAll(selector, this.parsedData).filter(el => includeOpenTags || el.closed);
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

  formatEle3ment(element) {
    const formatted = new Node(element.name, {
      key: element.key,
      attr: { ...element.attributes },
      text: element.textContent,
      // name: element.name
    });
    
    element.children.forEach(child => {
      if (child.type === 'tag') {
        if (!formatted[child.name]) {
          formatted[child.name] = [];
        }
        formatted[child.name].push(this.formatElement(child));
      }
    });
    
    return formatted;
  }

  formatElement(element, includeOpenTags = false) {

    // If includeOpenTags is true, we will use getTextContent as that is the 
    // only way to get iterative text if 'closed' is false
    // (relevant to streaming)
    const getTextContent = (el) => {
      return (el.children||[]).reduce((text, child) => {
        if (child.type === 'text') {
          return text + child.data;
        } else if (child.type === 'tag') {
          return text + getTextContent(child);
        }
        return text;
      }, '');
    };

    const formatted = new Node(element.name, {
      key: element.key,
      attr: { ...element.attributes },
      text: 
        includeOpenTags ? (
          element.closed ? element.textContent : this.getTextContent(element)
        ) : element.textContent
    });
    
    if (element.children?.length) {
      element.children.forEach(child => {
        if (child.type === 'tag') {
          if (!formatted[child.name]) {
            formatted[child.name] = [];
          }
          formatted[child.name].push(this.formatElement(child));
        }
      });
    }
    
    return formatted;
  }

  mapSelect(mapping) {
    const applyMapping = (element, map) => {
      if (Array.isArray(map)) {
        if (map.length !== 1) {
          throw new Error('A map array must only have one element');
        }
        return Array.isArray(element) 
          ? element.map(e => applyMapping(e, map[0]))
          : [applyMapping(element, map[0])];
      }

      if (typeof map === 'function') {
        return map(element.text);
      }

      if (typeof map !== 'object') {
        throw new Error('Map must be an object, function, or array');
      }

      const out = {};

      for (const k in map) {
        if (k.startsWith('$')) {
          // Handle attributes
          const attrName = k.slice(1);
          if (element.attr && element.attr[attrName] !== undefined) {
            out[k] = map[k](element.attr[attrName]);
          }
        } else if (k === '_') {
          // Handle text content
          out[k] = map[k](element.text);
        } else if (!element[k]) {
          out[k] = Array.isArray(map[k]) ? [] : undefined;
        } else if (Array.isArray(map[k])) {
          out[k] = applyMapping(element[k], map[k]);
        } else {
          out[k] = applyMapping(Array.isArray(element[k]) ? element[k][0] : element[k], map[k]);
        }
      }

      return out;
    };

    const isArrayMapping = Array.isArray(mapping);

    if (isArrayMapping) {
      const rootSelector = Object.keys(mapping[0])[0];
      return this.dedupeSelect(rootSelector, true).map(element => ({
        [rootSelector]: applyMapping(element, mapping[0][rootSelector])
      }));
    }

    const rootSelectors = Object.keys(mapping);
    const results = {};
    
    rootSelectors.forEach(selector => {
      const elements = this.dedupeSelect(selector, true);

      if (!elements?.length) {
        return;
      }

      if (Array.isArray(mapping[selector])) {
        elements.forEach((el) => {
          results[selector] = (
            results[selector] || []
          ).concat(applyMapping(el, mapping[selector]));
        });
      } else {
        results[selector] = applyMapping(elements[0], mapping[selector]);
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
        
        if (typeof value === 'function' || typeof value === 'string' || value === String || value === Number || value === Boolean) {
          xml += `${indentation}<${key}${attrs}>...text content...</${key}>\n`;
        } else if (Array.isArray(value)) {
          const item = value[0];
          if (typeof item === 'function' || typeof item === 'string' || item === String || item === Number || item === Boolean) {
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

export default IncomingXMLParserSelectorEngine;