import { expectAssignable, expectError, expectNotAssignable, expectNotType, expectType } from 'tsd';
import xmllm, {
  // Core types
  Message,
  XMLElement,
  
  // Base configurations
  BaseLLMParams,
  BaseConfig,
  BaseStreamConfig, 
  BaseSchemaConfig,
  BaseStreamingSchemaConfig,
  ServerConfig,
  SchemaServerConfig,
  StreamingServerConfig,
  StreamingSchemaServerConfig,
  
  // Model types
  ModelPreference,
  
  // Schema types
  SchemaType,
  HintType,
  
  // Stream interface
  ChainableStreamInterface,
  
  // Configuration
  LoggingConfig,
  ConfigureOptions,
  DefaultsConfig,
  
  // Pipeline helpers
  PipelineHelpers,
  
  // Main functions
  stream,
  simple,
  configure
} from '../index';

import {
  ClientProvider,
  ClientStreamingConfig,
  ClientStreamingSchemaConfig,
  ClientSchemaConfig,
  ClientConfigureOptions,
  configure as clientConfigure
} from '../client';

// Positive test - should compile
const validMessage: Message = {
  role: 'user',
  content: 'hello'
};
expectType<Message>(validMessage);

// Test invalid message without @ts-expect-error
const invalidMessage2 = {
  role: 'invalid' as const,
  content: 'hello'
} as const;
expectError<Message>(invalidMessage2);

// Positive test - valid XMLElement
const validElement: XMLElement = {
  $text: 'content',
  $attr: { class: 'test' },
  $tagkey: 1,
  $tagclosed: true
};
expectType<XMLElement>(validElement);

// Negative test - missing required XMLElement properties
// @ts-expect-error - XMLElement requires $attr, $tagkey, and $tagclosed properties
const invalidElement: XMLElement = {
  $text: 'content' // Missing required properties should trigger error
};

// Pipeline helpers tests - all valid cases
const validPipeline = (helpers: PipelineHelpers) => [
  helpers.prompt({
    messages: [validMessage],
    temperature: 0.5
  }),
  helpers.map((x: string) => x.toUpperCase()),
  helpers.filter((x: string) => x.length > 0)
];

// Model preference tests - valid cases
const validModelPreference: ModelPreference = 'anthropic:good';
const validModelConfig: ModelPreference = {
  inherit: 'anthropic',
  name: 'claude-3-opus',
  maxContextSize: 100000
};
const validModelArray: ModelPreference = ['anthropic:good', 'openai:fast'];

// Negative test - invalid model string format
// @ts-expect-error - Model string must be in format 'provider:model' where provider is one of: claude, openai, togetherai, perplexityai
const invalidModelPreference: ModelPreference = 'invalid:model';

// Main xmllm usage - valid case
const testStream = xmllm(validPipeline, {
  keys: {
    anthropic: 'test'
  }
});
expectType<AsyncGenerator<any>>(testStream);

// Negative test - wrong argument type
// @ts-expect-error - xmllm's first argument must be a function that returns a pipeline array
xmllm('not a function');

// Test transformer helpers - valid cases
const validPipelineWithTransformers = (helpers: PipelineHelpers) => [
  helpers.prompt('test', {
    user: {
      name: helpers.text(),
      age: helpers.text(x => parseInt(x)),
      details: helpers.withAttrs((text, attrs) => ({
        content: text,
        id: attrs.id
      })),
      status: helpers.whenClosed(el => el.$text)
    }
  })
];

// Test schema types with arrays - valid cases
const validPipelineWithArrays = (helpers: PipelineHelpers) => [
  helpers.prompt('test', {
    'users[]': {
      name: helpers.text(),
      'emails[]': helpers.text()
    }
  })
];

// Test stream operations - valid cases
const validPipelineWithOperations = (helpers: PipelineHelpers) => [
  helpers.prompt('test'),
  helpers.accrue(),
  helpers.map((results: any[]) => results.join(', ')),
  helpers.tap(console.log),
  helpers.waitUntil((x: string) => x.length > 0),
  helpers.mergeAggregate()
];

// Message type test
expectError<Message>({
  role: 'invalid' as const,
  content: 'hello'
});

// PromptConfig test
expectError<BaseLLMParams>({
  temperature: 'high' as const
});

// Add comprehensive simple() tests

// Test simple() with basic types
const simpleResult = await simple<{ answer: number }>({
  prompt: "What is 2+2?",
  schema: { answer: Number }
});
expectType<{ answer: number }>(simpleResult);

