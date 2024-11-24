import type { PipelineHelpers, XmllmOptions } from './index';

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

export { PipelineHelpers };

// Change the default export to use declare
declare const _default: {
  ClientProvider: typeof ClientProvider;
  xmllm: typeof xmllm;
};

export default _default; 