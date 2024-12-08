// Core interfaces
export interface XMLElement {
  $text: string;
  $attr: Record<string, string>;
  $tagkey: number;
  $tagclosed: boolean;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Configuration interfaces
export interface XmllmOptions {
  apiKeys?: {
    ANTHROPIC_API_KEY?: string;
    OPENAI_API_KEY?: string;
    TOGETHERAI_API_KEY?: string;
    PERPLEXITYAI_API_KEY?: string;
  };
  timeout?: number;
  Stream?: StreamFunction;
  streamConfig?: StreamConfig;
}

export interface StreamConfig {
  timeout?: number;
  forcedConcurrency?: number;
  waitMessageString?: string;
  waitMessageDelay?: number;
  retryMax?: number;
  retryStartDelay?: number;
  retryBackoffMultiplier?: number;
  fakeDelay?: number;
  errorMessages?: ErrorMessages;
}

// Pipeline helper types
export type PromptFn = (
  promptOrConfig: string | ((input: any) => PromptConfig) | PromptConfig,
  schema?: SchemaType,
  options?: Partial<PromptConfig>,
  fakeResponse?: string
) => AsyncGenerator<any>;

export type PromptClosedFn = PromptFn;
export type ReqFn = (config: PromptConfig | string | ((input: any) => PromptConfig)) => AsyncGenerator<any>;
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

// Pipeline helpers interface
export interface PipelineHelpers {
  p: PromptFn;
  pc: PromptClosedFn;
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
  mapSelect: (schema: SchemaType, includeOpenTags?: boolean, doDedupe?: boolean) => PipelineFunction;
  mapSelectClosed: (schema: SchemaType) => PipelineFunction;
  combine: <T, U>(
    stream1: AsyncIterable<T>,
    stream2: AsyncIterable<U>
  ) => AsyncGenerator<{
    stream1: T | null;
    stream2: U | null;
  }>;
}

// Model types
export type ModelProvider = 'claude' | 'openai' | 'togetherai' | 'perplexityai';
export type ModelSpeed = 'superfast' | 'fast' | 'good';
export type ModelString = `${ModelProvider}:${ModelSpeed}` | `${ModelProvider}:${string}`;

export interface ModelConfig {
  inherit: ModelProvider;
  name: string;
  maxContextSize?: number;
  endpoint?: string;
  key?: string;
  constraints?: {
    rpmLimit?: number;
  };
}

export type ModelPreference = 
  | ModelString
    // e.g. 'claude:fast'
  | ModelConfig
    // e.g. { inherit: 'claude', name: 'claude-3' }
  | Array<ModelString | ModelConfig>;
    // e.g. ['claude:fast', { inherit: 'openai', name: 'gpt-4' }]

// First, let's define what a string hint can be
export type SchemaHint = string;

// Then define what a schema value can be
export type SchemaValue = 
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ((element: XMLElement) => any)
  | SchemaHint
  | Readonly<SchemaHint>;

// Finally, define the full schema type that can be recursive
export type SchemaType = 
  | SchemaValue
  | { readonly [key: string]: SchemaType }
  | { [key: string]: SchemaType }
  | readonly SchemaType[]
  | SchemaType[];

// Add these new types
export type PipelineFunction = 
  | AsyncGenerator<any, any, any>
  | Generator<any, any, any>
  | AsyncGeneratorFunction
  | GeneratorFunction
  | Promise<any>
  | ((input?: any) => AsyncGenerator<any, any, any>)
  | ((input?: any) => Generator<any, any, any>)
  | ((input?: any) => Promise<any>)
  | ((input?: any) => any)  // Allow regular functions
  | any;  // Allow raw values

// Main xmllm function
export default function xmllm<T = any>(
  pipelineFn: (helpers: PipelineHelpers) => Array<PipelineFunction>,
  options?: XmllmOptions
): AsyncGenerator<T>;

// Stream function type
export type StreamFunction = (payload: {
  messages: Message[];
  model: ModelPreference;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  cache?: boolean;
  fakeDelay?: number;
  waitMessageString?: string;
  waitMessageDelay?: number;
  retryMax?: number;
  retryStartDelay?: number;
  retryBackoffMultiplier?: number;
  [key: string]: any;
}) => Promise<ReadableStream>;

// A hint can be a string, array of strings, or an object containing more hints
export type HintType = {
  [key: string]: string | string[] | HintType
};

// The most primitive stream configuration (from req())
export interface BaseStreamConfig {
  messages?: Message[];
  model?: ModelPreference;
  temperature?: number;
  max_tokens?: number;
  maxTokens?: number;  // alias for max_tokens
  top_p?: number;
  topP?: number;  // alias for top_p
  presence_penalty?: number;
  presencePenalty?: number;  // alias for presence_penalty
  stop?: string[];
  errorMessages?: ErrorMessages;
  cache?: boolean;
  fakeDelay?: number;
  waitMessageString?: string;
  waitMessageDelay?: number;
  retryMax?: number;
  retryStartDelay?: number;
  retryBackoffMultiplier?: number;
}

// Schema-aware stream configuration (from xmlReq())
export interface SchemaStreamConfig extends BaseStreamConfig {
  prompt?: string;
  schema?: SchemaType;
  hints?: HintType;
  system?: string;
  sudoPrompt?: boolean;
  onChunk?: (chunk: string) => void;
  mode?: 'state_open' | 'root_closed' | 'state_closed' | 'root_open';
  generateSystemPrompt?: (system?: string) => string;
  generateUserPrompt?: (scaffold: string, prompt: string, sudoPrompt?: boolean) => string | Message[];
}

// Default configuration (used in configure())
export interface DefaultsConfig extends SchemaStreamConfig {}

// Stream options (additional options for stream setup)
export interface StreamOptions extends SchemaStreamConfig {
  Stream?: StreamFunction;
  streamConfig?: StreamConfig;
  apiKeys?: {
    ANTHROPIC_API_KEY?: string;
    OPENAI_API_KEY?: string;
    TOGETHERAI_API_KEY?: string;
    PERPLEXITYAI_API_KEY?: string;
  };
}

// Update PromptConfig to use the schema-aware base
export interface PromptConfig extends SchemaStreamConfig {
  mapper?: (input: any, output: any) => any;
  doMapSelectClosed?: boolean;
  includeOpenTags?: boolean;
  doDedupe?: boolean;
}

// Add back error types
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

export class ParameterValidationError extends ValidationError {
  name: 'ParameterValidationError';
  code: 'PARAMETER_VALIDATION_ERROR';
}

// Add back validation service interface
export interface ValidationService {
  validateMessages(messages: Message[]): {
    systemMessage: string;
    messages: Message[];
  };
  validateModel(model: ModelPreference, availableModels: Record<string, any>): boolean;
  validateSingleModel(model: string, availableModels: Record<string, any>, index?: number | null): boolean;
  validateConstraints(constraints: { rpmLimit?: number }): boolean;
  validateParameters(params: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    cache?: boolean;
    constraints?: { rpmLimit?: number };
  }): boolean;
}

