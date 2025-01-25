import { jest } from '@jest/globals';
import path from 'path';
import { readFile } from 'fs/promises';

describe('Browser Exports', () => {
  let packageJson;

  beforeAll(async () => {
    const pkgPath = path.join(process.cwd(), 'package.json');
    packageJson = JSON.parse(await readFile(pkgPath, 'utf8'));
  });

  it('should have correct browser mappings', () => {
    const exports = packageJson.exports;
    
    // Check fs mapping
    expect(exports['./fs'].browser).toBe('./src/fs-shim.mjs');
    expect(exports['./fs'].node).toBe('./src/fs-node.mjs');
    expect(exports['./fs'].default).toBe('./src/fs-node.mjs');

    // Check client mapping
    expect(exports['./client'].browser).toBe('./src/xmllm-client.mjs');
    expect(exports['./client'].default).toBe('./src/xmllm-client.mjs');
  });

  it('should not include Node.js specific imports in browser files', async () => {
    const browserFs = await readFile('./src/fs-shim.mjs', 'utf8');
    expect(browserFs).not.toContain('fs/promises');
    expect(browserFs).not.toContain('process.cwd()');
  });

  it('should have correct browser field overrides', () => {
    const browser = packageJson.browser;
    expect(browser['./src/fs.mjs']).toBe('./src/fs-shim.mjs');
    expect(browser['fs/promises']).toBe(false);
    expect(browser['path']).toBe(false);
  });
}); 