import Logger from './Logger.mjs';
import { createParser } from 'eventsource-parser';
import innerTruncate from './innerTruncate.mjs';

function estimateTokenCount(m) { return m.length / 3; }

const logger = new Logger('Provider');

const DEFAULT_ASSUMED_MAX_CONTEXT_SIZE = 8_000;
const DEFAULT_RESPONSE_TOKEN_LENGTH = 300;
const MAX_TOKEN_HISTORICAL_MESSAGE = 600;

class Provider {
  constructor(name, details, fetchFn = fetch, configOverrides = {}) {
    this.fetch = fetchFn;
    this.name = name;
    this.endpoint = details.endpoint;
    this.key = details.key;
    this.models = details.models || {};
    this.payloader = details.payloader || this.defaultPayloader;
    this.headerGen = details.headerGen || this.defaultHeaderGen;
    this.rpmLimit = details.constraints?.rpmLimit || Infinity; // Default to Infinity if not provided
    this.currentRPM = 0;

    // Configurable properties with more sensible defaults or overrides
    this.REQUEST_TIMEOUT_MS = configOverrides.REQUEST_TIMEOUT_MS || 50_000; 
    this.MAX_RETRIES = configOverrides.MAX_RETRIES || 2; 
    this.RETRY_DELAY_WHEN_OVERLOADED = configOverrides.RETRY_DELAY_WHEN_OVERLOADED || 1000;
    this.RPM_RESET_TIME = configOverrides.RPM_RESET_TIME || 60_000;
  }

  defaultPayloader(payload) {
    return payload;
  }

  defaultHeaderGen() {
    return this.getHeaders();
  }

  async makeRequest(payload) {
    let retries = 0;
    const makeSingleRequest = async () => {
      const preparedPayload = this.preparePayload(payload);
      logger.log('Making request with payload', this.name, preparedPayload);

      let response;
      try {
        response = await Promise.race([
          this.fetch(this.endpoint, {
            method: 'POST',
            headers: this.headerGen ? this.headerGen.call(this) : this.getHeaders(),
            body: JSON.stringify(preparedPayload)
          }),
          this.timeout(this.REQUEST_TIMEOUT_MS)
        ]);

        if (!response.ok) {
          const errorText = await response.text();
          logger.error(`HTTP Error ${response.status} for ${this.name}:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            errorText: errorText
          });
          throw new Error(`HTTP Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data?.content?.[0]?.text
          ? {content: data?.content?.[0]?.text}
          : data?.choices?.[0]?.message;
        
      } catch (error) {
        logger.error(`Provider ${this.name} encountered an error:`, {
          error: error.message,
          stack: error.stack,
          responseStatus: response?.status,
          responseStatusText: response?.statusText,
          responseHeaders: response ? Object.fromEntries(response.headers.entries()) : null,
          responseBody: await response?.text().catch(() => 'Unable to read response body')
        });
        logger.log('Errored payload, FYI: ', preparedPayload);
        if (retries < this.MAX_RETRIES && this.shouldRetry(error, response?.status)) {
          retries++;
          logger.log(`Retrying request for ${this.name}, attempt ${retries}`);
          await this.delay(this.RETRY_DELAY_WHEN_OVERLOADED);
          return makeSingleRequest();
        }
        throw error;
      }
    };

    return makeSingleRequest();
  }

  async createStream(payload, retries = 0) {
    logger.log('Making STREAMING request with payload', payload);
    
    const encoder = new TextEncoder();
    const inst = this;

    let response;

    this.currentRPM++;
    payload.stream = true;
    const timerId = setTimeout(() => this.currentRPM--, this.RPM_RESET_TIME);
    const makeSingleStream = async () => {
      logger.log('Initiating stream request');

      const preparedPayload = this.preparePayload(payload);

      logger.log('Prepared payload for stream request', preparedPayload);
      try {
        const endpoint = `${this.endpoint}${preparedPayload.stream?'?stream=true':''}`;
        const headers = this.headerGen ? this.headerGen.call(this) : this.getHeaders();

        logger.log('Sending fetch request to', this.endpoint, headers, JSON.stringify(preparedPayload));

        response = await Promise.race([
          this.fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(preparedPayload)
          }),
          this.timeout(this.REQUEST_TIMEOUT_MS)
        ]);

        logger.log('Received response', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          logger.error(`HTTP Error ${response.status} for ${this.name} (stream):`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            errorText: errorText
          });
          throw new Error(`HTTP Error ${response.status}: ${errorText}`);
        }

        if (!response.body) {
          logger.error('Response body is null', response);
          throw new Error(`No response body from ${inst.name}`);
        }

        let data = '';
        let counter = 0;
        let closed = false;

        return new ReadableStream({
          async start(controller) {
            logger.log('Starting readable stream');

            function onParse(event) {
              if (closed) return;

              if (event.type === 'event') {
                const eventData = event.data;
                if (eventData === '[DONE]') {
                  clearTimeout(timerId);
                  logger.log('[done] Closing readable stream');
                  data += '\n';
                  controller.enqueue(encoder.encode('\n'));
                  controller.close();
                  closed = true;
                  return;
                }
                try {
                  const json = JSON.parse(eventData);

                  // Various output formats depending on provider.
                  let text =
                    json?.delta?.text 
                    ||
                    json?.content_block?.text
                    ||
                    json.choices?.[0]?.delta?.content;


                  if (json?.delta?.stop_reason) {
                    clearTimeout(timerId);
                    logger.log('[ANTHROPIC:CLAUDE done] Closing readable stream');
                    data += '\n';
                    controller.enqueue(encoder.encode('\n'));
                    controller.close();
                    closed = true;
                    return;
                  }

                  text = text || '';

                  if (counter < 2 && (text.match(/\n/) || []).length) {
                    return; //??? what is this for???
                  }

                  data += text;
                  const queue = encoder.encode(text);
                  controller.enqueue(queue);
                  counter++;
                } catch (e) {
                  logger.error('controller error', e);
                  clearTimeout(timerId);
                  closed = true;
                  controller.error(e);
                }
              }
            }

            const parser = createParser(onParse);

            logger.log('Starting to read response body', response.body);
            for await (const chunk of response.body) {
              const decoded = new TextDecoder().decode(chunk);

              if (decoded?.[0] === '{') {
                // It may not be an event stream but a singular response.
                try {
                  const json = JSON.parse(decoded);

                  if (json.choices?.[0]?.message?.content) {
                    controller.enqueue(json.choices?.[0]?.message?.content);
                    controller.close();
                    return;
                  }
                } catch(e) {}
              }

              parser.feed(decoded);
            }
            logger.log('Finished reading response body');
          },
        });
      } catch (error) {
        logger.error(`Error in streaming from ${this.name}:`, {
          error: error.message,
          stack: error.stack,
          responseStatus: response?.status,
          responseStatusText: response?.statusText,
          responseHeaders: response ? Object.fromEntries(response.headers.entries()) : null,
          responseBody: await response?.text().catch(() => 'Unable to read response body')
        });
        clearTimeout(timerId);

        if (retries < this.MAX_RETRIES && this.shouldRetry(error, response?.status)) {
          retries++;
          logger.log(`Retrying request for ${this.name}, attempt ${retries}`);
          await this.delay(this.RETRY_DELAY_WHEN_OVERLOADED * Math.pow(2, retries - 1)); // Exponential backoff
          return this.createStream(payload, retries);
        }

        throw error;
      }
    };

