import AbstractIncomingParserSelectorEngine from './AbstractIncomingParserSelectorEngine.mjs';

import Node from './Node.mjs';
import { getConfig } from '../config.mjs';

class IncomingIdioParserSelectorEngine extends AbstractIncomingParserSelectorEngine {

  static NAME = 'idioParser';

  static SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD = false;
  
  static DEFAULT_START_MARKER = '@';
  static DEFAULT_END_MARKER = '@';
  static DEFAULT_START_WRAPPER = 'START(';
  static DEFAULT_END_WRAPPER = 'END(';
  static DEFAULT_CLOSE_WRAPPER = ')';

  GEN_ATTRIBUTE_MARKER() {
    return '$';
  }

  constructor(config = {}) {
    super();
    const globalConfig = getConfig();
    
    // Convert to arrays and validate lengths
    const normalizeToArray = value => Array.isArray(value) ? value : [value];
    
    const symbols = {
      openTagPrefix: normalizeToArray(config.openTagPrefix ?? globalConfig.idioSymbols?.openTagPrefix ?? IncomingIdioParserSelectorEngine.DEFAULT_START_MARKER),
      closeTagPrefix: normalizeToArray(config.closeTagPrefix ?? globalConfig.idioSymbols?.closeTagPrefix ?? IncomingIdioParserSelectorEngine.DEFAULT_END_MARKER),
      tagOpener: normalizeToArray(config.tagOpener ?? globalConfig.idioSymbols?.tagOpener ?? IncomingIdioParserSelectorEngine.DEFAULT_START_WRAPPER),
      tagCloser: normalizeToArray(config.tagCloser ?? globalConfig.idioSymbols?.tagCloser ?? IncomingIdioParserSelectorEngine.DEFAULT_END_WRAPPER),
      tagSuffix: normalizeToArray(config.tagSuffix ?? globalConfig.idioSymbols?.tagSuffix ?? IncomingIdioParserSelectorEngine.DEFAULT_CLOSE_WRAPPER)
    };

    this.config = symbols;
  }

  GEN_OPEN_TAG(name, attrs, hints) {
    name = name.replace(/^\$/, '@');
    const symbols = this.config;
    return `${symbols.openTagPrefix[0]}${symbols.tagOpener[0]}${name}${symbols.tagSuffix[0]}`;
  }

  GEN_CLOSE_TAG(name) {
    name = name.replace(/^\$/, '@');
    const symbols = this.config;
    return `${symbols.closeTagPrefix[0]}${symbols.tagCloser[0]}${name}${symbols.tagSuffix[0]}`;
  }

  GEN_ATTRIBUTE_MARKER() {
    return '$';
  }

  GEN_ATTRIBUTE(key, value) {
    return `${this.GEN_OPEN_TAG('@' + key)}${value}${this.GEN_CLOSE_TAG('@' + key)}`;
  }

