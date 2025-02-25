import {
  MessageValidationError,
  ModelValidationError,
  PayloadValidationError
} from './errors/ValidationErrors.mjs';
import PROVIDERS, { PROVIDER_ALIASES } from './PROVIDERS.mjs';
import IncomingXMLParserSelectorEngine from './parsers/IncomingXMLParserSelectorEngine.mjs';

class ValidationService {
  static validateMessages(messages) {
    if (!Array.isArray(messages)) {
      throw new MessageValidationError(
        'Messages must be an array',
        { received: typeof messages }
      );
    }

    // Extract system message if it's the first message
    let systemMessage = null;
    if (messages.length > 0 && messages[0].role === 'system') {
      // Validate system message content first
      if (typeof messages[0].content !== 'string') {
        throw new MessageValidationError(
          'System message content must be a string',
          { contentType: typeof messages[0].content }
        );
      }
      systemMessage = messages[0];
      messages = messages.slice(1);
    }

    messages.forEach((message, index) => {
      if (!message.role || !message.content) {
        throw new MessageValidationError(
          'Message must have role and content',
          { index, message }
        );
      }

      if (!['user', 'assistant', 'developer'].includes(message.role)) {
        throw new MessageValidationError(
          'Invalid message role',
          { index, role: message.role, validRoles: ['user', 'assistant', 'developer'] }
        );
      }

      if (typeof message.content !== 'string') {
        throw new MessageValidationError(
          'Message content must be a string',
          { index, contentType: typeof message.content }
        );
      }
    });

    return {
      systemMessage: systemMessage?.content || '',
      messages
    };
  }

  static validateModel(model, availableModels) {
    if (Array.isArray(model)) {
      model.forEach((m, index) => {
        this.validateSingleModel(m, availableModels, index);
      });
      return true;
    }
    
    return this.validateSingleModel(model, availableModels);
  }

  static validateSingleModel(model, availableModels, index = null) {

    if (typeof model !== 'string') {
      if (!model?.name) {
        throw new ModelValidationError('Custom model must me object with a name', { model, index });
      }
      return true;
    }

    let [provider, type] = (model || '').split(':');
    
    // Handle provider aliases
    provider = PROVIDER_ALIASES[provider] || provider;
    
    if (!provider || !type) {
      throw new ModelValidationError(
        'Invalid model format',
        { model, index, expectedFormat: 'provider:type' }
      );
    }

    if (!availableModels[provider]) {
      throw new ModelValidationError(
        'Provider not found',
        { provider, index, availableProviders: Object.keys(availableModels) }
      );
    }

    return true;
  }

  static validateConstraints(constraints) {
    if (!constraints) return true;

    if (constraints.rpmLimit !== undefined) {
      // First check if it's a number at all
      if (typeof constraints.rpmLimit !== 'number' || Number.isNaN(constraints.rpmLimit)) {
        throw new PayloadValidationError(
          'rpmLimit must be a whole number',
          { rpmLimit: constraints.rpmLimit }
        );
      }

      // Then check for finite
      if (!Number.isFinite(constraints.rpmLimit)) {
        throw new PayloadValidationError(
          'rpmLimit must be finite',
          { rpmLimit: constraints.rpmLimit }
        );
      }

      // Then check for integer
      if (!Number.isInteger(constraints.rpmLimit)) {
        throw new PayloadValidationError(
          'rpmLimit must be a whole number',
          { rpmLimit: constraints.rpmLimit }
        );
      }

      // Finally check for positive
      if (constraints.rpmLimit <= 0) {
        throw new PayloadValidationError(
          'rpmLimit must be positive',
          { rpmLimit: constraints.rpmLimit }
        );
      }

    }

    return true;
  }

  static validateLLMPayload(payload = {}) {
    const {
      temperature,
      max_tokens,
      stream,
      cache,
      hints,
      schema,
      strategy,
      constraints,
      autoTruncateMessages,
      buffer
    } = payload;

    // Strategy requires schema
    if (strategy && !schema) {
      throw new PayloadValidationError(
        'Strategy can only be used with schema-based prompts. For raw prompts, use system/messages directly.',
        'STRATEGY_VALIDATION_ERROR',
        { strategy }
      );
    }

    // Hints requires schema
    if (hints && !schema) {
      throw new PayloadValidationError(
        'Cannot provide hints without a schema',
        'HINT_VALIDATION_ERROR',
        { hints }
      );
    }

    // If both provided, validate hints against schema
    if (hints && schema) {
      IncomingXMLParserSelectorEngine.validateHints(schema, hints);
    }

    // Validate core parameters
    if (temperature !== undefined) {
      if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
        throw new PayloadValidationError(
          'Temperature must be between 0 and 1',
          { temperature }
        );
      }
    }

