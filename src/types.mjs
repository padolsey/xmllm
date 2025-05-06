export class Type {
  constructor(hint) {
    this.hint = hint;
    this.default = undefined;
    this.transform = undefined;
    this.isCData = false;
  }

  withDefault(value) {
    this.default = value;
    return this;
  }

  withTransform(transform) {
    this.transform = transform;
    return this;
  }

  withHint(hint) {
    this.hint = hint;
    return this;
  }

  parse(value, element, applyMapping) {
    // 1. If element doesn't exist at all, use default or undefined
    if (!element) {
      return this.default !== undefined ? this.default : undefined;
    }

    // 2. Parse the raw value
    let parsed = this._parse(value, element, applyMapping);
    
    // 3. Apply transform if present
    if (this.transform) {
      parsed = this.transform(parsed);
    }
    
    return parsed;
  }

  _parse(value) {
    return value;
  }

  // Optional method that types can implement to handle node mapping
  mapNodes(element) {
    return null; // Default implementation returns null to indicate no node mapping
  }

  /**
   * Generate scaffold content for this type
   * @param {Function} genTypeHint Function to generate type hint (from parser)
   * @returns {string} Scaffold content
   */
  generateScaffold(genTypeHint, { parser }) {
    // If there's a hint, use it directly
    if (this.hint) {
      return genTypeHint(`${this.constructor.name.replace('Type', '')}: ${this.hint}`);
    }
    // Otherwise just show the type
    return genTypeHint(this.constructor.name.replace('Type', ''));
  }

  // New method for type-specific empty values
  getEmptyValue() {
    return '';  // Default empty value
  }
}

export class StringType extends Type {
  _parse(value) {
    return value?.trim() || '';
  }

  generateScaffold(genTypeHint) {
    if (this.hint) {
      return genTypeHint(`String: ${this.hint}`);
    }
    return genTypeHint('String');
  }
}

export class NumberType extends Type {
  _parse(value) {
    if (!value) return NaN;
    
    const str = value.trim();
    
    // Find first occurrence of a number pattern:
    // -? : Optional negative sign
    // \d* : Zero or more digits
    // \.? : Optional decimal point
    // \d+ : One or more digits
    const match = str.match(/-?\d*\.?\d+/);
    
    if (!match) return NaN;
    
    // Get the substring from the start of the number onwards
    const fromNumber = str.slice(match.index);
    return parseFloat(fromNumber);
  }

  generateScaffold(genTypeHint) {
    if (this.hint) {
      return genTypeHint(`Number: ${this.hint}`);
    }
    return genTypeHint('Number');
  }

  getEmptyValue() {
    return 0;
  }
}

export class BooleanType extends Type {
  constructor(hint) {
    super(hint);
    this.default = false;
  }

  determineTruthiness(value) {
    const text = value?.trim()?.toLowerCase() || '';
    const isWordedAsFalse = ['false', 'no', 'null'].includes(text);
    const isEssentiallyFalsey = isWordedAsFalse || parseFloat(text) === 0;
    if (text === '') {
      return this.default;
    }
    return !isEssentiallyFalsey;
  }

  _parse(value) {
    return this.determineTruthiness(value);
  }

  generateScaffold(genTypeHint) {
    if (this.hint) {
      return genTypeHint(`Boolean: ${this.hint}`);
    }
    return genTypeHint('Boolean');
  }

  getEmptyValue() {
    return false;
  }
}

export class RawType extends Type {
  constructor(hint) {
    super(hint);
    this.isCData = true;
  }

  _parse(value) {
    return value || '';
  }

  generateScaffold(genTypeHint) {
    if (this.hint) {
      return genTypeHint(`Raw: ${this.hint}`);
    }
    return genTypeHint('Raw');
  }
}

export class EnumType extends Type {
  constructor(hint, allowedValues) {
    super(hint);
    if (!allowedValues && Array.isArray(hint)) {
      allowedValues = hint;
    }
    if (
      !allowedValues ||
      !Array.isArray(allowedValues) ||
      allowedValues.length === 0 ||
      allowedValues.some(value => typeof value !== 'string')
    ) {
      throw new Error('EnumType requires allowedValues (array of strings)');
    }
    this.allowedValues = allowedValues;
    // Transform to default if not in allowed values
    this._parse = valueFromLLM => {
      valueFromLLM = valueFromLLM?.trim() || '';
      const found = this.allowedValues.filter(v => {
        const normalizedValue = valueFromLLM.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedAllowed = v.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalizedValue.includes(normalizedAllowed);
      });
      return found.length > 0 ? found[0] : this.default;
    };
  }

