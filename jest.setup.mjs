import { jest } from '@jest/globals';
import './test_utils/matchers.mjs';

// Increase the timeout for all tests
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Wait a bit to allow any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 500));
}); 