    if (max_tokens !== undefined) {
      if (!Number.isInteger(max_tokens) || max_tokens <= 0) {
        throw new PayloadValidationError(
          'max_tokens must be a positive integer',
          { max_tokens }
        );
      }
    }

    if (stream !== undefined && typeof stream !== 'boolean') {
      throw new PayloadValidationError(
        'stream must be a boolean',
        { stream }
      );
    }

    if (cache !== undefined) {
      if (typeof cache === 'boolean') {
        // Boolean format is valid
      } else if (typeof cache === 'object' && cache !== null) {
        // Object format validation
        const { read, write } = cache;
        if (read !== undefined && typeof read !== 'boolean') {
          throw new PayloadValidationError(
            'cache.read must be a boolean',
            { read }
          );
        }
        if (write !== undefined && typeof write !== 'boolean') {
          throw new PayloadValidationError(
            'cache.write must be a boolean',
            { write }
          );
        }
      } else {
        throw new PayloadValidationError(
          'cache must be a boolean or an object with read/write boolean properties',
          { cache }
        );
      }
    }

    // Validate constraints if present
    if (constraints) {
      this.validateConstraints(constraints);
    }

    // Validate autoTruncateMessages
    if (autoTruncateMessages !== undefined) {
      if (typeof autoTruncateMessages !== 'boolean' && 
          (typeof autoTruncateMessages !== 'number' || 
           autoTruncateMessages <= 0 || 
           !Number.isInteger(autoTruncateMessages))) {
        throw new PayloadValidationError(
          'autoTruncateMessages must be either boolean or a positive integer',
          { autoTruncateMessages }
        );
      }
    }

    // Validate buffer options if provided
    if (buffer !== undefined) {
      if (typeof buffer === 'boolean') {
        // Boolean format is valid
      } else if (buffer === null || typeof buffer !== 'object' || Array.isArray(buffer)) {
        throw new PayloadValidationError(
          'buffer must be a boolean or an object with timeout/maxSize properties',
          { buffer }
        );
      } else {
        const { timeout, maxSize, ...extraProps } = buffer;
        
        // Check for invalid properties
        if (Object.keys(extraProps).length > 0) {
          throw new PayloadValidationError(
            'buffer must be a boolean or an object with timeout/maxSize properties',
            { invalidProps: Object.keys(extraProps) }
          );
        }

        if (timeout !== undefined && (
          typeof timeout !== 'number' || 
          timeout < 0 || 
          !Number.isInteger(timeout)
        )) {
          throw new PayloadValidationError(
            'buffer.timeout must be a non-negative integer (milliseconds)',
            { timeout }
          );
        }

        if (maxSize !== undefined && (
          typeof maxSize !== 'number' || 
          maxSize < 0 || 
          !Number.isInteger(maxSize)
        )) {
          throw new PayloadValidationError(
            'buffer.maxSize must be a non-negative integer (bytes)',
            { maxSize }
          );
        }
      }
    }

    // Validate keys if provided
    if (payload.keys) {
      if (typeof payload.keys !== 'object') {
        throw new PayloadValidationError(
          'keys must be an object',
          { received: typeof payload.keys }
        );
      }

      // Get valid provider names from PROVIDERS
      const validProviders = Object.keys(PROVIDERS);

      Object.entries(payload.keys).forEach(([provider, key]) => {
        if (!validProviders.includes(provider)) {
          throw new PayloadValidationError(
            `Invalid provider name in keys: ${provider}`,
            { validProviders }
          );
        }
        if (typeof key !== 'string' || !key.trim()) {
          throw new PayloadValidationError(
            `Key for provider ${provider} must be a non-empty string`,
            { provider }
          );
        }
      });
    }

    return true;
  }
}

export default ValidationService; 