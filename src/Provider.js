const Logger = require('./logger.js');
const { createParser } = require('eventsource-parser');
const innerTruncate = require('./innerTruncate.js');

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
    this.models = details.models;
    this.payloader = details.payloader;
    this.headerGen = details.headerGen;
    this.cost = details.constraints.cost;
    this.rpmLimit = details.constraints.rpmLimit;
    this.currentCost = 0;
    this.currentRPM = 0;

    // Configurable properties with more sensible defaults or overrides
    this.REQUEST_TIMEOUT_MS = configOverrides.REQUEST_TIMEOUT_MS || 50_000; 
    this.MAX_RETRIES = configOverrides.MAX_RETRIES || 2; 
    this.RETRY_DELAY_WHEN_OVERLOADED = configOverrides.RETRY_DELAY_WHEN_OVERLOADED || 1000;
    this.RPM_RESET_TIME = configOverrides.RPM_RESET_TIME || 60_000;
  }

  async makeRequest(payload) {
    let retries = 0;
    const makeSingleRequest = async () => {

      const preparedPayload = this.preparePayload(payload);
      logger.log(
        'Making request with payload',
        this.name,
        preparedPayload
      );

      let response;
      try {
        response = await Promise.race([
          this.fetch(this.endpoint, {
            method: 'POST',
            headers: this.headerGen
              ? this.headerGen.call(this)
              : this.getHeaders(),
            body: JSON.stringify(preparedPayload)
          }),
          this.timeout(this.REQUEST_TIMEOUT_MS)
        ]);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        this.updateCostFromDataObj(payload.model, data);

        // logger.dev('data', data);

        // Different output types (oai vs anthropic styles)
        return data?.content?.[0]?.text
          ? {content: data?.content?.[0]?.text}
          : data?.choices?.[0]?.message;
        
      } catch (error) {
        logger.error(`Provider ${this.name} encountered an error: ${error}`);
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
    // Use clearTimeout to manage the decrement operation more cleanly
    const timerId = setTimeout(() => this.currentRPM--, this.RPM_RESET_TIME);
    const makeSingleStream = async () => {

      const preparedPayload = this.preparePayload(payload);

      logger.log(
        'Making stream request with model',
        preparedPayload.messages?.length
      );
      try {
        logger.time('makeSingleStream:init');

        console.log('>preparedPayload', preparedPayload);

        response = await Promise.race([
          this.fetch(`${this.endpoint}?stream=true`, {
            method: 'POST',
            headers: this.headerGen
              ? this.headerGen.call(this)
              : this.getHeaders(),
            body: JSON.stringify(preparedPayload)
          }),
          this.timeout(this.REQUEST_TIMEOUT_MS)
        ]);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP Error ${response.status}: ${errorText}`);
        }

        let data = '';
        let counter = 0;
        let closed = false;

        logger.time('makeSingleStream:streamStart');

        return new ReadableStream({
          async start(controller) {

            logger.timeEnd('makeSingleStream:streamStart');
            logger.timeEnd('makeSingleStream:init');

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
                  inst.updateCostFromDataObj(payload.model, json);

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

            // console.log('response.body', response.body);
            for await (const chunk of response.body) {
              // console.log('Chunk', chunk);
              const decoded = new TextDecoder().decode(chunk);
              // console.log('decoded', decoded);
              parser.feed(decoded);
            }
          },
        });

        return new ReadableStream({
          start(controller) {
            const reader = response.body.getReader();
            function push() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  closed = true;
                  controller.close();
                  clearTimeout(timerId); // Ensure timer is cleared when done
                  return;
                }
                controller.enqueue(value);
                push();
              }).catch(err => {
                controller.error(err);
                clearTimeout(timerId); // Ensure timer is cleared on error
              });
            }
            push();
          }
        });
      } catch (error) {
        logger.error(`Error in streaming from ${this.name}: ${error}`);
        clearTimeout(timerId); // Ensure timer is cleared on catch

        // console.log({retries}, this.MAX_RETRIES, error, response);

        if (retries < this.MAX_RETRIES && this.shouldRetry(error, response?.status)) {
          retries++;
          logger.log(`Retrying request for ${this.name}, attempt ${retries}`);
          await this.delay(this.RETRY_DELAY_WHEN_OVERLOADED);
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
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.key}`,
    };
  }

  preparePayload(customPayload) {

    // Ensure context-size limits are respected

    const model = this.models[customPayload.model || 'fast'];

    let messages = [
      ...customPayload.messages
    ];

    const systemMessage = messages.shift();

    if (!model) {
      throw new Error('No model defined: ' + customPayload.model);
    }

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

    logger.dev('m12');
    messages = messages.reverse().map((item) => {

      // We are processing in reverse in order to prioritize
      // later parts of the chat over earlier parts
      // (i.e. short term memory)

      console.log('999 message item', item);

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
      max_tokens: DEFAULT_RESPONSE_TOKEN_LENGTH,
      ...customPayload,
      messages,
    });
    
    logger.dev('successfully derived model specific payload');

    return {

      ...modelSpecificPayload,

      // messages: [
      //   systemMessage,
      //   ...messages
      // ],

      model: this.models[customPayload.model || 'fast']?.name,
      stream: customPayload.stream || false
    };
  }

  updateCostFromDataObj(model, data) {

    if (!data) return;
    
    const costPer1MTokens = this.models[model]?.costPer1MTokens;
    let tokensUsed = 0;
    
    if (data.usage) {

      if (!costPer1MTokens) {
        return;
      }

      tokensUsed =
        data.usage.totalTokensUsed ||
        data.usage.total_tokens ||
        estimateTokenCount(
          data?.choices?.[0]?.message
        );
    } else if (data.choices?.[0]?.delta) {
      tokensUsed = 1;
    } else if (data.choices?.[0]?.message?.content) {
      // Hueristic ... faster.
      tokensUsed = 0 | data.choices[0].message.content.length / 3;
      // tokensUsed = estimateTokenCount(
      //   data.choices[0].message.content
      // );
    }

    this.currentCost += tokensUsed * (costPer1MTokens / 1000000);

    // logger.dev(`Updated cost for ${this.name}: ${this.currentCost}, (tokens used: ${tokensUsed}, per1MToken: ${costPer1MTokens})`);
  }

  getAvailable() {
    return this.currentRPM < this.rpmLimit;
  }
}

module.exports = Provider;