    return makeSingleStream();
  }

  timeout(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  shouldRetry(error, status) {
    // Use error codes and more explicit checks instead of message content
    return (status === 500 || error.message.includes('time')) && status !== 401;
  }

  getHeaders() {
    if (!this.key) {
      throw new Error('Note: No key is defined');
    }
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.key !== 'NO_KEY') {
      headers.Authorization = `Bearer ${this.key}`;
    }
    return headers;
  }

  preparePayload(customPayload) {
    // Ensure context-size limits are respected

    // First, try to use the model specified in the preference
    // If not found, fall back to 'fast', then to the first available model
    const modelType = customPayload.model || 'fast';
    const model = this.models[modelType] || this.models['fast'] || Object.values(this.models)[0];

    if (!model) {
      throw new Error(`No valid model found for provider: ${this.name}`);
    }

    let messages = [...customPayload.messages];

    const systemMessage = messages.shift();

    if (systemMessage.role !== 'system') {
      throw new Error('Expected system message!');
    }

    // Determine max tokens left after sys message
    const maxAvailableContextSize = 0 |
      (
        model.maxContextSize || DEFAULT_ASSUMED_MAX_CONTEXT_SIZE
      )
      - estimateTokenCount(systemMessage.content)
      - DEFAULT_RESPONSE_TOKEN_LENGTH

    logger.dev('maxAvailableContextSize remaining', maxAvailableContextSize);

    let historyTokenCount = 0;

    messages = messages.reverse().map((item) => {
      // We are processing in reverse in order to prioritize
      // later parts of the chat over earlier parts
      // (i.e. short term memory)

      const truncated = innerTruncate(
        item.content,
        '[...]',
        10,
        MAX_TOKEN_HISTORICAL_MESSAGE
      );

      historyTokenCount += estimateTokenCount(truncated);

      if (historyTokenCount > maxAvailableContextSize) {
        return null;
      }

      return {
        role: item.role,
        content: truncated
      }
    }).reverse().filter(Boolean);
    logger.dev('m12 done');

    logger.dev('deriving model specific payload');

    const modelSpecificPayload = this.payloader({
      system: systemMessage.content,
      max_tokens: customPayload.max_tokens || customPayload.maxTokens || DEFAULT_RESPONSE_TOKEN_LENGTH,
      ...customPayload,
      messages,
    });
    
    logger.dev('successfully derived model specific payload', modelSpecificPayload);

    return {
      ...modelSpecificPayload,
      model: model.name,
      stream: customPayload.stream || false
    };
  }

  getAvailable() {
    return this.currentRPM < this.rpmLimit;
  }
}

export default Provider;