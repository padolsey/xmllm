'use client'

import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { ClientProvider, xmllm, stream } from '../../../src/xmllm-client.mjs'
import { useTheme } from './theme-provider'

const clientProvider = new ClientProvider('http://localhost:3124/api/stream')

// Just store the example code strings
const tests = {
  raw: {
    name: 'Raw Text Streaming',
    description: 'Stream raw LLM output as it arrives',
    code: `const rawStream = stream('Tell me a story', {}, clientProvider)
  .raw();

for await (const chunk of rawStream) {
  setOutput(prev => prev + chunk);
}`
  },

  streaming: {
    name: 'Element Streaming',
    description: 'Process elements as they arrive',
    code: `const thoughtStream = stream('Share some deep thoughts I.e. <thought>...</thought> etc.', {}, clientProvider)
  .select('thought')
  .map(({$text}) => $text);

for await (const thought of thoughtStream) {
  setOutput(prev => prev + thought + '\\n');
}`
  },

  partial: {
    name: 'Real-time Updates',
    description: 'See content grow within elements',
    code: `const storyStream = stream('Write a story', {}, clientProvider)
  .select('story');

for await (const update of storyStream) {
  // See the story grow word by word
  setOutput(update.$text);
}`
  },

  schema: {
    name: 'Schema Analysis',
    description: 'Get complete structured analysis',
    code: `const analysis = await stream('Analyze this tweet: "Just landed my first dev job!"', {
  schema: {
    sentiment: String,
    topics: [String],
    insights: [{
      point: String,
      reasoning: String
    }]
  }
}, clientProvider)
.merge()  // Collect and merge all chunks
.value();

setOutput(JSON.stringify(analysis, null, 2));`
  },

  advanced: {
    name: 'Advanced Selection',
    description: 'Multiple selectors and nested elements',
    code: `const baseStream = stream('List books by category', {}, clientProvider);

// Get all books
const allBooks = await baseStream
  .select('book')
  .map(book => ({
    title: book.title[0].$text,
    author: book.author[0].$text
  }))
  .all()
  .value();

// Get fiction books specifically
const fictionBooks = await baseStream
  .select('shelf[category="fiction"] > book')
  .map(book => book.title[0].$text)
  .all()
  .value();

setOutput(JSON.stringify({
  all: allBooks,
  fiction: fictionBooks
}, null, 2));`
  },

  betterPrompting: {
    name: 'Structured Data',
    description: 'Transform complex XML structures',
    code: `const colorStream = stream(
  'List 3 colors with their RGB values using this structure:\\n' +
  '<color>\\n' +
  '  <name>purple</name>\\n' +
  '  <rgb>\\n' +
  '    <r>128</r>\\n' +
  '    <g>0</g>\\n' +
  '    <b>128</b>\\n' +
  '  </rgb>\\n' +
  '</color>',
  {},
  clientProvider
)
.select('color')
.map(color => ({
  name: color.name[0].$text,
  rgb: {
    r: parseInt(color.rgb[0].r[0].$text),
    g: parseInt(color.rgb[0].g[0].$text),
    b: parseInt(color.rgb[0].b[0].$text)
  }
}));

for await (const color of colorStream) {
  setOutput(prev => prev + JSON.stringify(color, null, 2) + '\\n');
}`
  }
};

export default function Home() {
  const { theme } = useTheme()
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string>('streaming')
  const [editedCode, setEditedCode] = useState<string>('')

  async function runTest() {
    setLoading(true)
    setOutput('Running test...\n')

    try {
      const code = editedCode || tests[selectedTest as keyof typeof tests].code
      const fn = new Function(
        'xmllm',
        'clientProvider',
        'setOutput',
        'stream',
        `return (async () => {
          try {
            ${code}
          } catch (error) {
            console.error('Code execution error:', error);
            setOutput(prev => prev + '\\nError: ' + error.message);
          }
        })()
      `)

      await fn(xmllm, clientProvider, setOutput, stream)
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
                  <div className={`text-sm mt-1 ${
                    selectedTest === key 
                      ? 'text-primary-foreground/80' 
                      : 'text-muted-foreground'
                  }`}>
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
                    <h2 className="font-bold text-lg">{tests[selectedTest as keyof typeof tests].name}</h2>
                    <p className="text-muted-foreground">{tests[selectedTest as keyof typeof tests].description}</p>
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
                      value={editedCode || tests[selectedTest as keyof typeof tests].code}
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
