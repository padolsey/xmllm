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
      const { messages, model = 'good', max_tokens } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages format' });
      }
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      const stream = await Stream({
        messages,
        max_tokens,
        model,
        stream: true
      });
      for await (const chunk of stream) {
        if (chunk instanceof Uint8Array) {
          const content = new TextDecoder().decode(chunk);
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        } else if (typeof chunk === 'string') {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      }
      res.write('event: close\ndata: Stream ended\n\n');
      res.end();
    } catch (error) {
      console.error('Error in stream request:', error);
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
      res.end();
    }
  });
  
  app.listen(port, () => {
    console.log(`xmllm proxy server running on port ${port}`);
  });

  return app;

}

export default createServer;