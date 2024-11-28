import {
  MessageValidationError,
  ModelValidationError,
  ParameterValidationError
} from './errors/ValidationErrors.mjs';

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

      if (!['user', 'assistant'].includes(message.role)) {
        throw new MessageValidationError(
          'Invalid message role',
          { index, role: message.role, validRoles: ['user', 'assistant'] }
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

    const [provider, type] = (model || '').split(':');
    
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

    if (!availableModels[provider].models[type]) {
      throw new ModelValidationError(
        'Model type not found for provider',
        { provider, type, index, availableTypes: Object.keys(availableModels[provider].models) }
      );
    }

    return true;
  }

  static validateConstraints(constraints) {
    if (!constraints) return true;

    if (constraints.rpmLimit !== undefined) {
      // First check if it's a number at all
      if (typeof constraints.rpmLimit !== 'number' || Number.isNaN(constraints.rpmLimit)) {
        throw new ParameterValidationError(
          'rpmLimit must be a whole number',
          { rpmLimit: constraints.rpmLimit }
        );
      }

      // Then check for finite
      if (!Number.isFinite(constraints.rpmLimit)) {
        throw new ParameterValidationError(
          'rpmLimit must be finite',
          { rpmLimit: constraints.rpmLimit }
        );
      }

      // Then check for integer
      if (!Number.isInteger(constraints.rpmLimit)) {
        throw new ParameterValidationError(
          'rpmLimit must be a whole number',
          { rpmLimit: constraints.rpmLimit }
        );
      }

      // Finally check for positive
      if (constraints.rpmLimit <= 0) {
        throw new ParameterValidationError(
          'rpmLimit must be positive',
          { rpmLimit: constraints.rpmLimit }
        );
      }

    }

    return true;
  }

  static validateParameters(params) {
    const {
      temperature,
      max_tokens,
      stream,
      cache
    } = params;

    if (temperature !== undefined) {
      // OpenAI allows up to 2.0; let's just use that.
      if (
        typeof temperature !== 'number' ||
        temperature < 0 ||
        temperature > 2
      ) {
        throw new ParameterValidationError(
          'Temperature must be between 0 and 2',
          { temperature }
        );
      }
    }

    if (max_tokens !== undefined) {
      if (!Number.isInteger(max_tokens) || max_tokens <= 0) {
        throw new ParameterValidationError(
          'max_tokens must be a positive integer',
          { max_tokens }
        );
      }
    }

    if (stream !== undefined && typeof stream !== 'boolean') {
      throw new ParameterValidationError(
        'stream must be a boolean',
        { stream }
      );
    }

    if (cache !== undefined && typeof cache !== 'boolean') {
      throw new ParameterValidationError(
        'cache must be a boolean',
        { cache }
      );
    }

    if (params.constraints) {
      this.validateConstraints(params.constraints);
    }

    return true;
  }

  static validateConfig(config) {
    // ... existing validation ...

    // Hints requires schema
    if (config.hints && !config.schema) {
      throw new Error('Cannot provide hints without a schema');
    }

    // If both provided, validate hints against schema
    if (config.hints && config.schema) {
      IncomingXMLParserSelectorEngine.validateHints(config.schema, config.hints);
    }
  }
}

export default ValidationService; 