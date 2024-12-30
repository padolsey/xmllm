import http from 'http';
import { xmllm, configure } from '../src/xmllm-main.mjs';
import StreamManager from '../src/StreamManager.mjs';
import ValidationService from '../src/ValidationService.mjs';
import Stream from '../src/Stream.mjs';
import PROVIDERS from '../src/PROVIDERS.mjs';
import ResourceLimiter from '../src/ResourceLimiter.mjs';
configure({
  logging: {
    level: 'INFO'
  }
});

// Chain of Thought schema for processing requests
const COT_SCHEMA = {
  thinking: {
    step: [{
      $number: Number,
      $text: String
    }]
  },
  draft_response: String,
  response_metrics: {
    clarity: Number,
    relevance: Number,
    completeness: Number,
    analysis: String
  },
  improvement_strategy: {
    point: [String]
  },
  final_response: String
};
function createServer(config = {}) {
  const port = config.port || process.env.PORT || 3124;
  const streamManager = new StreamManager(config);
  const maxRequestSize = config.maxRequestSize || 1048576; // Default 1MB
  const timeout = config.timeout || 30000; // Default 30s

  // Initialize global resource limiter
  const globalLimiter = new ResourceLimiter({
    rpm: config.globalRequestsPerMinute ? {
      limit: config.globalRequestsPerMinute,
      window: 60000
    } : null,
    tpm: config.globalTokensPerMinute ? {
      limit: config.globalTokensPerMinute,
      window: 60000
    } : null
  });
  const server = http.createServer(async (req, res) => {
    // Set timeout
    req.setTimeout(timeout);

    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Handle stream endpoint
    if (req.url === '/api/stream' && req.method === 'POST') {
      try {
        // Parse JSON body with size limit
        const buffers = [];
        let totalSize = 0;
        for await (const chunk of req) {
          totalSize += chunk.length;
          if (totalSize > maxRequestSize) {
            res.writeHead(413, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Request entity too large',
              maxSize: maxRequestSize
            }));
            return;
          }
          buffers.push(chunk);
        }
        const data = JSON.parse(Buffer.concat(buffers).toString());
        const {
          messages,
          model,
          temperature = 0.7,
          max_tokens,
          maxTokens,
          system
        } = data;

        // Check rate limits
        const limitCheck = globalLimiter.checkLimits({
          rpm: 1,
          tpm: messages.reduce((acc, m) => acc + m.content.length / 3, 0)
        });
        if (!limitCheck.allowed) {
          res.writeHead(429, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            error: 'Rate limit exceeded',
            limits: limitCheck.limits
          }));
          return;
        }

        // Set SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        // Process through Chain of Thought
        const cotStream = await xmllm(({
          prompt
        }) => [prompt({
          messages,
          model,
          schema: COT_SCHEMA,
          system: `You are a helpful AI assistant that thinks through problems step by step.

IMPORTANT: For every response, follow this exact process in order:

1. <thinking>
   - Break down the problem into clear steps
   - Number each step with the $number attribute
   - Think through implications and edge cases
   - Consider relevant context and constraints
</thinking>

2. <draft_response>
   - Write an initial response based on your thinking
   - Be direct and clear
   - Focus on addressing the core question
</draft_response>

3. <response_metrics>
   - Evaluate your draft on these scales (0-1):
     * clarity: How clear and understandable is it?
     * relevance: How well does it address the question?
     * completeness: How thorough is the response?
   - Provide a brief analysis of strengths/weaknesses
</response_metrics>

4. <improvement_strategy>
   - List specific points for improving the response
   - Consider what's missing or could be clearer
   - Think about what would make it more helpful
</improvement_strategy>

5. <final_response>
   - Incorporate the improvements
   - Ensure it's complete and well-structured
   - Make it as helpful as possible while being concise
</final_response>

Remember: Each section builds on the previous ones to create a thorough, well-reasoned response.`,
          temperature,
          max_tokens: max_tokens || maxTokens
        }),
        // Only stream the final response
        function* (result) {
          if (result.final_response) {
            yield result.final_response;
          }
        }]);

        // Stream the processed response
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
        await streamManager.createStream(processedStream, res);
      } catch (error) {
        if (!res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message
          }));
          return;
        }
        res.write(`event: error\ndata: ${JSON.stringify({
          error: 'Stream error',
          message: error.message
        })}\n\n`);
        res.end();
      }
      return;
    }

    // Handle unknown endpoints
    res.writeHead(404, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
      error: 'Not found'
    }));
  });

  // Handle server errors
  server.on('error', error => {
    console.error('Server error:', error);
  });
  if (config.listen !== false) {
    server.listen(port, () => {
      console.log(`Chain of Thought proxy server listening on port ${port}`);
    });
  }
  return server;
}
export default createServer;