import { SchemaType, SchemaTypeCreators, SchemaItemsType } from './schemaTypes';
export { SchemaType, SchemaTypeCreators, SchemaItemsType };

export declare const types: SchemaTypeCreators;

// Core base interfaces
export interface BaseLLMParams {
  temperature?: number;
  max_tokens?: number;
  maxTokens?: number;  // alias for max_tokens
  top_p?: number;
  topP?: number;  // alias for top_p
  presence_penalty?: number;
  presencePenalty?: number;  // alias for presence_penalty
  stop?: string[];
}

export interface BaseConfig extends BaseLLMParams {
  messages?: Message[];
  system?: string;
  prompt?: string;
  model?: ModelPreference;
  cache?: boolean | {
    read?: boolean;
    write?: boolean;
  };
  onChunk?: (chunk: string) => void;
  autoTruncateMessages?: boolean | number;
  errorMessages?: ErrorMessages;
  fakeDelay?: number;
  waitMessageString?: string;
  waitMessageDelay?: number;
  retryMax?: number;
  retryStartDelay?: number;
  retryBackoffMultiplier?: number;
  buffer?: boolean | {
    timeout?: number;
    maxSize?: number;
  };
}

export interface BaseStreamConfig extends BaseConfig {
  mode?: 'state_open' | 'root_closed' | 'state_closed' | 'root_open';
}

export interface BaseSchemaConfig extends BaseStreamConfig {
  schema?: Schema;
  hints?: Hints;
  genSystemPrompt?: (system?: string) => string;
  genUserPrompt?: (scaffold: string, prompt: string) => string | Message[];
  strategy?: StrategyType;
}

// Create combo of BaseSchemaConfig and BaseStreamConfig
export interface BaseStreamingSchemaConfig extends BaseSchemaConfig, BaseStreamConfig {}

// Core types
export interface XMLElement {
  $$text: string;
  $$attr: Record<string, string>;
  $$tagkey: number;
  $$tagclosed: boolean;
  [key: string]: any;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'developer';
  content: string;
}

// Server-specific configuration
export interface ServerConfig extends BaseConfig {
  timeout?: number;
  keys?: {
    openai?: string;
    anthropic?: string;
    togetherai?: string;
    perplexityai?: string;
    openrouter?: string;
  };
}
export interface SchemaServerConfig extends ServerConfig, BaseSchemaConfig {}
export interface StreamingServerConfig extends ServerConfig, BaseStreamConfig {}
export interface StreamingSchemaServerConfig extends ServerConfig, BaseStreamingSchemaConfig {}

// Model types
export type ModelProvider = 'anthropic' | 'openai' | 'togetherai' | 'perplexityai' | 'openrouter' | 'claude';
export type ModelString = `${ModelProvider}:${string}`;

// Rename this to ModelPreferenceConfig to avoid confusion
export interface ModelPreferenceConfig {
  inherit: ModelProvider;
  name: string;
  maxContextSize?: number;
  endpoint?: string;
  key?: string;
  constraints?: {
    rpmLimit?: number;
  };
}

// Keep this one for provider models
export interface ModelConfig {
  name: string;
  maxContextSize?: number;
}

export type ModelPreference = 
  | ModelString
  | ModelPreferenceConfig
  | Array<ModelString | ModelPreferenceConfig>;

// Provider models are just a map of model configs
export type ProviderModels = {
  [key: string]: ModelConfig | undefined;
}

// Schema types
export type Hint = string | string[];
export type SchemaValue = 
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | SchemaType
  | ((element: XMLElement) => any)
  | Readonly<SchemaType>;

export type Schema = 
  | SchemaValue
  | { readonly [key: string]: Schema }
  | { [key: string]: Schema }
  | readonly Schema[]
  | Schema[]
  | SchemaItemsType;

export type Hints = {
  [key: string]: Hint | Hints;
};

// Pipeline types
export type PipelineFunction = 
  | AsyncGenerator<any, any, any>
  | Generator<any, any, any>
  | AsyncGeneratorFunction
  | GeneratorFunction
  | Promise<any>
  | ((input?: any) => AsyncGenerator<any, any, any>)
  | ((input?: any) => Generator<any, any, any>)
  | ((input?: any) => Promise<any>)
  | ((input?: any) => any)
  | any;

