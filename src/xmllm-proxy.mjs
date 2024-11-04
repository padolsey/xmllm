import express from 'express';
import cors from 'cors';
import ProviderManager from './ProviderManager.mjs';
import Stream from './Stream.mjs';

function createServer(config = {}) {
  const app = express();
  const port = config.port || process.env.PORT || 3124;

  const corsOptions = {
    origin: config.corsOrigins || '*', // all by default
    methods: ['GET', 'POST'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type'], // Allowed headers
    credentials: true, // Allow sending credentials (cookies, etc.)
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  const providerManager = new ProviderManager();

  console.log('Starting Proxy Server with config', config, 'Port:', port);

  app.post('/api/stream', async (req, res) => {
    try {
      const {
        messages,
        model = ['claude:good', 'openai:good', 'togetherai:good'],
        max_tokens,
        temperature,
        fakeDelay,
        cache,
        stream
      } = req.body;

      console.log('Stream request', req.body);

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages format' });
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      const theStream = await Stream({
        messages,
        max_tokens,
        temperature,
        fakeDelay,
        model,
        cache,
        stream: stream == null ? true : stream
      });

      const reader = theStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (value instanceof Uint8Array) {
          const content = new TextDecoder().decode(value);
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        } else if (typeof value === 'string') {
          res.write(`data: ${JSON.stringify({ content: value })}\n\n`);
        }
      }

      res.write('event: close\ndata: Stream ended\n\n');
      res.end();

    } catch (error) {
      console.error('Error in stream request:', error);
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Internal server error', message: error.message })}\n\n`);
      res.end();
    }
  });
  
  app.listen(port, () => {
    console.log(`xmllm proxy server running on port ${port}`);
  });

  return app;

}

export default createServer;
