'use client'

import { useState } from 'react'
import { ClientProvider, xmllm } from '../../../src/xmllm-client.mjs'
console.log('Imported:', { ClientProvider, xmllm })

const clientProvider = new ClientProvider('http://localhost:3124/api/stream')

export default function Home() {
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string>('basic')

  const tests = {
    basic: {
      name: 'Basic Query',
      messages: [
        { role: 'user', content: 'What is 2+2?' }
      ],
      schema: {
        answer: {
          value: Number,
          explanation: String
        }
      }
    },
    system: {
      name: 'System Message Test',
      messages: [
        { role: 'user', content: 'What is the Pythagorean theorem?' }
      ],
      system: 'You are a helpful math tutor. Always provide examples.',
      schema: {
        theorem: {
          name: String,
          formula: String,
          example: String
        }
      }
    },
    streaming: {
      name: 'Streaming Test',
      messages: [
        { role: 'user', content: 'Count from 1 to 5 slowly.' }
      ],
      schema: {
        count: {
          number: Number,
          word: String
        }
      }
    },
    rpmLimited: {
      name: 'RPM Limited Test',
      messages: [
        { role: 'user', content: 'What is 2+2?' }
      ],
      schema: {
        answer: {
          value: Number,
          explanation: String
        }
      },
      constraints: {
        rpmLimit: 10 // Limit to 10 requests per minute
      }
    }
  }

  async function runTest(testType: keyof typeof tests) {
    setLoading(true)
    setOutput('Running test...\n')

    try {
      console.log('Starting test:', testType)
      const test = tests[testType]
      console.log('Test config:', test)
      
      console.log('Creating pipeline...');

      let stream;
      try {
        stream = await xmllm(({ promptClosed, prompt, req }) => {
          console.log('Inside pipeline function', {
            messages: test.messages,
            system: test.system,
            model: ['claude:fast', 'openai:fast'],
            schema: test.schema
          })
          return [
            req({
              messages: test.messages,
              system: test.system,
              model: ['claude:fast', 'openai:fast'],
              max_tokens: 200,
              schema: test.schema
            }),
            async function* (chunk) {
              console.log('Generator received chunk:', chunk);
              yield chunk;
              setOutput(prev => prev + JSON.stringify(chunk, null, 2) + '\n')
            }
          ]
        }, clientProvider);
      } catch (error) {
        console.error('Error creating pipeline:', error)
      }

      console.log('Pipeline created, starting stream...')
      for await (const chunk of stream) {
        console.log('Stream chunk:', chunk)
      }
    } catch (error) {
      console.error('Test error:', error)
      setOutput(prev => prev + `\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">XMLLM Client Tests</h1>

      <div className="space-y-8">
        {/* Test Selection */}
        <div className="flex gap-4">
          {Object.entries(tests).map(([key, test]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedTest(key)
                setOutput('')
              }}
              className={`px-4 py-2 rounded ${
                selectedTest === key 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {test.name}
            </button>
          ))}
        </div>

        {/* Run Button */}
        <button
          onClick={() => runTest(selectedTest as keyof typeof tests)}
          disabled={loading}
          className={`px-6 py-3 rounded bg-green-500 text-white 
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
        >
          {loading ? 'Running...' : 'Run Test'}
        </button>

        {/* Output Display */}
        <div className="bg-gray-100 p-4 rounded min-h-[200px] font-mono whitespace-pre-wrap">
          {output || 'Output will appear here...'}
        </div>
      </div>
    </main>
  )
}
