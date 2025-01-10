export interface SchemaType {
  hint: string | undefined;
  default: any;
  transform: ((value: any) => any) | undefined;
  validate: ((value: any) => boolean) | undefined;
  isCData: boolean;
  withDefault(value: any): this;
  withTransform(transform: (value: any) => any): this;
  withHint(hint: string): this;
  parse(value: string | undefined): any;
}

export interface SchemaStringType extends SchemaType {
  parse(value: string | undefined): string;
}

export interface SchemaNumberType extends SchemaType {
  parse(value: string | undefined): number;
}

export interface SchemaBooleanType extends SchemaType {
  parse(value: string | undefined): boolean;
}

export interface SchemaRawType extends SchemaType {
  parse(value: string | undefined): string;
}

export interface SchemaEnumType extends SchemaType {
  allowedValues: string[];
  parse(value: string | undefined): string;
}

export interface SchemaItemsType extends SchemaType {
  itemType: SchemaType | { [key: string]: Schema };
  parse(value: string | undefined): any[];
}

export interface SchemaTypeCreators {
  string(hint?: string): SchemaStringType;
  str(hint?: string): SchemaStringType;
  number(hint?: string): SchemaNumberType;
  num(hint?: string): SchemaNumberType;
  boolean(hint?: string): SchemaBooleanType;
  bool(hint?: string): SchemaBooleanType;
  raw(hint?: string): SchemaRawType;
  enum(hint: string | string[], values?: string[]): SchemaEnumType;
  items<T extends SchemaType | { [key: string]: Schema }>(
    itemType: T,
    hint?: string
  ): SchemaItemsType;
}

export const schemaTypes: SchemaTypeCreators; 