  generateScaffold(genTypeHint) {
    const enumValues = this.allowedValues.map(value => `"${value}"`).join(' or ');
    if (this.hint) {
      return genTypeHint(`${this.hint} (Allowed values: ${enumValues})`);
    }
    return genTypeHint(`Allowed values: ${enumValues}`);
  }
}

export class ItemsType extends Type {
  constructor(itemType, hint) {
    super(hint);
    
    if (itemType === undefined || itemType === null) {
      throw new Error('ItemsType requires an itemType');
    }

    // Check for invalid recursive items
    if (itemType instanceof ItemsType) {
      throw new Error('ItemsType cannot directly contain another ItemsType - use an object structure instead');
    }

    // Convert string literals and built-in constructors to Type instances
    if (typeof itemType === 'string') {
      itemType = new StringType(itemType);
    } else if (itemType === String) {
      itemType = new StringType();
    } else if (itemType === Number) {
      itemType = new NumberType();
    } else if (itemType === Boolean) {
      itemType = new BooleanType();
    }

    // Validate final itemType
    if (!(
      (typeof itemType === 'object' && !Array.isArray(itemType)) ||
      itemType instanceof Type
    )) {
      throw new Error('ItemsType itemType must be an object, Type instance, String/Number/Boolean constructor, or string literal');
    }

    this.itemType = itemType;
  }
  
  _parse(value, element, applyMapping) {
    if (!element) {
      // If no element exists and we have a default, return it
      return this.default !== undefined ? this.default : [];
    }
    
    const items = (element.$$children || []).filter(
      c => c.$$tagname.toLowerCase() === 'item'
    );

    // If no items and we have a default, return it
    if (items.length === 0 && this.default !== undefined) {
      return this.default;
    }

    const result = items.map(node => {
      if (typeof this.itemType === 'object' && !Array.isArray(this.itemType)) {
        return applyMapping(node, this.itemType);
      } else {
        return this.itemType.parse(node.$$text, node, applyMapping);
      }
    });

    // Apply array-level validation if present
    if (this.validate && !this.validate(result)) {
      return this.default !== undefined ? this.default : result;
    }

    // Apply array-level transformation if present
    return this.transform ? this.transform(result) : result;
  }

  generateScaffold(genTypeHint, { parser }) {
    // If itemType is a Type instance
    if (this.itemType instanceof Type) {
      const content = this.itemType.generateScaffold(genTypeHint, { parser });
      return parser.makeArrayScaffold('item', content);
    }

    // If itemType is an object
    if (typeof this.itemType === 'object') {
      // Separate attributes, text content, and regular properties
      const attributes = [];
      let textContent = null;
      const regularProps = [];

      Object.entries(this.itemType).forEach(([key, value]) => {
        if (key === '$$text') textContent = value;
        else if (key.startsWith('$')) attributes.push([key.slice(1), value]);
        else regularProps.push([key, value]);
      });

      return parser.makeObjectScaffold('item', {
        attributes: attributes.map(([key, value]) => ({
          key,
          value: value instanceof Type ? 
            value.generateScaffold(genTypeHint, { parser }) :
            value === String ? genTypeHint('String') :
            value === Number ? genTypeHint('Number') :
            value === Boolean ? genTypeHint('Boolean') :
            typeof value === 'string' ? value : '...'
        })),
        textContent: textContent?.generateScaffold(genTypeHint, { parser }),
        properties: regularProps.map(([key, value]) => ({
          key,
          value: value instanceof Type ?
            value.generateScaffold(genTypeHint, { parser }) :
            typeof value === 'string' ?
              genTypeHint(`String: ${value}`) :
              parser.getTypeHintForPrimitive(value) || genTypeHint('String')
        }))
      });
    }
  }
}

// Create the types object with all type creators
const types = {
  // String types
  string: (hint) => new StringType(hint),
  str: (hint) => new StringType(hint),
  
  // Number types
  number: (hint) => new NumberType(hint),
  num: (hint) => new NumberType(hint),
  
  // Boolean types
  boolean: (hint) => new BooleanType(hint),
  bool: (hint) => new BooleanType(hint),
  
  // Raw type
  raw: (hint) => new RawType(hint),
  
  // Enum type
  enum: (hint, values) => new EnumType(hint, values),
  
  // New items type
  items: (itemType, hint) => new ItemsType(itemType, hint),

  // Useful aliases
  array: (itemType, hint) => new ItemsType(itemType, hint),
  list: (itemType, hint) => new ItemsType(itemType, hint)

};

export { types };
export default types; 