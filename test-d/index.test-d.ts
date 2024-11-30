import { expectType, expectError } from 'tsd';
import xmllm, { 
  Message, 
  PipelineHelpers, 
  XMLElement,
  PromptConfig,
  ModelPreference,
  simple,
  stream,
  XMLStream,
  SchemaType
} from '../index';
import { xmllm as clientXmllm, ClientProvider } from '../client';

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

// Client usage - valid cases
const client = new ClientProvider('http://localhost:3000');
expectType<ClientProvider>(client);

const clientStream = clientXmllm(validPipeline, client, {
  timeout: 1000
});
expectType<AsyncGenerator<any>>(clientStream);

// Negative test - missing required client provider
// @ts-expect-error - clientXmllm requires a client provider as its second argument
clientXmllm(validPipeline);

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
expectType<XMLStream<number>>(streamResult);

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
expectType<XMLStream<{
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
expectType<XMLStream<number>>(streamChained);

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
// This should error because value() returns Promise<T>, not XMLStream<T>
expectError(streamValue.map());

// First one - testing string literals as hints in schema
const schemaWithLiteralHints = {
  user: {
    name: "The user's full name",  // String literal as hint
    age: Number,
    occupation: "The person's current job title",  // String literal as hint
    hobbies: {
      hobby: ["A hobby they enjoy"]  // String literal in array
    }
  }
};

type HintSchema = {
  user: {
    name: string;
    age: number;
    occupation: string;
    hobbies: {
      hobby: string[];
    }
  }
};

const hintResult = await simple<HintSchema>(
  "Get user info",
  schemaWithLiteralHints
);
expectType<HintSchema>(hintResult);

// Test string literals as valid schema values at any level
const validSchemas: Record<string, SchemaType> = {
  topLevel: "This is a valid explanation hint",
  user: {
    name: "The user's full name",
    details: "Additional user information",
    age: Number
  },
  items: ["These are the items"],
  mixed: {
    hint: "An explanation hint",
    transform: Number,
    nested: {
      moreHints: "More documentation",
      value: String
    }
  }
};

// These should work
expectType<SchemaType>(validSchemas.topLevel);
expectType<SchemaType>(validSchemas.user);
expectType<SchemaType>(validSchemas.items);
expectType<SchemaType>(validSchemas.mixed);

// Second one - testing separate hints object
const schemaWithHints = {
  user: {
    name: String,
    age: Number
  }
};

const hints = {
  user: {
    name: "User's full name",
    age: "User's age in years"
  }
};

// Should work with both schema and hints
const resultWithHints = await simple<{
  user: { name: string; age: number }
}>(
  "Get user info",
  schemaWithHints,
  {
    hints
  }
);

// Should error when hints provided without schema
expectError(simple(
  "Get user info",
  undefined,
  {
    hints  // Should error - hints requires schema
  }
));

// Test prompt function signatures
const pipeline = (helpers: PipelineHelpers) => [
  // Test string prompt with schema
  helpers.prompt('List colors', { color: [String] }),

  // Test function returning config
  helpers.prompt(input => ({
    messages: [{
      role: 'user',
      content: `Analyze ${input}`
    }],
    schema: { analysis: String },
    mapper: (input, output) => ({
      input,
      analysis: output.analysis
    })
  })),

  // Test direct config object
  helpers.prompt({
    messages: [{
      role: 'user',
      content: 'List colors'
    }],
    schema: { color: [String] },
    system: 'You are a color expert',
    mapper: (input, output) => output,
    temperature: 0.7,
    model: 'claude:fast'
  }),

  // Test with options
  helpers.prompt(
    'List colors',
    { color: [String] },
    { temperature: 0.9 }
  )
];

// Test invalid usages - these SHOULD produce type errors
const invalidPipeline = (helpers: PipelineHelpers) => [
  // Should error: Invalid message role
  expectError(helpers.prompt({
    messages: [{
      role: 'invalid' as const,
      content: 'test'
    }]
  })),

  // Should error: Wrong temperature type
  expectError(helpers.prompt(
    'test',
    { color: [String] },
    { temperature: 'high' as const }
  ))
];