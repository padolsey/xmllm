import type { 
  PipelineHelpers, 
  XmllmOptions, 
  SchemaType, 
  HintType, 
  BaseStreamConfig,
  SchemaStreamConfig,
  StreamOptions, 
  ChainableStreamInterface,
  XMLElement,
  PromptFn,
  Message,
  ModelPreference,
  ConfigureOptions,
  ErrorMessages,
  DefaultsConfig
} from './index';

export type { 
  PipelineHelpers, 
  XmllmOptions, 
  SchemaType, 
  HintType,
  BaseStreamConfig,
  SchemaStreamConfig,
  StreamOptions, 
  ChainableStreamInterface,
  XMLElement,
  PromptFn,
  Message,
  ModelPreference,
  ConfigureOptions,
  ErrorMessages,
  DefaultsConfig
};

export interface IClientProvider {
  createStream(payload: any): Promise<ReadableStream>;
}

export class ClientProvider implements IClientProvider {
  constructor(endpoint?: string);
  createStream(payload: any): Promise<ReadableStream>;
}

// Extend base ConfigureOptions for client usage
export interface ClientConfigureOptions extends ConfigureOptions {
  clientProvider?: ClientProvider | string;
}

export function xmllm<T = any>(
  pipelineFn: (helpers: PipelineHelpers) => any[],
  options?: Omit<XmllmOptions, 'clientProvider'>
): AsyncGenerator<T>;

export function stream<T = XMLElement>(
  promptOrConfig: string | SchemaStreamConfig,
  options?: StreamOptions & {
    clientProvider?: ClientProvider | string;
  }
): ChainableStreamInterface<T>;

export function simple<T = any>(
  prompt: string,
  schema: SchemaType,
  options?: Omit<StreamOptions, 'schema'> & {
    clientProvider?: ClientProvider | string;
    sudoPrompt?: boolean;
  }
): Promise<T>;

export function configure(options: ClientConfigureOptions): void;

declare const _default: {
  configure: typeof configure;
  ClientProvider: typeof ClientProvider;
  xmllm: typeof xmllm;
  stream: typeof stream;
  simple: typeof simple;
};

export default _default; 