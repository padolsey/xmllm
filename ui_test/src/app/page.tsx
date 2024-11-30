'use client'

import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { ClientProvider, xmllm, stream } from '../../../src/xmllm-client.mjs'
import { useTheme } from './theme-provider'

const clientProvider = new ClientProvider('http://localhost:3124/api/stream')
const DEFAULT_MODEL = 'togetherai:fast'

// Just store the example code strings
const tests = {
  pipeline: {
    name: 'Pipeline: State Tracking',
    description: 'Track and analyze colors as they arrive using pipelines',
    code: `const colorTracker = xmllm(({ prompt }) => [
  // Get initial response
  prompt({
    messages: [{
      role: 'user',
      content: 'List three colors'
    }],
    schema: {
      colors: { color: [String] }
    },
    model: DEFAULT_MODEL
  }),

  function*(incoming) {
    const seen = new Set();
    
    // Process incoming colors if they exist
    if (incoming?.colors?.color) {
      const newColors = incoming.colors.color
        .filter(c => !seen.has(c));
      
      newColors.forEach(c => seen.add(c));
      
      yield {
        colors: newColors,
        total: seen.size
      };
    }
  }
], clientProvider);

for await (const update of colorTracker) {
  setOutput(prev => prev + JSON.stringify(update, null, 2) + '\\n');
}`
  },

  pipelineChained: {
    name: 'Pipeline: Chained Analysis',
    description: 'Chain multiple prompts to build on previous responses',
    code: `const analysis = xmllm(({ prompt, promptClosed }) => [
  // First prompt gets a scientist
  promptClosed('Name a scientist', {
    scientist: {
      name: String,
      field: String
    }
  }, {
    model: DEFAULT_MODEL
  }),

  promptClosed((incoming) => {
    this.scientist = incoming.scientist;
    return {
      messages: [{
        role: 'user',
        content: \`What was \${incoming.scientist.name}'s biggest discovery?\`,
      }],
      schema: {
        discovery: {
          year: Number,
          description: String
        }
      },
      model: DEFAULT_MODEL
    };
  }),

  // Combine results
  ({discovery}) => {
    return {
      scientist: this.scientist,
      discovery
    };
  }
], clientProvider);

for await (const update of analysis) {
  setOutput(prev => prev + JSON.stringify(update, null, 2) + '\\n');
}`
  },

  deltaMode: {
    name: 'Delta Mode Streaming',
    description: 'Only see complete elements as they arrive',
    code: `const thoughtStream = stream('Share some deep thoughts', {
  clientProvider,
  model: DEFAULT_MODEL,
  mode: 'delta',
  schema: {
    thought: [String]
  }
});

for await (const update of thoughtStream) {
  setOutput(prev => prev + JSON.stringify(update, null, 2) + '\\n');
}`
  },

  realtimeMode: {
    name: 'Realtime Story Updates',
    description: 'Watch content grow within elements',
    code: `const storyStream = stream('Write a story with <scene>...</scene> tags', {
  clientProvider,
  model: DEFAULT_MODEL,
  mode: 'realtime',
  schema: {
    scene: [String]
  }
});

for await (const update of storyStream) {
  setOutput(JSON.stringify(update, null, 2));
}`
  },

  structuredAnalysis: {
    name: 'Complex Schema Analysis',
    description: 'Extract rich structured data with validation',
    code: `const analysis = await stream({
  prompt: 'Analyze this tweet: "Just saw the sweetest puppy!"',
  model: DEFAULT_MODEL,
  schema: {
    sentiment: String,
    topics: [String],
    insights: [{
      point: String,
      reasoning: String,
      confidence: Number
    }]
  }
}, {
  clientProvider
}).last();

setOutput(JSON.stringify(analysis, null, 2));`
  },

  nestedSelectors: {
    name: 'Advanced XML Navigation',
    description: 'Complex selectors and attribute filtering',
    code: `const baseStream = stream(\`List books by genre:
  <shelf category="fiction">
    <book><title>___</title>
    <author>___</author></book>
  </shelf>\`, {
  clientProvider,
  model: DEFAULT_MODEL
});

// Get fiction books specifically
const fictionBooks = await baseStream
  .select('shelf[category="fiction"] > book')
  .closedOnly()
  .map(({title, author}) => ({
    title: title[0].$text,
    author: author[0].$text
  }))
  .all()

setOutput(JSON.stringify(fictionBooks, null, 2));`
  },

  colorSchema: {
    name: 'Rich Data Transformation',
    description: 'Complex nested schema with validation',
    code: `const colorStream = stream(
  'List 3 colors with RGB values:\\n' +
  '<color>\\n' +
  '  <name>purple</name>\\n' +
  '  <rgb r="128" g="0" b="128"/>\\n' +
  '</color>',
  {
    clientProvider,
    model: DEFAULT_MODEL,
    schema: {
      color: [{
        name: String,
        rgb: {
          $attr: {
            r: Number,
            g: Number,
            b: Number
          }
        }
      }]
    }
  }
);

for await (const color of colorStream) {
  setOutput(prev => prev + JSON.stringify(color, null, 2) + '\\n');
}`
  }
};

export default function Home() {
  const { theme } = useTheme()
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string>('pipeline')
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
        'DEFAULT_MODEL',
        `return (async () => {
          try {
            ${code}
          } catch (error) {
            console.error('Code execution error:', error);
            setOutput(prev => prev + '\\nError: ' + error.message);
          }
        })()
      `)

      await fn(xmllm, clientProvider, setOutput, stream, DEFAULT_MODEL)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {Object.entries(tests).map(([key, test]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedTest(key)
                    setOutput('')
                  }}
                  className={`p-3 rounded-lg border transition-colors text-left ${
                    selectedTest === key 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-bold text-sm">{test.name}</div>
                  <div className={`text-xs mt-1 ${
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
