import xmllm, { Message, PipelineHelpers, ModelPreference } from '../index';

// This is just a test file to make sure types are correct
// Use `npx tsc --noEmit` to confirm no errors.

// Should compile: correct Message type
const message: Message = {
    role: 'user',
    content: 'hello'
};

// Should compile: correct pipeline usage
const pipeline = (helpers: PipelineHelpers) => [
    helpers.prompt({
        messages: [message],
        temperature: 0.5
    })
];

// This will run the type checker against actual usage
xmllm(pipeline, {
    timeout: 1000
}); 