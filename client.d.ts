import { SchemaType, SchemaTypeCreators } from './schemaTypes';
import type { 
  BaseLLMParams,
  BaseConfig,
  XMLElement,
  Message,
  ModelPreference,
  Schema,
  Hint,
  Hints,
  ChainableStreamInterface,
  LoggingConfig,
  PipelineHelpers,
  ValidationError,
  MessageValidationError,
  ModelValidationError,
  ModelProvider,
  PayloadValidationError,
  BaseStreamingSchemaConfig,
  BaseSchemaConfig,
  BaseStreamConfig,
  DefaultsConfig
} from './index';

// Re-export common types
export type {
  BaseLLMParams,
  BaseConfig,
  BaseStreamConfig,
  BaseSchemaConfig,
  XMLElement,
  Message,
  ModelPreference,
  ModelProvider,
  Schema,
  Hint,
  Hints,
  ChainableStreamInterface,
  LoggingConfig,
  PipelineHelpers,
  ValidationError,
  MessageValidationError,
  ModelValidationError,
  PayloadValidationError,
  DefaultsConfig
};

// Export types value
export declare const types: SchemaTypeCreators;

// First define the interface
export interface IClientProvider {
  createStream(payload: any): Promise<ReadableStream>;
  setLogger?(logger: any): void;
}

// Then define the class that implements the interface
export class ClientProvider implements IClientProvider {
  constructor(endpoint?: string);
  createStream(payload: any): Promise<ReadableStream>;
  setLogger?(logger: any): void;
}

// Client-specific interfaces
export interface ClientConfig extends BaseConfig {
  clientProvider?: ClientProvider | string;
}

export interface ClientSchemaConfig extends BaseSchemaConfig {
  clientProvider?: ClientProvider | string;
}

export interface ClientStreamingSchemaConfig extends BaseStreamingSchemaConfig {
  clientProvider?: ClientProvider | string;
}

export interface ClientStreamingConfig extends BaseStreamConfig {
  clientProvider?: ClientProvider | string;
}

export interface ClientConfigureOptions {
  logging?: LoggingConfig;
  defaults?: ClientStreamingSchemaConfig;
  globalParser?: string;
  idioSymbols?: {
    openTagPrefix?: string;
    closeTagPrefix?: string;
    tagOpener?: string;
    tagCloser?: string;
    tagSuffix?: string;
  };
  clientProvider?: ClientProvider | string;
}

// Main functions
export function xmllm<T = any>(
  pipelineFn: (helpers: PipelineHelpers) => any[],
  options?: ClientStreamingSchemaConfig
): AsyncGenerator<T>;

export function stream<T = XMLElement>(
  promptOrConfig: string | ClientStreamingSchemaConfig,
  options?: ClientStreamingSchemaConfig
): ChainableStreamInterface<T>;

export function simple<T = any>(
  promptOrConfig: string | ClientSchemaConfig,
  options?: ClientSchemaConfig
): Promise<T>;

export function configure(options: ClientConfigureOptions): void;

// Default export
declare const _default: {
  configure: typeof configure;
  ClientProvider: typeof ClientProvider;
  xmllm: typeof xmllm;
  stream: typeof stream;
  simple: typeof simple;
  types: typeof types;
};

export default _default; 