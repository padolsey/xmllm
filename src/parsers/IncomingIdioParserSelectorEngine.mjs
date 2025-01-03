import AbstractIncomingParserSelectorEngine from './AbstractIncomingParserSelectorEngine.mjs';

import Node from './Node.mjs';
import { getConfig } from '../config.mjs';

class IncomingIdioParserSelectorEngine extends AbstractIncomingParserSelectorEngine {

  static NAME = 'idioParser';

  static GEN_ATTRIBUTE_MARKER = () => '$';
  static SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD = false;
  
  static DEFAULT_START_MARKER = '@';
  static DEFAULT_END_MARKER = '@';
  static DEFAULT_START_WRAPPER = 'START(';
  static DEFAULT_END_WRAPPER = 'END(';
  static DEFAULT_CLOSE_WRAPPER = ')';

  constructor(config = {}) {
    super();
    const globalConfig = getConfig();
    
    // Precedence: instance config > global config > class defaults
    this.config = {
      tagPrefix: config.tagPrefix ?? 
                   globalConfig.idioSymbols?.tagPrefix ?? 
                   IncomingIdioParserSelectorEngine.DEFAULT_START_MARKER,
      closePrefix: config.closePrefix ?? 
                 globalConfig.idioSymbols?.closePrefix ?? 
                 IncomingIdioParserSelectorEngine.DEFAULT_END_MARKER,
      openBrace: config.openBrace ?? 
                    globalConfig.idioSymbols?.openBrace ?? 
                    IncomingIdioParserSelectorEngine.DEFAULT_START_WRAPPER,
      closeBrace: config.closeBrace ?? 
                  globalConfig.idioSymbols?.closeBrace ?? 
                  IncomingIdioParserSelectorEngine.DEFAULT_END_WRAPPER,
      braceSuffix: config.braceSuffix ?? 
                    globalConfig.idioSymbols?.braceSuffix ?? 
                    IncomingIdioParserSelectorEngine.DEFAULT_CLOSE_WRAPPER
    };

  }

  static GEN_OPEN_TAG = (name, attrs, hints) => {
    name = name.replace(/^\$/, '@');
    // Get the global config for scaffold generation
    const globalConfig = getConfig();
    const symbols = globalConfig.idioSymbols || {
      tagPrefix: this.DEFAULT_START_MARKER,
      openBrace: this.DEFAULT_START_WRAPPER,
      braceSuffix: this.DEFAULT_CLOSE_WRAPPER
    };
    return `${symbols.tagPrefix}${symbols.openBrace}${name}${symbols.braceSuffix}`;
  };

  static GEN_CLOSE_TAG = (name) => {
    name = name.replace(/^\$/, '@');
    // Get the global config for scaffold generation
    const globalConfig = getConfig();
    const symbols = globalConfig.idioSymbols || {
      closePrefix: this.DEFAULT_END_MARKER,
      closeBrace: this.DEFAULT_END_WRAPPER,
      braceSuffix: this.DEFAULT_CLOSE_WRAPPER
    };
    return `${symbols.closePrefix}${symbols.closeBrace}${name}${symbols.braceSuffix}`;
  };

  static GEN_TYPE_HINT = (type, enumValues = []) => {
    return `...${type}...`;
  }

  add(chunk) {
    this.buffer += chunk;
    
    while (this.position < this.buffer.length) {
      const startPattern = `${this.config.tagPrefix}${this.config.openBrace}`;
      const endPattern = `${this.config.closePrefix}${this.config.closeBrace}`;

      // Check for end tag first since it's more specific
      if (this.buffer.startsWith(endPattern, this.position)) {
        const tagStart = this.position + endPattern.length;
        let endOfEndTag = this.buffer.indexOf(this.config.braceSuffix, tagStart);

        if (endOfEndTag === -1) {
          // Incomplete end tag; wait for more input
          break;
        }

        const tagName = this.buffer.slice(tagStart, endOfEndTag);

        // Close the element (with fallback)
        this.closeElement(tagName);
        this.position = endOfEndTag + this.config.braceSuffix.length;
      } else if (this.buffer.startsWith(startPattern, this.position)) {
        const tagStart = this.position + startPattern.length;
        let endOfStartTag = this.buffer.indexOf(this.config.braceSuffix, tagStart);

        if (endOfStartTag === -1) {
          // Incomplete start tag; wait for more input
          break;
        }

        const tagName = this.buffer.slice(tagStart, endOfStartTag);

        // Create new element
        const element = {
          type: 'tag',
          key: this.elementIndex++,
          name: tagName,
          children: [],
          parent: this.openElements[this.openElements.length - 1] || null,
          closed: false,
        };

        if (element.parent) {
          element.parent.children.push(element);
        } else {
          this.parsedData.push(element);
        }

        this.openElements.push(element);
        this.position = endOfStartTag + this.config.braceSuffix.length;
      } else {
        // Update text handling to use config markers
        if (this.buffer[this.position] === this.config.tagPrefix[0] || 
            this.buffer[this.position] === this.config.closePrefix[0]) {
          // Potential partial marker
          const remaining = this.buffer.substring(this.position);
          if (remaining.startsWith(startPattern) || remaining.startsWith(endPattern)) {
            // Should have been handled above
            // This case shouldn't occur, but to be safe
            continue;
          } else if (remaining.length < Math.max(
            this.config.tagPrefix.length + this.config.openBrace.length,
            this.config.closePrefix.length + this.config.closeBrace.length
          )) {
            // Possible partial marker, wait for more data
            break;
          } else {
            // Invalid marker, treat as text
            this.addTextToCurrentElement(this.buffer[this.position]);
            this.position++;
          }
        } else {
          // Collect text content up to the next marker
          const nexttagPrefixPos = this.buffer.indexOf(this.config.tagPrefix, this.position + 1);
          const nextclosePrefixPos = this.buffer.indexOf(this.config.closePrefix, this.position + 1);
          const nextMarkerPos = nexttagPrefixPos === -1 ? nextclosePrefixPos :
                               nextclosePrefixPos === -1 ? nexttagPrefixPos :
                               Math.min(nexttagPrefixPos, nextclosePrefixPos);
          
          let text;
          if (nextMarkerPos === -1) {
            text = this.buffer.substring(this.position);
            this.position = this.buffer.length;
          } else {
            text = this.buffer.substring(this.position, nextMarkerPos);
            this.position = nextMarkerPos;
          }
          this.addTextToCurrentElement(text);
        }
      }
    }

    // Clean up the buffer
    if (this.position > 0) {
      this.buffer = this.buffer.substring(this.position);
      this.position = 0;
    }
  }

