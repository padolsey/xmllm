'use client'

import { useState } from 'react'
import { ClientProvider, stream, simple } from '../../../../src/xmllm-client.mjs'
import type { XMLElement } from '../../../../index'

const client = new ClientProvider('http://localhost:3124/api/stream')

// Define our domain types
interface NewsArticle {
  title: string
  summary: string
  topics: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  readingTime: number
}

interface AnalysisResult {
  articles: NewsArticle[]
  top_topic: string[]
  overallSentiment: string
  metadata: {
    processedAt: Date
    articleCount: number
  }
}

// Schema with explanation hints
const analysisSchema = {
  article: [{
    title: "The article's headline",
    summary: "A brief summary of the key points",
    topics: ["Key topics or themes"],
    sentiment: "The overall tone (positive/negative/neutral)",
    readingTime: Number
  }],
  top_topic: ["Most frequent topics across all articles"],
  overallSentiment: "General sentiment across all articles",
  metadata: {
    processedAt: (el: XMLElement) => new Date(el.$text),
    articleCount: Number
  }
} as const;

export default function ComplexTypescript() {
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function runAnalysis() {
    setLoading(true)
    setOutput('Starting analysis...\n')

    try {
      // First, get raw headlines using streaming
      console.debug('Starting headline stream...');
      
      // const headlineStream = stream(
      //   'List 3 recent tech headlines. Format each as <headline>...</headline>',
      //   client,
      //   {
      //     model: 'claude:fast'
      //   }
      // )
      // .select('headline')
      // .closedOnly()
      // .map((el: XMLElement) => {
      //   console.debug('Processing element:', el);
      //   return el.$text;
      // })
      // .debug('Headlines Stream');

      // const headlines: string[] = [];
      // for await (const headline of headlineStream) {
      //   console.debug('Received headline:', headline);
      //   headlines.push(headline);
      //   setOutput(prev => prev + `Found headline: ${headline}\n`);
      // }

      // if (headlines.length === 0) {
      //   throw new Error('No headlines were received from the stream');
      // }

      const headlines = [ "Apple Unveils Vision Pro Mixed Reality Headset, Set to Launch in Early 2024", "OpenAI Releases GPT-4 Turbo with Improved Capabilities and Lower Costs", "Elon Musk's xAI Launches 'Grok' AI Chatbot to Compete with ChatGPT" ];

      console.log('All headlines:', headlines);

      // Then analyze them in detail using schema
      const prompt = `Analyze these tech headlines:\n${headlines.join('\n')}`;
      console.debug('Analysis prompt:', prompt);
      
      const analysis = await simple<AnalysisResult>(
        prompt,
        analysisSchema,
        {
          model: 'claude:fast',
          clientProvider: client
        }
      );

      console.debug('Raw analysis result:', analysis);

      if (!analysis || Object.keys(analysis).length === 0) {
        throw new Error('Analysis returned empty result');
      }

      // Process the results
      const summary = await stream(
        `Summarize these findings:
         - Found ${analysis.article.length} articles
         - Top topics: ${analysis.top_topic.join(', ')}
         - Overall sentiment: ${analysis.overallSentiment}
         
         Format as <summary>...</summary>`,
        {
          model: 'claude:fast',
          clientProvider: client
        }
      )
      .select('summary')
      .last();

      console.debug('Summary:', summary.$text);

      // Show the final summary
      setOutput(prev => 
        prev + '\n---\nSummary:\n' + summary.$text + '\n---\n'
      );

      // Show full analysis
      setOutput(prev => 
        prev + '\nFull Analysis:\n' + 
        JSON.stringify(analysis, null, 2)
      );

    } catch (error) {
      setOutput(prev => prev + `\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Complex TypeScript Demo</h1>
      <p className="text-gray-600 mb-4">
        Demonstrates type-safe streaming, schema transformation, and result merging
      </p>

      <button
        onClick={runAnalysis}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
      >
        {loading ? 'Analyzing...' : 'Run Analysis'}
      </button>

      <pre className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">
        {output || 'Click Run Analysis to start...'}
      </pre>
    </div>
  )
} 