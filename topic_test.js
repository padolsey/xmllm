const xmllm = require('./index.js');

(async () => {
  const pipeline = [
    function* initialTopics() {
      yield "Artificial Intelligence";
      yield "Climate Change";
      yield "Space Exploration";
    },
    xmllm.prompt(
      topic => `Provide three subtopics for "${topic}" from different perspectives: scientific, social, and economic.`,
      {
        subtopic: [{
          perspective: String,
          title: String
        }]
      }
    ),
    // function* (subtopics) {
    //   for (const subtopic of subtopics) {
    //     console.log('Yielding subtopic', subtopic)
    //     yield subtopic;
    //   }
    // },
    xmllm.prompt(
      (thing) => {
        console.log('Thing99', thing);
        const {subtopic: [{perspective, title}]} = thing;
        return `Give a brief explanation of "${title}" from a ${perspective} perspective, and suggest one potential future development.`;
      },
      {
        explanation: String,
        future_development: String
      }
    ),
    function* (results) {
      console.log('PostResults', results);
      for (const result of results) {
        yield {
          ...result,
          relevance_score: Math.random() * 10  // Simulating a relevance score
        };
      }
    },
    function (results) {
      console.log('Results>>', results);
      const sortedResults = results.sort((a, b) => b.relevance_score - a.relevance_score);
      return sortedResults[0];  // Only yield the most relevant result
    }
  ];

  const results = await xmllm(pipeline);
  console.log(JSON.stringify(results, null, 2));
})();