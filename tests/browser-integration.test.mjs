/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { configure, stream } from '../src/xmllm-client.mjs';
import { ReadableStream } from 'stream/web';
import { TextEncoder, TextDecoder } from 'util';

// Add required globals that jsdom doesn't provide
global.ReadableStream = ReadableStream;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

describe('Browser Integration', () => {
  it('should work with client provider', async () => {
    const mockClientProvider = {
      createStream: jest.fn().mockResolvedValue(new ReadableStream({
        async start(controller) {
          controller.enqueue(new TextEncoder().encode('<result>test</result>'));
          controller.close();
        }
      })),
      setLogger: jest.fn()
    };

    configure({
      clientProvider: mockClientProvider
    });

    const result = await stream('test query', {
      schema: { result: String }
    }).last();

    expect(result).toEqual({ result: 'test' });
    expect(mockClientProvider.createStream).toHaveBeenCalledTimes(1);
    expect(mockClientProvider.createStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('XML')
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('test query')
          })
        ]),
        temperature: expect.any(Number),
        model: expect.any(Array)
      })
    );
  });

  it('should handle client provider errors', async () => {
    const mockClientProvider = {
      createStream: jest.fn().mockRejectedValue(new Error('Network error')),
      setLogger: jest.fn()
    };

    configure({
      clientProvider: mockClientProvider
    });

    await expect(
      stream('test query', {
        schema: { result: String }
      }).last()
    ).rejects.toThrow('Network error');
  });
}); 