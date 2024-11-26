// Core interfaces
export interface XMLElement {
  $text: string;
  $attr: Record<string, string>;
  $key: number;
  $closed: boolean;
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
}

// Pipeline helper types
export type PromptFn = (
  prompt: string | ((input: any) => string) | PromptConfig,
  schema?: SchemaType,
  mapper?: (input: any, output: any) => any,
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
  promptClosed: PromptClosedFn;
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

export type ModelPreference = ModelString | ModelConfig | Array<ModelString | ModelConfig>;

// First, let's define what a string hint can be
export type SchemaHint = string;

// Then define what a schema value can be
export type SchemaValue = 
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ((element: XMLElement) => any)
  | SchemaHint;

// Finally, define the full schema type that can be recursive
export type SchemaType = 
  | SchemaValue
  | { [key: string]: SchemaType }
  | Array<SchemaType>;

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

// Add this with the other interfaces
export interface PromptConfig {
  messages?: Message[];
  system?: string;
  model?: ModelPreference;
  max_tokens?: number;
  temperature?: number;
  cache?: boolean;
  retryMax?: number;
  retryStartDelay?: number;
  retryBackoffMultiplier?: number;
  constraints?: {
    rpmLimit?: number;
  };
  schema?: SchemaType;
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
  system?: string;
  closed?: boolean;
  model?: ModelPreference;
  temperature?: number;
  maxTokens?: number;
}

export interface XMLStream<T = any> {
  select(selector: string): XMLStream<T>;
  map<U>(fn: (value: T) => U): XMLStream<U>;
  filter(fn: (value: T) => boolean): XMLStream<T>;
  text(): XMLStream<string>;
  merge(): XMLStream<T>;
  value(): Promise<T>;
  closedOnly(): XMLStream<T>;
  complete(): XMLStream<T>;  // deprecated
  all(): XMLStream<T[]>;
  first(): Promise<T>;
  take(n: number): XMLStream<T>;
  skip(n: number): XMLStream<T>;
  raw(): XMLStream<string>;
  debug(label?: string): XMLStream<T>;
  collect(): Promise<T>;
  reduce<U>(reducer: (acc: U, value: T) => U, initialValue: U): XMLStream<U>;
  mergeAggregate(): XMLStream<T[]>;
}

// Add these function declarations
export function stream(
  promptOrConfig: string | StreamConfig,
  options?: StreamOptions
): XMLStream;

export function simple<T = any>(
  prompt: string,
  schema: SchemaType,
  options?: Omit<StreamOptions, 'schema'> // schema comes from second param
): Promise<T>;