// Test simple() with nested schema
const userResult = await simple<{
  user: {
    name: string;
    age: number;
    tags: string[];
  }
}>({
  prompt: "Get user info",
  schema: {
    user: {
      name: String,
      age: Number,
      tags: [String]
    }
  }
});
expectType<{
  user: {
    name: string;
    age: number;
    tags: string[];
  }
}>(userResult);

// Test simple() with custom transformers
const dateResult = await simple<{
  date: Date
}>({
  prompt: "Get date",
  schema: {
    date: (element: XMLElement) => new Date(element.$text)
  }
});
expectType<{ date: Date }>(dateResult);

// Test simple() with string prompt and options
const simpleWithOptions = await simple<{ answer: number }>("What is 2+2?", {
  schema: { answer: Number },
  temperature: 0.7
});
expectType<{ answer: number }>(simpleWithOptions);

// Test invalid schema
expectError(simple({
  prompt: "Test",
  schema: {
    field: 42  // Should error - raw numbers aren't valid schema types
  }
}));

// Test invalid function signature
expectError(simple({
  prompt: "Test",
  schema: {
    field: (x: number) => x  // Should error - transformers must take XMLElement
  }
}));

// Test stream() type inference - just rename local variable
const streamResult = stream("Count to 3")
  .select("number")
  .map((x: XMLElement) => parseInt(x.$text));
expectType<ChainableStreamInterface<number>>(streamResult);

// Test stream() with schema - rename local variable
const streamWithSchema = stream<{
  users: Array<{
    name: string;
    age: number;
  }>
}>("Get users", {
  schema: {
    users: [{
      name: String,
      age: Number
    }]
  }
});
expectType<ChainableStreamInterface<{
  users: Array<{
    name: string;
    age: number;
  }>
}>>(streamWithSchema);

// Test stream chaining type inference - rename local variable
const streamChained = stream("Test")
  .select("item")
  .map((x: XMLElement) => x.$text)
  .filter((x: string) => x.length > 0)
  .map((x: string) => parseInt(x));
expectType<ChainableStreamInterface<number>>(streamChained);

// Test error cases - use something that's definitely not a valid schema type
expectError<SchemaType>({
  number: 42  // Should error - raw numbers aren't valid schema types
});

// Or test invalid function signature
expectError<SchemaType>({
  field: (x: number) => x  // Should error - transformers must take XMLElement
});

const streamValue = stream("Test")
  .select("item")
  .value();
// This should error because value() returns Promise<T>, not ChainableStreamInterface<T>
expectError(streamValue.map());

// Valid hint test
const validHints = {
  user: {
    name: "User's full name",
    age: {
      another: "Age in years"
    },
    hobbies: ["A hobby description"]
  }
} as HintType;

// This should work
expectType<HintType>(validHints);

// Test with simple()
await simple(
  "Get user info",
  {
    schema: {
      user: {
        name: String,
        age: Number,
        hobbies: [String]
      }
    },
    hints: validHints
  }
);

// Invalid hint tests - Update these
const invalidHintNumber = {
  user: {
    name: 123  // Not a string
  }
} as const;
expectError<HintType>(invalidHintNumber);

const invalidHintBoolean = {
  user: {
    hobbies: true  // Not a string or string array
  }
} as const;
expectError<HintType>(invalidHintBoolean);

// Test valid server-side configure options
expectType<void>(configure({
  logging: {
    level: 'DEBUG' as const,
    custom: (level: string, ...args: any[]) => console.log(level, ...args)
  },
  defaults: {
    temperature: 0.7,
    maxTokens: 4000,
    model: ['anthropic:good', 'openai:fast'],
    mode: 'root_closed' as const
  }
}));

// Test invalid logging level
const invalidConfig = {
  logging: {
    level: 'INVALID_LEVEL' as const
  }
} as const;
expectError<ConfigureOptions>(invalidConfig);

// Test invalid defaults
const invalidDefaults = {
  defaults: {
    mode: 'invalid_mode' as const,
    temperature: 'hot' as const
  }
} as const;
expectError<ConfigureOptions>(invalidDefaults);

// Test that server configure rejects clientProvider
const serverWithClient = {
  clientProvider: 'http://localhost:3000'
} as const;
expectError<ConfigureOptions>(serverWithClient);