// Pipeline helpers
export interface PipelineHelpers {
  p: PromptFn;
  pc: PromptClosedFn;
  ps: PromptFn;
  r: ReqFn;
  prompt: PromptFn;
  promptStream: PromptFn;
  promptClosed: PromptClosedFn;
  promptComplex: PromptFn;
  req: ReqFn;
  map: MapFn;
  filter: FilterFn;
  reduce: ReduceFn;
  accrue: AccrueFn;
  tap: TapFn;
  waitUntil: WaitUntilFn;
  mergeAggregate: MergeAggregateFn;
  text: TextFn;
  value: ValueFn;
  withAttrs: WithAttrsFn;
  whenClosed: WhenClosedFn;
  parse: () => PipelineFunction;
  select: (selector: string) => PipelineFunction;
  mapSelect: (schema: Schema, includeOpenTags?: boolean, doDedupe?: boolean) => PipelineFunction;
  mapSelectClosed: (schema: Schema) => PipelineFunction;
  combine: <T, U>(stream1: AsyncIterable<T>, stream2: AsyncIterable<U>) => AsyncGenerator<{
    stream1: T | null;
    stream2: U | null;
  }>;
}

// Helper function types
export type PromptFn = (
  promptOrConfig: string | ((input: any) => BaseSchemaConfig) | BaseSchemaConfig,
  schema?: Schema,
  options?: Partial<BaseSchemaConfig>,
  fakeResponse?: string
) => AsyncGenerator<any>;

export type PromptClosedFn = PromptFn;
export type ReqFn = (config: BaseSchemaConfig | string | ((input: any) => BaseSchemaConfig)) => AsyncGenerator<any>;
export type MapFn = <T, U>(fn: (input: T) => U) => AsyncGenerator<U>;
export type FilterFn = <T>(fn: (input: T) => boolean) => AsyncGenerator<T>;
export type ReduceFn = <T, U>(fn: (acc: U, input: T) => U, initial: U) => AsyncGenerator<U>;
export type AccrueFn = <T>() => AsyncGenerator<T[]>;
export type TapFn = <T>(fn: (input: T) => void) => AsyncGenerator<T>;
export type WaitUntilFn = <T>(fn: (input: T) => boolean) => AsyncGenerator<T>;
export type MergeAggregateFn = <T>() => AsyncGenerator<T[]>;

// Transformer helpers
export type TextFn = (fn?: (text: string) => any) => (el: XMLElement) => any;
export type ValueFn = TextFn;
export type WithAttrsFn = (fn: (text: string, attrs: Record<string, string>) => any) => (el: XMLElement) => any;
export type WhenClosedFn = (fn: (el: XMLElement) => any) => (el: XMLElement) => any;

// Stream interface
export interface ChainableStreamInterface<T = XMLElement> extends AsyncIterable<T> {
  select(selector: string): ChainableStreamInterface<XMLElement>;
  map<U>(fn: (value: T) => U): ChainableStreamInterface<U>;
  filter(fn: (value: T) => boolean): ChainableStreamInterface<T>;
  text(): ChainableStreamInterface<string>;
  merge(): ChainableStreamInterface<T>;
  value(): Promise<T>;
  closedOnly(): ChainableStreamInterface<T>;
  complete(): ChainableStreamInterface<T>;
  all(): Promise<T[]>;
  first(): Promise<T>;
  last(n?: number): Promise<T>;
  take(n: number): ChainableStreamInterface<T>;
  skip(n: number): ChainableStreamInterface<T>;
  raw(): ChainableStreamInterface<string>;
  debug(label?: string): ChainableStreamInterface<T>;
  collect(): Promise<T[]>;
  reduce<U>(reducer: (acc: U, value: T) => U, initialValue: U): ChainableStreamInterface<U>;
  mergeAggregate(): ChainableStreamInterface<T[]>;
  batch(size: number, options?: { yieldIncomplete?: boolean }): ChainableStreamInterface<T[]>;
  [Symbol.asyncIterator](): AsyncIterator<T>;
}

// Configuration
export interface LoggingConfig {
  level?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
  custom?: (level: string, ...args: any[]) => void;
}

export interface DefaultsConfig extends BaseStreamingSchemaConfig {}

// Add cache configuration types
export interface CacheConfig {
  maxSize?: number;
  maxEntries?: number;
  persistInterval?: number;
  ttl?: number;
  maxEntrySize?: number;
}

