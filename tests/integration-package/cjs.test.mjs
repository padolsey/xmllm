import { jest } from '@jest/globals';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_PATH = path.resolve(__dirname, '../../dist/cjs');

describe('CommonJS Imports', () => {
  let xmllm, xmllmClient, xmllmProxy;

  beforeAll(() => {
    // Use the compiled CJS versions from dist
    xmllm = require(path.join(DIST_PATH, 'xmllm-main.js'));
    xmllmClient = require(path.join(DIST_PATH, 'xmllm-client.js'));
    xmllmProxy = require(path.join(DIST_PATH, 'proxies/default.js'));
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
    expect(value).toBeNode({ $$tagkey: 1, $$attr: {}, $$text: 'Test', $$tagclosed: true });
  });

  test('Named exports are available via require', () => {
    const { simple, stream, configure } = xmllm;
    expect(typeof simple).toBe('function');
    expect(typeof stream).toBe('function');
    expect(typeof configure).toBe('function');
  });

  test('Named exports are available via destructuring', () => {
    const { simple, stream, configure } = xmllm;
    expect(typeof simple).toBe('function');
    expect(typeof stream).toBe('function');
    expect(typeof configure).toBe('function');
  });
});