  add(chunk) {
    this.buffer += chunk;
    
    while (this.position < this.buffer.length) {
      const startPatterns = this.config.openTagPrefix.flatMap(prefix => 
        this.config.tagOpener.map(brace => prefix + brace)
      );
      const endPatterns = this.config.closeTagPrefix.flatMap(prefix => 
        this.config.tagCloser.map(brace => prefix + brace)
      );

      // Check for end tag first
      const endMatch = this.findFirstMatch(this.buffer, this.position, endPatterns);
      if (endMatch?.partial) {
        break;
      }
      if (endMatch) {
        const tagStart = this.position + endMatch.length;
        const suffixMatch = this.findFirstSuffix(this.buffer, tagStart);

        if (!suffixMatch) {
          break;
        }

        const tagName = this.buffer.slice(tagStart, suffixMatch.pos);
        this.closeElement(tagName);
        this.position = suffixMatch.pos + suffixMatch.suffix.length;
        continue;
      }

      // Check for start tag
      const startMatch = this.findFirstMatch(this.buffer, this.position, startPatterns);
      if (startMatch?.partial) {
        break;
      }
      if (startMatch) {
        const tagStart = this.position + startMatch.length;
        let suffixMatch;
        
        if (startMatch.emptyOpener) {
          // For empty tagOpener, we already found the suffix
          const tagName = this.buffer.slice(
            startMatch.nameStart,
            startMatch.suffixPos - this.config.tagSuffix[0].length
          );
          suffixMatch = { 
            pos: startMatch.suffixPos - this.config.tagSuffix[0].length,
            suffix: this.config.tagSuffix[0]
          };
        } else {
          suffixMatch = this.findFirstSuffix(this.buffer, tagStart);
        }

        if (!suffixMatch) {
          break;
        }

        const tagName = this.buffer.slice(tagStart, suffixMatch.pos);
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
        this.position = suffixMatch.pos + suffixMatch.suffix.length;
        continue;
      }

      // Look ahead for potential markers
      const nextMarkerPos = this.findNextMarkerPosition(this.buffer, this.position + 1, [...startPatterns, ...endPatterns]);
      
      if (nextMarkerPos === -1) {
        // No markers found - check if last character could be start of marker
        const lastChar = this.buffer[this.buffer.length - 1];
        const couldBeMarker = [...this.config.openTagPrefix, ...this.config.closeTagPrefix].includes(lastChar);
        
        if (this.position < this.buffer.length) {
          const endPos = couldBeMarker ? this.buffer.length - 1 : this.buffer.length;
          this.addTextToCurrentElement(this.buffer.substring(this.position, endPos));
          this.position = endPos;
        }
        break;
      } else {
        this.addTextToCurrentElement(this.buffer.substring(this.position, nextMarkerPos));
        this.position = nextMarkerPos;
      }
    }

    // Clean up buffer
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

  // Add helper methods for finding markers
  findFirstMatch(buffer, position, patterns) {    

    // First check for complete patterns
    for (const pattern of patterns) {
      if (buffer.startsWith(pattern, position)) {
        // For empty tagOpener/tagCloser, we need to include the suffix in the pattern
        if (pattern === this.config.openTagPrefix[0] || pattern === this.config.closeTagPrefix[0]) {
          
          const afterPrefix = buffer.substring(position + pattern.length);
          const isClosing = this.config.tagCloser.some(closer => afterPrefix.startsWith(closer));

          const nameStart = position + pattern.length + (isClosing ? 1 : 0);
          const suffixPos = buffer.indexOf(this.config.tagSuffix[0], nameStart);
          
          if (suffixPos !== -1) {
            return { 
              pattern,
              length: pattern.length,
              emptyOpener: true,
              isClosing,
              nameStart,
              suffixPos: suffixPos + this.config.tagSuffix[0].length
            };
          }
        }
        return { pattern, length: pattern.length };
      }
    }

    // If at start of buffer, check for partial matches
    if (position === 0) {
      for (const pattern of patterns) {
        // Check if buffer could be start of pattern
        if (pattern.startsWith(buffer)) {
          return { partial: true };
        }
        // Check if buffer content could be start of pattern
        const bufferContent = buffer.substring(position);
        if (pattern.startsWith(bufferContent)) {
          return { partial: true };
        }
      }
    }
    
    return null;
  }

  findFirstSuffix(buffer, position) {
    let earliest = { pos: -1, suffix: null };
    for (const suffix of this.config.tagSuffix) {
      const pos = buffer.indexOf(suffix, position);
      if (pos !== -1 && (earliest.pos === -1 || pos < earliest.pos)) {
        earliest = { pos, suffix };
      }
    }
    return earliest.suffix ? earliest : null;
  }

  findNextMarkerPosition(buffer, startPos, patterns) {
    // Find the earliest occurrence of any marker pattern
    const positions = patterns.map(pattern => {
      const prefixChar = pattern[0]; // Usually '@'
      let pos = buffer.indexOf(prefixChar, startPos);
      while (pos !== -1) {
        // Verify it's actually a marker
        if (patterns.some(p => buffer.startsWith(p, pos))) {
          return pos;
        }
        pos = buffer.indexOf(prefixChar, pos + 1);
      }
      return -1;
    }).filter(pos => pos !== -1);

    return positions.length ? Math.min(...positions) : -1;
  }

}

export { Node };
export default IncomingIdioParserSelectorEngine;