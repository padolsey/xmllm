'use client'

import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { ClientProvider, xmllm } from '../../../src/xmllm-client.mjs'
import { useTheme } from './theme-provider'

const clientProvider = new ClientProvider('http://localhost:3124/api/stream')

// Just store the example code strings
const tests = {
  basic: {
    name: 'Basic XML Generation',
    description: 'Simple example of generating structured data',
    code: `const stream = await xmllm(({ prompt }) => [
  prompt(
    "What is 2+2?",
    {
      answer: {
        value: Number,
        explanation: String
      }
    }
  )
], clientProvider);

for await (const chunk of stream) {
  console.log(chunk);
  setOutput(prev => prev + JSON.stringify(chunk, null, 2) + '\\n');
}`
  },

  streaming: {
    name: 'Streaming with Pipeline',
    description: 'Shows how to process streaming chunks with transformations',
    code: `const stream = await xmllm(({ prompt, map }) => [
  prompt(
    "Count from 1 to 5 slowly.",
    {
      count: {
        number: Number,
        word: String
      }
    }
  ),
  map(chunk => ({
    ...chunk,
    count: {
      ...chunk.count,
      word: chunk.count?.word?.toUpperCase()
    }
  }))
], clientProvider);

for await (const chunk of stream) {
  console.log(chunk);
  setOutput(prev => prev + JSON.stringify(chunk, null, 2) + '\\n');
}`
  },

  streamingVsClosed: {
    name: 'Streaming vs Closed Elements',
    description: 'Compare streaming updates vs waiting for closed elements',
    code: `// First demonstrate streaming updates
console.log('=== Streaming Updates ===');
let stream = await xmllm(({ prompt }) => [
  prompt(
    "Count from 1 to 3.",
    {
      count: {
        number: Number,
        word: String
      }
    }
  )
], clientProvider);

for await (const chunk of stream) {
  console.log(chunk);
  setOutput(prev => prev + JSON.stringify(chunk, null, 2) + '\\n');
}

// Then demonstrate closed-only updates
setOutput(prev => prev + '\\n=== Closed Elements Only ===\\n');
stream = await xmllm(({ promptClosed }) => [
  promptClosed(
    "Count from 1 to 3.",
    {
      count: {
        number: Number,
        word: String
      }
    }
  )
], clientProvider);

for await (const chunk of stream) {
  console.log(chunk);
  setOutput(prev => prev + JSON.stringify(chunk, null, 2) + '\\n');
}`
  },

  // ... other test cases follow the same pattern
}

export default function Home() {
  const { theme } = useTheme()
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string>('basic')
  const [editedCode, setEditedCode] = useState<string>('')

  async function runTest() {
    setLoading(true)
    setOutput('Running test...\n')

    try {
      // Create a function from the code string and execute it
      const code = editedCode || tests[selectedTest].code
      const fn = new Function('xmllm', 'clientProvider', 'setOutput', `
        return (async () => {
          try {
            ${code}
          } catch (error) {
            console.error('Code execution error:', error);
            setOutput(prev => prev + '\\nError: ' + error.message);
          }
        })()
      `)

      await fn(xmllm, clientProvider, setOutput)
    } catch (error) {
      console.error('Test error:', error)
      setOutput(prev => prev + `\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background text-foreground">
      <div className="max-w-[1800px] mx-auto">
        <header className="border-b border-border pb-4 mb-8">
          <h1 className="text-3xl font-bold">XMLLM Client Tests</h1>
          <p className="text-muted-foreground mt-2">
            Select a test scenario and view the results
          </p>
        </header>

        {/* Two column layout for larger screens */}
        <div className="lg:grid lg:grid-cols-[1fr,500px] lg:gap-8">
          {/* Left column - Test controls */}
          <div className="space-y-6">
            {/* Test Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(tests).map(([key, test]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedTest(key)
                    setOutput('')
                  }}
                  className={`p-4 rounded-lg border transition-colors text-left ${
                    selectedTest === key 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-bold">{test.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {test.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Test Details */}
            {selectedTest && (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-lg">{tests[selectedTest].name}</h2>
                    <p className="text-muted-foreground">{tests[selectedTest].description}</p>
                  </div>
                  <button
                    onClick={runTest}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-medium text-sm
                      ${loading 
                        ? 'bg-primary/50 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90'} 
                      text-primary-foreground transition-colors`}
                  >
                    {loading ? 'Running...' : 'Run Test'}
                  </button>
                </div>

                {/* Single Code Editor Section */}
                <div className="border border-border rounded-lg">
                  <div className="p-3 border-b border-border bg-card flex justify-between items-center">
                    <h3 className="font-bold">Code</h3>
                    <button
                      onClick={() => setEditedCode('')}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="h-[500px] overflow-auto"> 
                    <CodeMirror
                      value={editedCode || tests[selectedTest].code}
                      height="500px"
                      theme={theme === 'dark' ? oneDark : undefined}
                      extensions={[javascript({ jsx: true })]}
                      onChange={(value) => setEditedCode(value)}
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightSpecialChars: true,
                        foldGutter: true,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: true,
                        crosshairCursor: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        closeBracketsKeymap: true,
                        searchKeymap: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Output */}
          <div className="mt-6 lg:mt-0 lg:sticky lg:top-8 lg:h-[calc(100vh-8rem)]">
            <div className="border border-border rounded-lg h-full flex flex-col">
              <div className="p-3 border-b border-border bg-card flex items-center justify-between">
                <h2 className="font-bold">Output</h2>
                {output && (
                  <button
                    onClick={() => setOutput('')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="bg-muted p-4 font-mono text-sm whitespace-pre-wrap rounded-b-lg flex-1 overflow-y-auto">
                {output || 'Output will appear here...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
