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
  Schema,
  Hint,
  Hints,
  
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
  configure,
  SchemaType
} from '../index';

import {
  ClientProvider,
  ClientStreamingConfig,
  ClientStreamingSchemaConfig,
  ClientSchemaConfig,
  ClientConfigureOptions,
  configure as clientConfigure
} from '../client';

import { types } from '../index';
import { SchemaItemsType } from '../index';

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
  $$text: 'content',
  $$attr: { class: 'test' },
  $$tagkey: 1,
  $$tagclosed: true
};
expectType<XMLElement>(validElement);

// Negative test - missing required XMLElement properties
// @ts-expect-error - XMLElement requires $$attr, $$tagkey, and $$tagclosed properties
const invalidElement: XMLElement = {
  $$text: 'content' // Missing required properties should trigger error
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
      status: helpers.whenClosed(el => el.$$text)
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
    date: (element: XMLElement) => new Date(element.$$text)
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
  .map((x: XMLElement) => parseInt(x.$$text));
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
  .map((x: XMLElement) => x.$$text)
  .filter((x: string) => x.length > 0)
  .map((x: string) => parseInt(x));
expectType<ChainableStreamInterface<number>>(streamChained);

// Test error cases - use something that's definitely not a valid schema type
expectError<Schema>({
  number: 42  // Should error - raw numbers aren't valid schema types
});

// Or test invalid function signature
expectError<Schema>({
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
} as Hints;

// This should work
expectType<Hints>(validHints);

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
expectError<Hint>(invalidHintNumber);

const invalidHintBoolean = {
  user: {
    hobbies: true  // Not a string or string array
  }
} as const;
expectError<Hint>(invalidHintBoolean);

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
  },
  idioSymbols: {
    openTagPrefix: '@',
    closeTagPrefix: '@',
    tagOpener: 'START(',
    tagCloser: 'END(',
    tagSuffix: ')'
  }
}));

// Test partial idioSymbols config
expectType<void>(configure({
  idioSymbols: {
    openTagPrefix: '@',
    closeTagPrefix: '@'
    // Other properties should remain default
  }
}));

// Test XML-like syntax config
expectType<void>(configure({
  idioSymbols: {
    openTagPrefix: '<',
    closeTagPrefix: '</',
    tagOpener: '',
    tagCloser: '',
    tagSuffix: '>'
  }
}));

// Test invalid idioSymbols config
expectError<ConfigureOptions>({
  idioSymbols: {
    openTagPrefix: 123  // Should be string
  }
});

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

// Test XMLElement dynamic properties
const dynamicElement: XMLElement = {
  $$text: "Hello",
  $$attr: {},
  $$tagkey: 1,
  $$tagclosed: true,
  // Dynamic properties:
  users: [{ name: "John" }],
  metadata: { count: 42 },
  tags: ["test", "example"],
  nested: {
    deeply: {
      value: "works"
    }
  }
};
expectType<XMLElement>(dynamicElement);

// Test that XMLElement can handle arrays of elements
const elementWithArrays: XMLElement = {
  $$text: "",
  $$attr: {},
  $$tagkey: 1,
  $$tagclosed: true,
  items: [
    { $$text: "one", $$attr: {}, $$tagkey: 2, $$tagclosed: true },
    { $$text: "two", $$attr: {}, $$tagkey: 3, $$tagclosed: true }
  ]
};
expectType<XMLElement>(elementWithArrays);

// Test that XMLElement requires core properties
expectError<XMLElement>({
  // Missing required properties should error
  users: []
});

// Test that any property type is allowed except for the core properties
const mixedElement: XMLElement = {
  $$text: "test",
  $$attr: {},
  $$tagkey: 1,
  $$tagclosed: true,
  numberProp: 42,
  boolProp: true,
  nullProp: null,
  undefinedProp: undefined,
  functionProp: () => "hello",
  dateProp: new Date(),
  complexProp: new Map()
};
expectType<XMLElement>(mixedElement);

// Test that core properties must be of correct type
expectError<XMLElement>({
  $$text: 42,  // Should be string
  $$attr: {},
  $$tagkey: 1,
  $$tagclosed: true
});

expectError<XMLElement>({
  $$text: "test",
  $$attr: "wrong",  // Should be Record<string, string>
  $$tagkey: 1,
  $$tagclosed: true
});

// Test complex nested schemas with items()
const complexSchema = {
  analysis: {
    topics: types.items({
      name: types.string("Topic name"),
      stats: {
        average_agreement: types.number("Agreement score")
          .withTransform((n: number) => Math.min(1, Math.max(0, n))),
        controversy_score: types.number("Controversy score"),
        observations: types.items(
          types.string("Key observation")
        )
      }
    })
  }
} as const;
expectAssignable<Schema>(complexSchema);

// Test that items() accepts any valid Schema
const itemsSchemas = {
  tags: types.items(types.string()),
  users: types.items({
    name: types.string(),
    age: types.number()
  }),
  categories: types.items({
    name: types.string(),
    subcategories: types.items({
      name: types.string(),
      items: types.items(types.string())
    })
  }),
  scores: types.items(
    types.number("Score 0-100")
      .withDefault(0)
      .withTransform((n: number) => Math.min(100, Math.max(0, n)))
  )
} as const;
expectAssignable<Schema>(itemsSchemas);

// Test invalid items() usage
expectError<Schema>({
  invalid: types.items(123)  // Pass number directly to trigger type error
});

expectError<Schema>({
  invalid: types.items({
    field: true  // Pass boolean directly to trigger type error
  })
});

// Test against SchemaType directly with definitely invalid values
expectError<SchemaType>(types.items(null));  // Should error - null is not a valid schema
expectError<SchemaType>(types.items(new Date()));  // Should error - Date is not a valid schema

// Test that items() schema matches root schema capabilities
const rootSchema = {
  name: types.string(),
  age: types.number()
} as const;

const itemsWithSameCapabilities = types.items(rootSchema);
expectAssignable<SchemaItemsType>(itemsWithSameCapabilities);
