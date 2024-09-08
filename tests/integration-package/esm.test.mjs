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
    const result = await xmllm(({ select }) => [
      function* () {
        yield '<root><item>Test</item></root>';
      },
      select('item')
    ]);
    
    expect((await result.next()).value).toEqual({ key: 1, attr: {}, text: 'Test' });
  });
});