import { ProxyBase } from '../ProxyBase.mjs';
import { xmllm } from '../xmllm-main.mjs';

const COT_SCHEMA = {
  thinking: String,
  draft_response: String,
  response_metrics: String,
  improvement_strategy: String,
  final_response: String
};

const SYSTEM_PROMPT = `You are a helpful AI assistant that thinks through problems step by step. You will reply in <draft_response/>, then <response_metrics/> (where you will consider appropriate ways to judge your draft), <improvement_strategy>, then finally <final_response/> which will internalize and improve upon the analysis.`;

class CoTProxy extends ProxyBase {
  async handleStreaming(data, res) {
    const {
      messages,
      // model,
      temperature = 0.7,
      max_tokens = 2000,
      maxTokens,
      system,
      stream = false  // Default to true for backward compatibility
    } = data;

    const model = ['anthropic:fast', 'openai:fast'];

    // Set headers based on streaming mode
    res.writeHead(200, {
      'Content-Type': stream ? 'text/event-stream' : 'application/json',
      ...(stream && {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      })
    });

    // Process through Chain of Thought
    const cotStream = await xmllm(({ prompt }) => [
      prompt({
        messages,
        model,
        schema: COT_SCHEMA,
        system: system || this.getDefaultSystemPrompt(),
        temperature,
        max_tokens: max_tokens || maxTokens,
        stream
      }),
      // Handle streaming vs non-streaming
      function* (result) {
        if (result.final_response) {
          yield result.final_response;
        }
      }
    ]);

    if (!stream) {
      // For non-streaming, collect all chunks and send final response
      let finalResponse = '';
      for await (const chunk of cotStream) {
        if (typeof chunk === 'string') {
          finalResponse = chunk; // Keep last chunk as final response
        }
      }
      res.end(JSON.stringify({ 
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: Array.isArray(model) ? model[0] : model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: finalResponse
          },
          finish_reason: 'stop'
        }]
      }));
      return;
    }

    // For streaming responses, use ReadableStream
    const processedStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of cotStream) {
            if (typeof chunk === 'string') {
              controller.enqueue(new TextEncoder().encode(chunk));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    await this.streamManager.createStream(processedStream, res);
  }

  getDefaultSystemPrompt() {
    return SYSTEM_PROMPT;
  }
}

export default function createServer(config) {
  return new CoTProxy(config).listen();
} 