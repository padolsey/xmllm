import { expectType, expectError } from 'tsd';
import xmllm, { 
  Message, 
  PipelineHelpers, 
  XMLElement,
  PromptConfig,
  ModelPreference
} from '../index';
import { xmllm as clientXmllm, ClientProvider } from '../client';

// Positive test - should compile
const validMessage: Message = {
  role: 'user',
  content: 'hello'
};
expectType<Message>(validMessage);

// Negative test - should fail with invalid role
// @ts-expect-error
const invalidMessage2: Message = {
  role: 'invalid' as const,
  content: 'hello'
};

// Positive test - valid XMLElement
const validElement: XMLElement = {
  $text: 'content',
  $attr: { class: 'test' },
  $key: 1,
  $closed: true
};
expectType<XMLElement>(validElement);

// Negative test - missing required XMLElement properties
// @ts-expect-error - XMLElement requires $attr, $key, and $closed properties
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

// Negative test - wrong type for temperature
// @ts-expect-error - Temperature must be a number between 0 and 1, not a string
const invalidPromptConfig: PromptConfig = {
  temperature: 'high' // This should trigger a type error
};

// Main xmllm usage - valid case
const stream = xmllm(validPipeline, {
  timeout: 1000,
  apiKeys: {
    ANTHROPIC_API_KEY: 'test'
  }
});
expectType<AsyncGenerator<any>>(stream);

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