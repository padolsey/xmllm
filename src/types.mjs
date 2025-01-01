export class Type {
  constructor(hint) {
    this.hint = hint;
    this.default = undefined;
    this.transform = undefined;
    this.validate = undefined;
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

  withValidate(validate) {
    this.validate = validate;
    return this;
  }

  withHint(hint) {
    this.hint = hint;
    return this;
  }

  parse(value) {
    // First parse the raw value
    let parsed = this._parse(value);
    
    // Apply transform if present
    if (this.transform) {
      parsed = this.transform(parsed);
    }
    
    // Apply validation if present
    if (this.validate && !this.validate(parsed)) {
      // Instead of throwing, return default or undefined
      return this.default !== undefined ? this.default : undefined;
    }
    
    return parsed;
  }

  _parse(value) {
    return value;
  }
}

export class StringType extends Type {
  _parse(value) {
    return value?.trim() || '';
  }
}

export class NumberType extends Type {
  _parse(value) {
    return parseFloat(value?.trim() || '');
  }
}

export class BooleanType extends Type {
  _parse(value) {
    const text = value?.trim()?.toLowerCase() || '';
    const isWordedAsFalse = ['false', 'no', 'null'].includes(text);
    const isEssentiallyFalsey = text === '' || isWordedAsFalse || parseFloat(text) === 0;
    return !isEssentiallyFalsey;
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
    this.validate = value => this.allowedValues.includes(value);
  }

  _parse(value) {
    return value?.trim() || '';
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
  enum: (hint, values) => new EnumType(hint, values)
};

export { types };
export default types; 