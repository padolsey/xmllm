import xmllmCore from './xmllm.mjs';
import Stream from './Stream.mjs';

function xmllm(pipelineFn, options = {}) {
  return xmllmCore(pipelineFn, { ...options, llmStream: options.Stream || Stream });
}

export default xmllm;