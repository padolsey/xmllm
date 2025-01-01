import {
  Type,
  EnumType,
  StringType,
  NumberType,
  BooleanType
} from '../types.mjs';

import AbstractIncomingParserSelectorEngine from './AbstractIncomingParserSelectorEngine.mjs';

import Node from './Node.mjs';
import { getConfig } from '../config.mjs';

class IncomingIdioParserSelectorEngine extends AbstractIncomingParserSelectorEngine {

  static GEN_ATTRIBUTE_MARKER = () => null;

  static GEN_OPEN_TAG = (name) => {
    const config = getConfig();
    return `${config.idioSymbol}START(${name})`;
  };
  static GEN_CLOSE_TAG = (name) => {
    const config = getConfig();
    return `${config.idioSymbol}END(${name})`;
  };

  constructor() {
    super();
  }

  add(chunk) {
    const config = getConfig();
    this.buffer += chunk;
    
    // Update the parsing logic to use the configured symbol
    while (this.position < this.buffer.length) {
      const symbol = config.idioSymbol;
      if (this.buffer.startsWith(`${symbol}START(`, this.position)) {
        // Attempt to parse a start tag
        const endOfStartTag = this.buffer.indexOf(')', this.position + 7);
        if (endOfStartTag === -1) {
          // Incomplete start tag; wait for more input
          break;
        }
        const name = this.buffer.substring(this.position + 7, endOfStartTag);

        // Create new element
        const element = {
          type: 'tag',
          key: this.elementIndex++,
          name,
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
        this.position = endOfStartTag + 1;
      } else if (this.buffer.startsWith(`${symbol}END(`, this.position)) {
        // Attempt to parse an end tag
        const endOfEndTag = this.buffer.indexOf(')', this.position + 5);
        if (endOfEndTag === -1) {
          // Incomplete end tag; wait for more input
          break;
        }
        const tagName = this.buffer.substring(this.position + 5, endOfEndTag);
        this.closeElement(tagName);
        this.position = endOfEndTag + 1;
      } else {
        const symbol = config.idioSymbol;
        if (this.buffer[this.position] === symbol) {
          // Potential partial marker
          const remaining = this.buffer.substring(this.position);
          if (remaining.startsWith(`${symbol}START(`) || remaining.startsWith(`${symbol}END(`)) {
            // Should have been handled above
            // This case shouldn't occur, but to be safe
            continue;
          } else if (remaining.length < 7) {
            // Possible partial marker, wait for more data
            break;
          } else {
            // Invalid marker, treat symbol as text
            this.addTextToCurrentElement(symbol);
            this.position++;
          }
        } else {
          // Collect text content up to the next symbol
          const nextMarkerPos = this.buffer.indexOf(symbol, this.position);
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
    for (let i = this.openElements.length - 1; i >= 0; i--) {
      const element = this.openElements[i];
      if (element.name === name) {
        element.closed = true;
        this.openElements.splice(i, 1);
        return;
      }
    }
    // Ignore unmatched end tags
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

    element.aggregateText = element.aggregateText
      || this.getTextContent(element);
    
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

    // Format children recursively
    const formattedChildren =
      element.children?.map((child) => this.formatElement(child, includeOpenTags)).filter(Boolean) ||
      [];

    // Get all text content including from child nodes
    const allText = this.getTextContent(element);

    const formatted = new Node(element.name, {
      key: element.key,
      text: allText,
      closed: element.closed,
      children: formattedChildren,
    });

    formatted.length = 0;

    // Group children by name
    const childrenByName = new Map();
    for (const child of formattedChildren) {
      if (child.$tagname !== 'TEXT_NODE') {
        if (!childrenByName.has(child.$tagname)) {
          childrenByName.set(child.$tagname, []);
        }
        childrenByName.get(child.$tagname).push(child);
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