// Add back provider interfaces
export interface Provider {
  name: string;
  endpoint: string;
  key: string;
  models: Record<string, {
    name: string;
    maxContextSize?: number;
  }>;
  constraints?: {
    rpmLimit?: number;
  };
  makeRequest(payload: any): Promise<any>;
  createStream(payload: any, retries?: number): Promise<ReadableStream>;
  getHeaders(): Record<string, string>;
  preparePayload(payload: any): any;
}

export interface ProviderManager {
  getProviderByPreference(preference: ModelPreference): {
    provider: Provider;
    modelType: string;
  };
  request(payload: any): Promise<any>;
  streamRequest(payload: any): Promise<ReadableStream>;
}

// Add back cache interfaces
export interface CacheConfig {
  maxSize?: number;
  maxAge?: number;
  maxEntrySize?: number;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  size: number;
}

export interface CacheService {
  get(key: string): Promise<CacheEntry<any> | undefined>;
  set(key: string, value: any): Promise<void>;
  clear(): Promise<void>;
}

// Add these interfaces
export interface StreamOptions extends XmllmOptions {
  schema?: SchemaType;
  hints?: HintType;
  sudoPrompt?: boolean;
  system?: string;
  closed?: boolean;
  mode?: 'state_open' | 'root_closed' | 'state_closed' | 'root_open';
  model?: ModelPreference;
  temperature?: number;
  maxTokens?: number;
  onChunk?: (chunk: string) => void;
  errorMessages?: ErrorMessages;
}

export interface ChainableStreamInterface<T = XMLElement> extends AsyncIterable<T> {
  select(selector: string): ChainableStreamInterface<XMLElement>;
  map<U>(fn: (value: T) => U): ChainableStreamInterface<U>;
  filter(fn: (value: T) => boolean): ChainableStreamInterface<T>;
  text(): ChainableStreamInterface<string>;
  merge(): ChainableStreamInterface<T>;
  value(): Promise<T>;
  closedOnly(): ChainableStreamInterface<T>;
  complete(): ChainableStreamInterface<T>;  // deprecated
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

// Add these function declarations
export function stream<T = XMLElement>(
  promptOrConfig: string | BaseStreamConfig,
  options?: StreamOptions
): ChainableStreamInterface<T>;

export function simple<T = any>(
  prompt: string,
  schema: SchemaType,
  options?: Omit<StreamOptions, 'schema'> // schema comes from second param
): Promise<T>;

// Add these interfaces for configure()
export interface LoggingConfig {
  level?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
  custom?: (level: string, ...args: any[]) => void;
}

export interface DefaultsConfig {
  temperature?: number;
  maxTokens?: number;
  presencePenalty?: number;
  topP?: number;
  mode?: 'state_open' | 'root_closed' | 'state_closed' | 'root_open';
  model?: ModelPreference;
  errorMessages?: ErrorMessages;
}

// Base configure options
export interface ConfigureOptions {
  logging?: LoggingConfig;
  defaults?: DefaultsConfig;
}

// Client-specific configure options that extends the base
export interface ClientConfigureOptions extends ConfigureOptions {
  clientProvider?: ClientProvider | string;
}

// Add configure function declaration
export function configure(options: ConfigureOptions): void;

// Add ClientProvider interface
export interface ClientProvider {
  createStream(payload: any): Promise<ReadableStream>;
  setLogger?(logger: any): void;
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

