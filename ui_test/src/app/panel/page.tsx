'use client'

import { useState } from 'react'
import { ClientProvider, stream } from '../../../../src/xmllm-client.mjs'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTheme } from '../theme-provider'

const clientProvider = new ClientProvider('http://localhost:3124/api/stream')

// Available models configuration
const MODEL_OPTIONS = [
  { id: 'claude:superfast', name: 'Claude Haiku (Super Fast)' },
  { id: 'claude:fast', name: 'Claude Haiku (Fast)' },
  { id: 'claude:good', name: 'Claude Sonnet (Good)' },
  { id: 'openai:superfast', name: 'GPT-4 Mini (Super Fast)' },
  { id: 'openai:fast', name: 'GPT-4 Mini (Fast)' },
  { id: 'openai:good', name: 'GPT-4 (Good)' },
]

export default function Panel() {
  const { theme } = useTheme()
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  // Model configuration state
  const [config, setConfig] = useState({
    model: 'claude:fast',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1.0,
    stop: '',
    presencePenalty: 0
  })

  async function runPrompt() {
    setLoading(true)
    setOutput('Running...\n')

    try {
      const theStream = stream(
        {
          prompt: userPrompt,
          system: systemPrompt,
          model: config.model,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          top_p: config.topP,
          presence_penalty: config.presencePenalty,
          stop: config.stop ? config.stop.split(',').map(s => s.trim()) : undefined,
        }, 
        { clientProvider }
      )

      // Clear the "Running..." message when we get the first chunk
      let isFirstChunk = true
      
      // Stream the raw output
      for await (const chunk of theStream.raw()) {
        if (isFirstChunk) {
          setOutput(chunk)
          isFirstChunk = false
        } else {
          setOutput(prev => prev + chunk)
        }
      }
    } catch (error) {
      console.error('Stream error:', error)
      setOutput(prev => prev + `\nError: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background text-foreground">
      <div className="max-w-[1800px] mx-auto">
        <header className="border-b border-border pb-4 mb-8">
          <h1 className="text-3xl font-bold">LLM Configuration Panel</h1>
          <p className="text-muted-foreground mt-2">
            Configure and test different LLM settings
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[1fr,500px] lg:gap-8">
          {/* Left column - Configuration */}
          <div className="space-y-6">
            {/* System Prompt */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="mb-4">
                <h2 className="font-bold text-lg">System Prompt</h2>
                <p className="text-muted-foreground text-sm">
                  Define the AI's role and behavior
                </p>
              </div>
              <div className="h-[200px] border border-border rounded-lg">
                <CodeMirror
                  value={systemPrompt}
                  height="200px"
                  theme={theme === 'dark' ? oneDark : undefined}
                  extensions={[javascript()]}
                  onChange={setSystemPrompt}
                />
              </div>
            </div>

            {/* User Prompt */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="mb-4">
                <h2 className="font-bold text-lg">User Prompt</h2>
                <p className="text-muted-foreground text-sm">
                  Enter your prompt here
                </p>
              </div>
              <div className="h-[200px] border border-border rounded-lg">
                <CodeMirror
                  value={userPrompt}
                  height="200px"
                  theme={theme === 'dark' ? oneDark : undefined}
                  extensions={[javascript()]}
                  onChange={setUserPrompt}
                />
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={runPrompt}
              disabled={loading || !userPrompt.trim()}
              className={`px-4 py-2 rounded-lg font-medium text-sm
                ${loading || !userPrompt.trim()
                  ? 'bg-primary/50 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary/90'} 
                text-primary-foreground transition-colors`}
            >
              {loading ? 'Running...' : 'Run Prompt'}
            </button>
          </div>

          {/* Right column - Model Config & Output */}
          <div className="mt-6 lg:mt-0">
            {/* Model Configuration */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <h2 className="font-bold text-lg mb-4">Model Configuration</h2>
              
              <div className="space-y-4">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1">Model</label>
                  <select
                    value={config.model}
                    onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded border bg-background"
                  >
                    {MODEL_OPTIONS.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Temperature: {config.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      temperature: parseFloat(e.target.value) 
                    }))}
                    className="w-full"
                  />
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="block text-sm font-medium mb-1">Max Tokens</label>
                  <input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      maxTokens: parseInt(e.target.value) 
                    }))}
                    className="w-full px-3 py-1.5 rounded border bg-background"
                  />
                </div>

                {/* Top P */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Top P: {config.topP}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.topP}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      topP: parseFloat(e.target.value) 
                    }))}
                    className="w-full"
                  />
                </div>

                {/* Presence Penalty */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Presence Penalty: {config.presencePenalty}
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.presencePenalty}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      presencePenalty: parseFloat(e.target.value) 
                    }))}
                    className="w-full"
                  />
                </div>

                {/* Stop Sequences */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stop Sequences (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={config.stop}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      stop: e.target.value 
                    }))}
                    placeholder="sequence1, sequence2, ..."
                    className="w-full px-3 py-1.5 rounded border bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="border border-border rounded-lg">
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
              <div className="bg-muted p-4 font-mono text-sm whitespace-pre-wrap rounded-b-lg max-h-[400px] overflow-y-auto">
                {output || 'Output will appear here...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 