import { expectType, expectError } from 'tsd';
import xmllm, { 
  Message, 
  PipelineHelpers, 
  XMLElement,
  PromptConfig,
  ModelPreference,
  simple,
  stream,
  ChainableStreamInterface,
  SchemaType,
  HintType,
  configure,
  ConfigureOptions,
  ClientProvider,
  BaseStreamConfig,
  SchemaStreamConfig,
  StreamOptions,
  DefaultsConfig
} from '../index';
import { xmllm as clientXmllm } from '../client';

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
const validModelPreference: ModelPreference = 'claude:good';
const validModelConfig: ModelPreference = {
  inherit: 'claude',
  name: 'claude-3-opus',
  maxContextSize: 100000
};
const validModelArray: ModelPreference = ['claude:good', 'openai:fast'];

// Negative test - invalid model string format
// @ts-expect-error - Model string must be in format 'provider:model' where provider is one of: claude, openai, togetherai, perplexityai
const invalidModelPreference: ModelPreference = 'invalid:model';

// Positive test - valid prompt config
const validPromptConfig: PromptConfig = {
  messages: [validMessage],
  system: 'You are a helpful assistant',
  model: 'claude:good',
  temperature: 0.7,
  max_tokens: 1000
};
expectType<PromptConfig>(validPromptConfig);

// Test invalid prompt config without @ts-expect-error
const invalidPromptConfig = {
  temperature: 'high' as const
} as const;
expectError<PromptConfig>(invalidPromptConfig);

// Main xmllm usage - valid case
const testStream = xmllm(validPipeline, {
  timeout: 1000,
  apiKeys: {
    ANTHROPIC_API_KEY: 'test'
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
expectError<PromptConfig>({
  temperature: 'high' as const
});

// Add comprehensive simple() tests

// Test simple() with basic types
const numberResult = await simple<{ answer: number }>(
  "What is 2+2?",
  { answer: Number }
);
expectType<{ answer: number }>(numberResult);

// Test simple() with nested schema
const userResult = await simple<{
  user: {
    name: string;
    age: number;
    tags: string[];
  }
}>(
  "Get user info",
  {
    user: {
      name: String,
      age: Number,
      tags: [String]
    }
  }
);
expectType<{
  user: {
    name: string;
    age: number;
    tags: string[];
  }
}>(userResult);

// Test simple() with custom transformers
const dateResult = await simple<{ date: Date }>(
  "Get date",
  {
    date: (element: XMLElement) => new Date(element.$text)
  }
);
expectType<{ date: Date }>(dateResult);

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
    user: {
      name: String,
      age: Number,
      hobbies: [String]
    }
  },
  { hints: validHints }
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
    model: ['claude:good', 'openai:fast'],
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

// Import client configure and types to test client-specific options
import { configure as clientConfigure, ClientConfigureOptions } from '../client';

// Test valid client-side configure
expectType<void>(clientConfigure({
  clientProvider: 'http://localhost:3000',
  logging: {
    level: 'DEBUG' as const
  },
  defaults: {
    temperature: 0.8
  }
}));

// Test error message configuration
expectType<void>(configure({
  defaults: {
    errorMessages: {
      genericFailure: "Custom error",
      rateLimitExceeded: "Custom rate limit message",
      networkError: "Custom network error"
    }
  }
}));

// Test error messages in stream config
const streamWithErrors = stream("Test query", {
  errorMessages: {
    genericFailure: "Custom error",
    rateLimitExceeded: "Custom rate limit message"
  }
});
expectType<ChainableStreamInterface<XMLElement>>(streamWithErrors);

// Test invalid error message keys
const invalidErrorMessages = {
  errorMessages: {
    invalidKey: "This should error"  // Not a valid error message key
  }
} as const;
expectError<ConfigureOptions>({
  defaults: invalidErrorMessages
});

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
  model: 'claude:fast'
};
expectType<BaseStreamConfig>(validBaseConfig);

// Test SchemaStreamConfig extends BaseStreamConfig properly
const validSchemaConfig: SchemaStreamConfig = {
  ...validBaseConfig,
  schema: { answer: String },
  hints: { answer: 'The answer to the question' },
  mode: 'state_open',
  prompt: 'What is 2+2?'
};
expectType<SchemaStreamConfig>(validSchemaConfig);

// Test that stream() accepts both string and SchemaStreamConfig
const streamWithString = stream('What is 2+2?');
const streamWithConfig = stream(validSchemaConfig);
expectType<ChainableStreamInterface<XMLElement>>(streamWithString);
expectType<ChainableStreamInterface<XMLElement>>(streamWithConfig);

// Test that stream() options extend SchemaStreamConfig properly
const streamWithOptions = stream('prompt', {
  schema: { answer: String },
  Stream: async () => new ReadableStream(),
  apiKeys: {
    ANTHROPIC_API_KEY: 'key'
  }
});
expectType<ChainableStreamInterface<XMLElement>>(streamWithOptions);

// Test that DefaultsConfig matches SchemaStreamConfig
const defaults: DefaultsConfig = {
  temperature: 0.7,
  mode: 'state_closed',
  model: ['claude:fast', 'openai:fast'],
  schema: { answer: String }
};
expectType<DefaultsConfig>(defaults);

// Test error cases for configuration types
expectError<BaseStreamConfig>({
  temperature: 'hot'  // Should be number
});

expectError<SchemaStreamConfig>({
  mode: 'invalid_mode'  // Should be one of the valid modes
});

expectError<StreamOptions>({
  Stream: 'not a function'  // Should be a StreamFunction
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
const withCustomPromptGenerators: SchemaStreamConfig = {
  prompt: "What is 2+2?",
  generateSystemPrompt: (system) => `Custom system: ${system || ''}`,
  generateUserPrompt: (scaffold, prompt) => `Custom user: ${prompt}`
};
expectType<SchemaStreamConfig>(withCustomPromptGenerators);

// Test that generateUserPrompt can return Message[]
const withMessageGenerator: SchemaStreamConfig = {
  prompt: "What is 2+2?",
  generateUserPrompt: (scaffold, prompt, sudo) => [{
    role: 'user',
    content: prompt
  }]
};
expectType<SchemaStreamConfig>(withMessageGenerator);

// Test invalid prompt generators
expectError<SchemaStreamConfig>({
  generateSystemPrompt: "not a function"  // Should be a function
});

expectError<SchemaStreamConfig>({
  generateUserPrompt: () => 42  // Should return string or Message[]
});
