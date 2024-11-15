import { jest } from '@jest/globals';
import StreamManager from '../src/StreamManager.mjs';

describe('StreamManager', () => {
  let streamManager;
  let mockRes;
  let mockStream;
  let mockReader;

  beforeEach(() => {
    // Reset mocks
    mockRes = {
      write: jest.fn(),
      end: jest.fn()
    };

    mockReader = {
      read: jest.fn(),
      releaseLock: jest.fn()
    };

    mockStream = {
      getReader: () => mockReader
    };

    streamManager = new StreamManager({ timeout: 100 });
  });

  test('handles successful stream', async () => {
    mockReader.read
      .mockResolvedValueOnce({ value: new TextEncoder().encode('test'), done: false })
      .mockResolvedValueOnce({ done: true });

    await streamManager.createStream(mockStream, mockRes);

    expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('test'));
    expect(mockRes.write).toHaveBeenCalledWith('event: close\ndata: Stream ended\n\n');
    expect(mockReader.releaseLock).toHaveBeenCalled();
  });

  test('handles stream timeout', async () => {
    jest.useFakeTimers();
    
    // Create a promise we can resolve to prevent hanging
    let resolveRead;
    mockReader.read.mockImplementation(() => 
      new Promise(resolve => { resolveRead = resolve; })
    );

    const streamPromise = streamManager.createStream(mockStream, mockRes);
    
    // Advance timers and resolve the read promise
    jest.advanceTimersByTime(100);
    resolveRead({ done: true });
    
    await streamPromise;

    expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('STREAM_TIMEOUT'));
    expect(mockReader.releaseLock).toHaveBeenCalled();
    jest.useRealTimers();
  }, 1000); // explicit timeout

  test('handles stream error', async () => {
    const error = new Error('Stream failed');
    mockReader.read.mockRejectedValueOnce(error);

    await streamManager.createStream(mockStream, mockRes);

    expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('STREAM_ERROR'));
    expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('Stream failed'));
    expect(mockReader.releaseLock).toHaveBeenCalled();
  });

  test('closeAll closes all active streams', async () => {
    // Setup two separate readers and streams
    const mockReader1 = { read: jest.fn(), releaseLock: jest.fn() };
    const mockReader2 = { read: jest.fn(), releaseLock: jest.fn() };
    
    const mockStream1 = { getReader: () => mockReader1 };
    const mockStream2 = { getReader: () => mockReader2 };

    // Start streams but don't await them
    mockReader1.read.mockImplementation(() => new Promise(() => {}));
    mockReader2.read.mockImplementation(() => new Promise(() => {}));
    
    streamManager.createStream(mockStream1, mockRes);
    streamManager.createStream(mockStream2, mockRes);
    
    // Small delay to ensure streams are registered
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(streamManager.activeStreams.size).toBe(2);
    
    await streamManager.closeAll();
    
    expect(streamManager.activeStreams.size).toBe(0);
    expect(mockReader1.releaseLock).toHaveBeenCalled();
    expect(mockReader2.releaseLock).toHaveBeenCalled();
  }, 1000); // explicit timeout

  describe('Edge Cases and Recovery', () => {
    test('handles malformed stream data', async () => {
      mockReader.read
        .mockResolvedValueOnce({ value: new TextEncoder().encode('[invalid json]'), done: false })
        .mockResolvedValueOnce({ done: true });

      await streamManager.createStream(mockStream, mockRes);
      
      // Should continue processing despite malformed data
      expect(mockRes.write).toHaveBeenCalled();
      expect(mockReader.releaseLock).toHaveBeenCalled();
    });

    test('handles stream interruption and cleanup', async () => {
      const error = new Error('Connection lost');
      mockReader.read
        .mockResolvedValueOnce({ value: new TextEncoder().encode('partial data'), done: false })
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ done: true });

      await streamManager.createStream(mockStream, mockRes);

      // Should handle the error and clean up
      expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('STREAM_ERROR'));
      expect(mockReader.releaseLock).toHaveBeenCalled();
      expect(streamManager.activeStreams.size).toBe(0);
    });

    test('handles backpressure scenarios', async () => {
      // Simulate backpressure by making res.write return false
      mockRes.write.mockReturnValue(false);
      
      const largeData = new TextEncoder().encode('x'.repeat(16384)); // 16KB
      mockReader.read
        .mockResolvedValueOnce({ value: largeData, done: false })
        .mockResolvedValueOnce({ done: true });

      await streamManager.createStream(mockStream, mockRes);
      
      // Should handle backpressure without crashing
      expect(mockRes.write).toHaveBeenCalled();
      expect(mockReader.releaseLock).toHaveBeenCalled();
    });
  });

  describe('Concurrent Stream Management', () => {
    test('handles multiple concurrent streams', async () => {
      const streams = Array(5).fill().map(() => ({
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ value: new TextEncoder().encode('test'), done: false })
            .mockResolvedValueOnce({ done: true }),
          releaseLock: jest.fn()
        })
      }));

      const promises = streams.map(stream => 
        streamManager.createStream(stream, mockRes)
      );

      await Promise.all(promises);

      expect(streamManager.activeStreams.size).toBe(0); // All cleaned up
      expect(mockRes.write).toHaveBeenCalledTimes(streams.length * 2); // Data + close for each
    });

    test('graceful shutdown with active streams', async () => {
      // Create readers first so we can track them
      const readers = Array(3).fill().map(() => ({
        read: jest.fn().mockImplementation(() => new Promise(() => {})),
        releaseLock: jest.fn()
      }));

      const hangingStreams = readers.map(reader => ({
        getReader: () => reader
      }));

      // Start the streams
      const streamPromises = hangingStreams.map(stream => 
        streamManager.createStream(stream, mockRes)
      );

      // Small delay to ensure streams are registered
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await streamManager.closeAll();

      expect(streamManager.activeStreams.size).toBe(0);
      readers.forEach(reader => {
        expect(reader.releaseLock).toHaveBeenCalled();
      });
    });
  });
}); 