// Test client-side error messages
expectType<void>(clientConfigure({
  clientProvider: 'http://localhost:3000',
  defaults: {
    errorMessages: {
      rateLimitExceeded: "Custom rate limit message",
      networkError: "Custom network error"
    }
  }
}));

// Test BaseStreamConfig
const validBaseConfig: BaseStreamConfig = {
  messages: [{ role: 'user', content: 'hello' }],
  temperature: 0.7,
  max_tokens: 1000,
  cache: true,
  model: 'anthropic:fast'
};

const validSchemaStreamingConfig: BaseStreamingSchemaConfig = {
  ...validBaseConfig,
  schema: { answer: String },
  hints: { answer: 'The answer to the question' },
  mode: 'state_open',
  prompt: 'What is 2+2?'
};
expectType<BaseStreamingSchemaConfig>(validSchemaStreamingConfig);

// Test that stream() accepts both string and SchemaStreamConfig
const streamWithString = stream('What is 2+2?');
const streamWithConfig = stream(validSchemaStreamingConfig);
expectType<ChainableStreamInterface<XMLElement>>(streamWithString);
expectType<ChainableStreamInterface<XMLElement>>(streamWithConfig);

// Test that stream() options extend SchemaStreamConfig properly
const streamWithOptions = stream('prompt', {
  schema: { answer: String },
  // Stream: async () => new ReadableStream(), //old?
  keys: {
    anthropic: 'key'
  }
});
expectType<ChainableStreamInterface<XMLElement>>(streamWithOptions);


// Test error cases for configuration types
expectError<BaseStreamConfig>({
  temperature: 'hot'  // Should be number
});

expectError<StreamingSchemaServerConfig>({
  mode: 'invalid_mode'  // Should be one of the valid modes
});

// Test that client-side types work properly
import { stream as clientStream } from '../client';

const clientStreamResult = clientStream('prompt', {
  clientProvider: 'http://localhost:3000',
  schema: { answer: String },
  mode: 'state_open'
});
expectType<ChainableStreamInterface<XMLElement>>(clientStreamResult);

// Test that client configuration extends properly
expectError<ClientConfigureOptions>({
  clientProvider: 123  // Should be string or ClientProvider
});

// Test custom prompt generators
const withCustomPromptGenerators: BaseSchemaConfig = {
  prompt: "What is 2+2?",
  genSystemPrompt: (system) => `Custom system: ${system || ''}`,
  genUserPrompt: (scaffold, prompt) => `Custom user: ${prompt}`
};
expectType<BaseSchemaConfig>(withCustomPromptGenerators);

// Test that genUserPrompt can return Message[]
const withMessageGenerator: BaseStreamingSchemaConfig = {
  prompt: "What is 2+2?",
  genUserPrompt: (scaffold, prompt) => [{
    role: 'user',
    content: prompt
  }]
};
expectType<BaseStreamingSchemaConfig>(withMessageGenerator);

// Test invalid prompt generators
expectError<BaseStreamingSchemaConfig>({
  genSystemPrompt: "not a function"  // Should be a function
});

expectError<BaseStreamingSchemaConfig>({
  genUserPrompt: () => 42  // Should return string or Message[]
});

// Test that onChunk can be passed in defaults
expectType<void>(configure({
  defaults: {
    temperature: 0.7,
    onChunk: (chunk: string) => console.log(chunk),
    mode: 'root_closed' as const
  } satisfies DefaultsConfig
}));

// Also test with client configure
expectType<void>(clientConfigure({
  clientProvider: 'http://localhost:3000',
  defaults: {
    temperature: 0.7,
    onChunk: (chunk: string) => console.log(chunk),
    mode: 'root_closed' as const
  } satisfies DefaultsConfig
}));

// Test runtime keys with stream()
const streamWithKeys = stream("Test prompt", {
  keys: {
    openai: "test-key",
    anthropic: "test-key"
  }
});
expectType<ChainableStreamInterface<XMLElement>>(streamWithKeys);

// Test invalid key provider
expectError(stream("Test", {
  keys: {
    invalid_provider: "test-key"  // Should error - not a valid provider
  }
}));

// Test invalid key type
expectError(stream("Test", {
  keys: {
    openai: 123  // Should error - must be string
  }
}));

// Test configure() with keys
expectType<void>(configure({
  keys: {
    openai: "test-key",
    anthropic: "test-key"
  }
}));

// Test that old apiKeys format gives error
expectError(xmllm(() => [], {
  apiKeys: {  // Should error - apiKeys no longer supported
    OPENAI_API_KEY: "test"
  }
}));
