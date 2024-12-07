import type { 
  PipelineHelpers, 
  XmllmOptions, 
  SchemaType, 
  HintType, 
  StreamOptions, 
  ChainableStreamInterface,
  XMLElement,
  PromptFn,
  Message,
  ModelPreference,
  ConfigureOptions,
  ErrorMessages
} from './index';

export type { 
  PipelineHelpers, 
  XmllmOptions, 
  SchemaType, 
  HintType, 
  StreamOptions, 
  ChainableStreamInterface,
  XMLElement,
  PromptFn,
  Message,
  ModelPreference,
  ConfigureOptions,
  ErrorMessages
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
  promptOrConfig: string | { 
    prompt?: string;
    schema?: SchemaType;
    system?: string;
    sudoPrompt?: boolean;
    mode?: 'state_open' | 'root_closed' | 'state_closed' | 'root_open';
    onChunk?: (chunk: string) => void;
    messages?: Message[];
    model?: ModelPreference;
    temperature?: number;
    max_tokens?: number;
    maxTokens?: number;
    top_p?: number;
    topP?: number;
    presence_penalty?: number;
    presencePenalty?: number;
    stop?: string[];
    errorMessages?: ErrorMessages;
  },
  options?: StreamOptions & {
    clientProvider?: ClientProvider | string;
    errorMessages?: ErrorMessages;
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