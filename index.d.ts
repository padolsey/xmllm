// index.d.ts

// Exporting the main 'xmllm' function
export default function xmllm(pipelineFn: Function, options?: any): AsyncGenerator<any>;

// Module declaration for 'xmllm/client'
declare module 'xmllm/client' {
  // Importing from './src/xmllm-client' (adjust the path if necessary)
  import { ClientProvider as CP } from './src/xmllm-client';

  // Re-exporting ClientProvider
  export class ClientProvider extends CP {}

  // Exporting the 'xmllm' function
  export function xmllm(
    pipelineFn: Function,
    clientProvider: ClientProvider | string,
    options?: any
  ): AsyncGenerator<any>;

  // Default export
  const defaultExport: {
    ClientProvider: typeof ClientProvider;
    xmllm: typeof xmllm;
  };
  export default defaultExport;
}