// Update ConfigureOptions to include cache config
export interface ConfigureOptions {
  logging?: LoggingConfig;
  defaults?: DefaultsConfig;
  globalParser?: string;
  idioSymbols?: {
    openTagPrefix?: string;
    closeTagPrefix?: string;
    tagOpener?: string;
    tagCloser?: string;
    tagSuffix?: string;
  };
  cache?: CacheConfig;
  keys?: {
    openai?: string;
    anthropic?: string;
    togetherai?: string;
    perplexityai?: string;
    openrouter?: string;
  };
}

// Main functions
export default function xmllm<T = any>(
  pipelineFn: (helpers: PipelineHelpers) => Array<PipelineFunction>,
  options?: ServerConfig
): AsyncGenerator<T>;

export function stream<T = XMLElement>(
  promptOrConfig: string | StreamingSchemaServerConfig,
  options?: StreamingSchemaServerConfig
): ChainableStreamInterface<T>;

export function simple<T = any>(
  promptOrConfig: string | SchemaServerConfig,
  options?: SchemaServerConfig
): Promise<T>;

export function configure(options: ConfigureOptions): void;

// Stream function type
export type StreamFunction = (payload: BaseConfig & {
  stream?: boolean;
}) => Promise<ReadableStream>;

// Error types
export class ValidationError extends Error {
  code: string;
  details: any;
  timestamp: string;
}

export class MessageValidationError extends ValidationError {
  name: 'MessageValidationError';
  code: 'MESSAGE_VALIDATION_ERROR';
}

export class ModelValidationError extends ValidationError {
  name: 'ModelValidationError';
  code: 'MODEL_VALIDATION_ERROR';
}

export class PayloadValidationError extends ValidationError {
  name: 'PayloadValidationError';
  code: 'PAYLOAD_VALIDATION_ERROR';
}

// Add error message types
export interface ErrorMessages {
  genericFailure?: string;
  rateLimitExceeded?: string;
  invalidRequest?: string;
  authenticationFailed?: string;
  resourceNotFound?: string;
  serviceUnavailable?: string;
  networkError?: string;
  unexpectedError?: string;
}

// Add PromptStrategy type definition
export interface PromptStrategy {
  id: string;
  name: string;
  description: string;
  genSystemPrompt: (subSystemPrompt?: string) => string | Array<{role: string, content: string}>;
  genUserPrompt: (scaffold: string, originalPrompt: string) => string | Array<{role: 'user' | 'assistant' | 'developer', content: string}>;
}

// Export strategy-related functions
export function getStrategy(id: StrategyType): PromptStrategy;
export const STRATEGIES: Record<StrategyType, PromptStrategy>;

// First, let's add the Provider type definition
export interface Provider {
  name: string;
  endpoint: string;
  key?: string;
  models: ProviderModels;
  constraints?: {
    rpmLimit?: number;
    tokensPerMinute?: number;
    requestsPerHour?: number;
  };
  headerGen?: () => Record<string, string>;
  payloader?: (payload: ProviderPayload) => Record<string, any>;
}

// Update ProviderConfig to use the same types
export interface ProviderConfig {
  endpoint: string;
  models: ProviderModels;
  constraints?: {
    rpmLimit?: number;
    tokensPerMinute?: number;
    requestsPerHour?: number;
  };
  key?: string;
  headerGen?: () => Record<string, string>;
  payloader?: (payload: ProviderPayload) => Record<string, any>;
  aliases?: string[];
}

// Update the registerProvider return type
export function registerProvider(
  name: string, 
  config: ProviderConfig
): Provider;

// Add type for provider response formats
export interface ProviderResponse {
  content?: string;
  choices?: Array<{
    message?: {
      content: string;
    };
    text?: string;
    delta?: {
      content?: string;
      text?: string;
      stop_reason?: string;
    };
  }>;
  content_block?: {
    text: string;
  };
}

// Add type for provider payload
export interface ProviderPayload {
  messages: Message[];
  max_tokens?: number;
  maxTokens?: number;
  temperature?: number;
  top_p?: number;
  topP?: number;
  presence_penalty?: number;
  presencePenalty?: number;
  stop?: string[];
  system?: string;
  stream?: boolean;
  model?: string;
}

// Core types
export type StrategyType = 'default' | 'minimal' | 'seed' | 'structured' | 'assertive' | 'exemplar';
