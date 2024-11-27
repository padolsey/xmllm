import { jest } from '@jest/globals';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

describe('CommonJS Imports', () => {
  let xmllm, xmllmClient, xmllmProxy;

  beforeAll(() => {
    xmllm = require('xmllm');
    xmllmClient = require('xmllm/client');
    xmllmProxy = require('xmllm/proxy');
  });

  test('Main module can be required', () => {
    expect(typeof xmllm).toBe('object');
    expect(typeof xmllm.default).toBe('function');
  });

  test('Client module can be required', () => {
    expect(typeof xmllmClient).toBe('object');
    expect(typeof xmllmClient.default.xmllm).toBe('function');
  });

  test('Proxy module can be required', () => {
    expect(typeof xmllmProxy).toBe('object');
    expect(typeof xmllmProxy.default).toBe('function');
  });

  // Add a basic functionality test
  test('xmllm function works', async () => {
    const result = await xmllm.default(({ select, parse }) => [
      parse('<root><item>Test</item></root>'),
      select('item')
    ]);
    
    const value = (await result.next()).value;
    expect(value).toBeNode({ $key: 1, $attr: {}, $text: 'Test', $closed: true });
  });
});