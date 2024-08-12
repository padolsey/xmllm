const xmllm = require('./index.js');

(async () => {
  const results = await xmllm(({prompt}) => {
    return [
      function* initialTopics() {
        yield "Artificial Intelligence";
        yield "Climate Change";
        yield "Space Exploration";
      },
      prompt(
        topic => `Provide three subtopics for "${topic}" from different perspectives: scientific, social, and economic.`,
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
          return `Give a brief explanation of "${title}" from a ${perspective} perspective, and suggest one potential future development.`;
        },
        {
          explanation: String,
          future_development: String
        }
      ),
      function* (results) {
        for (const result of results) {
          yield {
            ...result,
            relevance_score: Math.random() * 10  // Simulating a relevance score
          };
        }
      },
      function (results) {
        const sortedResults = results.sort((a, b) => b.relevance_score - a.relevance_score);
        return sortedResults[0];
      }
    ]
  });

  console.log(JSON.stringify(results, null, 2));
})();