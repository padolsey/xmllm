const xmllm = require('../index.js');

// Mock the llmStream function
jest.mock('../Stream.js', () => {
  const mockFn = jest.fn();
  mockFn
    .mockImplementationOnce(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<thinking>'), done: false })
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<item><name>Test Result</name><value>42</value></item>'), done: false })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }))
    .mockImplementationOnce(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<thinking><subtopic><perspective>Test Result</perspective><title>Test Result</title></subtopic></thinking>'), done: false })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }))
    .mockImplementationOnce(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<thinking><explanation>Test Result</explanation></thinking>'), done: false })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));
  return mockFn;
});

describe('xmllm', () => {
  describe('Simple pipeline', () => {
    it('should process a single step pipeline', async () => {
      const results = await xmllm(({ select }) => [
        function* () {
          yield '<root><item>Test</item></root>';
        },
        select('item')
      ]);
      
      expect(results).toEqual([{ key: 1, attr: {}, text: 'Test' }]);
    });
  });

  describe('xmllm.prompt', () => {
    it('should process a prompt and apply selection schema', async () => {
      const results = await xmllm(({ prompt }) => [
        prompt(
          'List an item',
          {
            item: {
              name: String,
              value: Number
            }
          }
        ),
        function*(thing) {
          console.log(888, thing);
          yield thing;
        }
      ]);

      expect(results[0]).toEqual([{
        item: {
          name: 'Test Result',
          value: 42 
        }
      }]);
    });
  });

  describe('xmllm.mapSelect', () => {
    it('should select and map XML content', async () => {
      const results = await xmllm(({ mapSelect }) => [
        function* () {
          yield '<root><item><name>Item 1</name><value>10</value></item><item><name>Item 2</name><value>20</value></item></root>';
        },
        mapSelect({
          item: [{
            name: String,
            value: Number
          }]
        })
      ]);

      expect(results).toEqual([{
        item: [
          { name: 'Item 1', value: 10 },
          { name: 'Item 2', value: 20 }
        ]
      }]);
    });
  });

  describe('Complex pipeline', () => {
    it('should process a multi-step pipeline', async () => {
      const results = await xmllm(({ prompt }) => [
        function* () {
          yield "Artificial Intelligence";
        },
        prompt(
          topic => `Provide a subtopic for "${topic}" from a scientific perspective.`,
          {
            subtopic: [{
              perspective: String,
              title: String
            }]
          }
        ),
        prompt(
          (thing) => {
            const {subtopic: [{perspective, title}]} = thing;
            return `Give a brief explanation of "${title}" from a ${perspective} perspective.`;
          },
          {
            explanation: String
          },
          function({subtopic}, {explanation}) {
            return {
              subtopic, explanation
            }
          }
        )
      ]);

      console.log(44444, results);

      expect(results[0][0].subtopic).toBeDefined();
      expect(results[0][0].subtopic[0].perspective).toBe('Test Result');
      expect(results[0][0].subtopic[0].title).toBe('Test Result');
      expect(results[0][0].explanation).toBe('Test Result');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', async () => {
      const results = await xmllm(({ select }) => [
        function* () {
          yield '';
        },
        select('item')
      ]);

      expect(results).toEqual([]);
    });

    it('should handle malformed XML', async () => {
      const results = await xmllm(({ select }) => [
        function* () {
          yield '<root><item>Test</item><unclosed>';
        },
        select('item')
      ]);

      expect(results).toEqual([{ key: 1, attr: {}, text: 'Test' }]);
    });
  });
});