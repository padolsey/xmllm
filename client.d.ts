import type { 
  PipelineHelpers, 
  XmllmOptions, 
  SchemaType, 
  StreamOptions, 
  XMLStream,
  XMLElement,
  PromptFn
} from './index';

export interface IClientProvider {
  createStream(payload: any): Promise<ReadableStream>;
}

export class ClientProvider implements IClientProvider {
  constructor(endpoint?: string);
  createStream(payload: any): Promise<ReadableStream>;
}

export function xmllm<T = any>(
  pipelineFn: (helpers: PipelineHelpers) => any[],
  clientProvider: ClientProvider | string,
  options?: Omit<XmllmOptions, 'clientProvider'>
): AsyncGenerator<T>;

export function stream<T = XMLElement>(
  promptOrConfig: string | { 
    prompt: string;
    schema?: SchemaType;
    system?: string;
    mode?: 'state' | 'delta' | 'snapshot' | 'realtime';
    onChunk?: (chunk: string) => void;
    [key: string]: any;
  },
  options: StreamOptions & {
    clientProvider: ClientProvider | string;
  }
): XMLStream<T>;

export function simple<T = any>(
  prompt: string,
  schema: SchemaType,
  options: Omit<StreamOptions, 'schema'> & {
    clientProvider: ClientProvider | string;
  }
): Promise<T>;

export { PipelineHelpers };

declare const _default: {
  ClientProvider: typeof ClientProvider;
  xmllm: typeof xmllm;
  stream: typeof stream;
  simple: typeof simple;
};

export default _default; 