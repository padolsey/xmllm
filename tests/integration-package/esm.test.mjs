import { jest } from '@jest/globals';
import xmllm from 'xmllm';
import * as xmllmClient from 'xmllm/client';
import xmllmProxy from 'xmllm/proxy';

describe('ESM Imports', () => {
  test('Main module can be imported', () => {
    expect(typeof xmllm).toBe('function');
  });

  test('Client module can be imported', () => {
    expect(typeof xmllmClient).toBe('object');
    expect(typeof xmllmClient.default.xmllm).toBe('function');
  });

  test('Proxy module can be imported', () => {
    expect(typeof xmllmProxy).toBe('function');
  });

  // Add a basic functionality test
  test('xmllm function works', async () => {
    const result = await xmllm(({ select, parse }) => [
      parse('<root><item>Test</item></root>'),
      select('item')
    ]);
    
    expect((await result.next()).value).toBeNode({ $$tagkey: 1, $$attr: {}, $$text: 'Test', $$tagclosed: true });
  });

  test('Client named exports are available', () => {
    const { simple, stream, configure, ClientProvider } = xmllmClient;
    expect(typeof simple).toBe('function');
    expect(typeof stream).toBe('function');
    expect(typeof configure).toBe('function');
    expect(typeof ClientProvider).toBe('function');
  });
});