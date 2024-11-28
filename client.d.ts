import type { PipelineHelpers, XmllmOptions, SchemaType, StreamOptions, XMLStream } from './index';

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

export function stream<T = Record<string, any>>(
  promptOrConfig: string | { 
    prompt: string;
    schema?: SchemaType;
    system?: string;
    closed?: boolean;
  },
  clientProvider: ClientProvider | string,
  options?: StreamOptions
): XMLStream<T>;

export function simple<T = any>(
  prompt: string,
  schema: SchemaType,
  clientProvider: ClientProvider | string,
  options?: StreamOptions
): Promise<T>;

export { PipelineHelpers };

// Change the default export to use declare
declare const _default: {
  ClientProvider: typeof ClientProvider;
  xmllm: typeof xmllm;
  stream: typeof stream;
  simple: typeof simple;
};

export default _default; 