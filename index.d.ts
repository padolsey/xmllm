// First define the ClientProvider interface
export interface IClientProvider {
  createStream(payload: any): Promise<ReadableStream>;
}

// Use it in the options interface
export interface ClientXmllmOptions extends XmllmOptions {
  clientProvider: IClientProvider | string;
}

// Export the actual class
export class ClientProvider implements IClientProvider {
  constructor(endpoint?: string);
  createStream(payload: any): Promise<ReadableStream>;
}

// Export the client xmllm function
export function xmllmClient<T = any>(
  pipelineFn: (helpers: PipelineHelpers) => any[],
  clientProvider: ClientProvider | string,
  options?: Omit<XmllmOptions, 'clientProvider'>
): AsyncGenerator<T>;

// Core types
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

// Pipeline types
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

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
}

export interface XMLElement {
  $text: string;
  $attr: Record<string, string>;
  $key: number;
  $closed: boolean;
}

// Pipeline helper functions
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

// Schema types
export type SchemaType = Record<string, any>;

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

// Client types
export interface ClientProviderConfig {
  endpoint?: string;
}

// Main xmllm function
export default function xmllm<T = any>(
  pipelineFn: (helpers: PipelineHelpers) => any[],
  options?: XmllmOptions
): AsyncGenerator<T>;

// Add these interfaces from provider.d.ts
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

export interface ProviderConfig {
  endpoint: string;
  key: string;
  models: Record<string, {
    name: string;
    maxContextSize?: number;
  }>;
  constraints?: {
    rpmLimit?: number;
  };
  headerGen?: () => Record<string, string>;
  payloader?: (payload: any) => any;
}

export interface ProviderManager {
  getProviderByPreference(preference: ModelPreference): {
    provider: Provider;
    modelType: string;
  };
  request(payload: any): Promise<any>;
  streamRequest(payload: any): Promise<ReadableStream>;
}

// Add these interfaces from cache.d.ts
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

// Add these stream-related types
export interface StreamManager {
  createStream(stream: ReadableStream, res: any): Promise<void>;
  handleTimeout(res: any): void;
  handleError(res: any, error: Error): void;
  cleanup(reader: ReadableStreamDefaultReader, res: any): void;
  closeAll(): Promise<void>;
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

// Add Logger type since it's used throughout
export interface Logger {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  dev(...args: any[]): void;
}

// Add validation error types
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

// Add ValidationService interface
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

// Better type the Stream function
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

