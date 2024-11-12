import express from 'express';
import cors from 'cors';
import ProviderManager from './ProviderManager.mjs';
import StreamManager from './StreamManager.mjs';
import ValidationService from './ValidationService.mjs';
import Stream from './Stream.mjs';
import PROVIDERS from './PROVIDERS.mjs';

function createServer(config = {}) {
  const app = express();
  const port = config.port || process.env.PORT || 3124;
  const streamManager = new StreamManager(config);

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

      try {
        // Validate all inputs
        ValidationService.validateMessages(messages);
        ValidationService.validateModel(model, PROVIDERS);
        ValidationService.validateParameters({
          temperature,
          max_tokens,
          stream,
          cache
        });
      } catch (error) {
        return res.status(400).json({
          error: error.message,
          code: error.code,
          details: error.details
        });
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

      await streamManager.createStream(theStream, res);

    } catch (error) {
      console.error('Error in stream request:', error);
      res.write(`event: error\ndata: ${JSON.stringify({ 
        error: 'Internal server error', 
        code: error.code || 'INTERNAL_ERROR',
        message: error.message,
        details: error.details
      })}\n\n`);
      res.end();
    }
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing all streams...');
    await streamManager.closeAll();
    process.exit(0);
  });

  app.listen(port, () => {
    console.log(`xmllm proxy server running on port ${port}`);
  });

  return app;
}

export default createServer;
