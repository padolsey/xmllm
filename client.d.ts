import type { 
  PipelineHelpers, 
  XmllmOptions, 
  SchemaType, 
  HintType, 
  StreamOptions, 
  XMLStream,
  XMLElement,
  PromptFn,
  Message,
  ModelPreference
} from './index';

export type { 
  PipelineHelpers, 
  XmllmOptions, 
  SchemaType, 
  HintType, 
  StreamOptions, 
  XMLStream,
  XMLElement,
  PromptFn,
  Message,
  ModelPreference
};

export interface IClientProvider {
  createStream(payload: any): Promise<ReadableStream>;
}

export class ClientProvider implements IClientProvider {
  constructor(endpoint?: string);
  createStream(payload: any): Promise<ReadableStream>;
}

export function xmllm<T = any>(
  pipelineFn: (helpers: PipelineHelpers) => any[],
  clientProvider?: ClientProvider | string,
  options?: Omit<XmllmOptions, 'clientProvider'>
): AsyncGenerator<T>;

export function stream<T = XMLElement>(
  promptOrConfig: string | { 
    prompt?: string;
    schema?: SchemaType;
    system?: string;
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
  },
  options?: StreamOptions & {
    clientProvider?: ClientProvider | string;
  }
): XMLStream<T>;

export function simple<T = any>(
  prompt: string,
  schema: SchemaType,
  options: Omit<StreamOptions, 'schema'> & {
    clientProvider?: ClientProvider | string;
  }
): Promise<T>;

declare const _default: {
  ClientProvider: typeof ClientProvider;
  xmllm: typeof xmllm;
  stream: typeof stream;
  simple: typeof simple;
};

export default _default; 