  closeElement(name) {
    // Find the most recent unclosed element with the given name
    let foundIndex = -1;
    for (let i = this.openElements.length - 1; i >= 0; i--) {
      const element = this.openElements[i];
      if (element.name === name) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      // Close the element and any open attribute nodes above it
      while (this.openElements.length > foundIndex) {
        const elem = this.openElements.pop();
        elem.closed = true;
      }
    } else {
      // Fallback: close the most recently opened element
      if (this.openElements.length > 0) {
        const elem = this.openElements.pop();
        elem.closed = true;
      }
    }
  }

  addTextToCurrentElement(text) {
    if (this.openElements.length > 0) {
      const currentElement = this.openElements[this.openElements.length - 1];
      const textNode = {
        type: 'text',
        data: text,
        parent: currentElement,
      };
      currentElement.children.push(textNode);
    } else {
      // If there's no open element, add text to root level
      if (text.trim()) {
        const textNode = {
          type: 'text',
          data: text,
          parent: null,
        };
        this.parsedData.push(textNode);
      }
    }
  }

  /**
   * Finds elements matching the given selector
   */
  findElements(elements, selector, includeOpenTags = false) {

    if (!selector) return [];

    // Split selector into parts for descendant matching
    const selectorParts = selector.trim().split(/\s+/);
    let results = elements;

    // Process each part of the selector
    for (const part of selectorParts) {
      const matchingResults = [];
      
      // For each current result, find matching children
      for (const element of results) {
        if (element.type === 'tag') {
          // Direct match at current level
          if (element.name === part && (includeOpenTags || element.closed)) {
            matchingResults.push(element);
          }
          
          // Search through children recursively
          if (element.children && element.children.length > 0) {
            matchingResults.push(...this.findElements(element.children, part, includeOpenTags));
          }
        }
      }
      
      results = matchingResults;
    }

    return results;
  }

  select(selector, includeOpenTags = false) {
    if (!selector) return [];
    const elements = this.findElements(this.parsedData, selector, includeOpenTags);
    return this.formatResults(elements, includeOpenTags);
  }

  dedupeSelect(selector, includeOpenTags = false) {
    const matchingElements = this.findElements(this.parsedData, selector, includeOpenTags);
    const dedupedElements = [];

    for (const element of matchingElements) {
      const dedupeSignature = this.getElementSignature(element, true);
      const fullSignature = this.getElementSignature(element, false);

      const existingSignature = this.returnedElementSignatures.get(dedupeSignature);
      
      if (!existingSignature || (!element.closed && existingSignature !== fullSignature)) {
        this.returnedElementSignatures.set(dedupeSignature, fullSignature);
        dedupedElements.push(element);
      }
    }

    return this.formatResults(dedupedElements, includeOpenTags);
  }

  formatElement(element, includeOpenTags = false) {
    // For aggregateText, we want all text including attributes
    element.aggregateText = element.aggregateText || this.getTextContent(element);
    
    // Base case for text nodes
    if (element.type === 'text') {
      return new Node('TEXT_NODE', {
        key: -1,
        text: element.data,
        closed: true,
        children: [],
      });
    }

    // Skip open tags if not included
    if (!includeOpenTags && !element.closed) return null;

    // Collect attributes from @-prefixed elements
    const attrs = {};
    const regularChildren = [];

    for (const child of (element.children || [])) {
      if (child.type === 'tag' && child.name.startsWith('@')) {
        // Store as attribute
        const attrName = child.name.substring(1);
        attrs[attrName] = this.getTextContent(child);
      } else {
        regularChildren.push(child);
      }
    }

    // Format remaining children recursively
    const formattedChildren = regularChildren
      .map(child => this.formatElement(child, includeOpenTags))
      .filter(Boolean);

    // Get text content excluding attribute nodes for the main node text
    const allText = this.getTextContent(element, 
      child => !(child.type === 'tag' && child.name.startsWith('@'))
    );

    // Create the formatted node with collected attributes
    const formatted = new Node(element.name, {
      key: element.key,
      text: allText,
      closed: element.closed,
      children: formattedChildren,
      attr: attrs
    });

    // Group children by name
    const childrenByName = new Map();
    for (const child of formattedChildren) {
      if (child.$$tagname !== 'TEXT_NODE') {
        if (!childrenByName.has(child.$$tagname)) {
          childrenByName.set(child.$$tagname, []);
        }
        childrenByName.get(child.$$tagname).push(child);
      }
    }

    // Assign child arrays to formatted node
    for (const [name, children] of childrenByName) {
      formatted[name] = children;
    }

    return formatted;
  }

}

export { Node };
export default IncomingIdioParserSelectorEngine;