'use client'

import { useState, useEffect } from 'react'
import { ClientProvider, stream } from '../../../../src/xmllm-client.mjs'
import { useTheme } from '../theme-provider'

const clientProvider = new ClientProvider('http://localhost:3124/api/stream')

// Available models configuration
const MODEL_OPTIONS = [
  { id: 'all', name: 'All Models' },
  { id: 'claude:superfast', name: 'Claude Haiku (Super Fast)' },
  { id: 'claude:fast', name: 'Claude Haiku (Fast)' },
  { id: 'claude:good', name: 'Claude Sonnet (Good)' },
  { id: 'openai:superfast', name: 'GPT-4 Mini (Super Fast)' },
  { id: 'openai:fast', name: 'GPT-4 Mini (Fast)' },
  { id: 'openai:good', name: 'GPT-4 (Good)' },
  { id: 'togetherai:fast', name: 'Together AI (Fast)' },
  { id: 'togetherai:good', name: 'Together AI (Good)' },
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SchemaConfig {
  enabled: boolean
  schema: string  // JavaScript object as string
}

interface PanelConfig {
  systemPrompt: string
  messages: Message[]
  model: string
  temperature: number
  maxTokens: number
  topP: number
  stop: string
  presencePenalty: number
  schema: SchemaConfig
}

const DEFAULT_CONFIG: PanelConfig = {
  systemPrompt: '',
  messages: [{ role: 'user', content: '' }],
  model: 'claude:fast',
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1.0,
  stop: '',
  presencePenalty: 0,
  schema: {
    enabled: false,
    schema: ''
  }
}

// Add the ALL_MODELS constant
const ALL_MODELS = [
  'claude:good', 
  'openai:good', 
  'togetherai:good', 
  'claude:fast', 
  'openai:fast', 
  'togetherai:fast'
]

// Fix type error for SCHEMA_TEMPLATES indexing
interface SchemaTemplates {
  [key: string]: { schema: string }
}

const SCHEMA_TEMPLATES: SchemaTemplates = {
  analysis: {
    schema: `{
  analysis: {
    sentiment: String,
    topics: {
      topic: Array(String)
    },
    key_points: {
      key_point: Array({
        point: String,
        relevance: Number
      })
    },
    summary: String
  }
}`
  },
  profile: {
    schema: `{
  user: {
    name: String,
    age: Number,
    interests: {
      interest: Array(String)
    },
    contact: {
      email: String,
      location: String
    }
  }
}`
  }
}

export default function Panel() {
  const { theme } = useTheme()
  const [output, setOutput] = useState('')
  const [rawOutput, setRawOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<PanelConfig>(DEFAULT_CONFIG)

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('panelConfig')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        // Ensure schema exists with all required fields
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          schema: {
            ...DEFAULT_CONFIG.schema,
            ...(parsed.schema || {})
          }
        })
      } catch (e) {
        console.error('Failed to parse saved config:', e)
        setConfig(DEFAULT_CONFIG)
      }
    }
  }, [])

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('panelConfig', JSON.stringify(config))
  }, [config])

  function updateMessage(index: number, content: string) {
    setConfig(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => 
        i === index ? { ...msg, content } : msg
      )
    }))
  }

  function addMessage(role: 'user' | 'assistant') {
    setConfig(prev => ({
      ...prev,
      messages: [...prev.messages, { role, content: '' }]
    }))
  }

  function removeMessage(index: number) {
    setConfig(prev => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index)
    }))
  }

  async function runPrompt() {
    // Validate that last message is from user
    if (config.messages[config.messages.length - 1].role !== 'user') {
      setOutput('Error: Final message must be from user')
      return
    }

    // Validate that all messages have content
    if (config.messages.some(msg => !msg.content.trim())) {{config.schema.enabled && (
  <div className="space-y-4">
    {/* Schema Definition */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Schema Definition
        <span className="text-muted-foreground ml-2">(JavaScript)</span>
      </label>
      <textarea
        value={config.schema.schema}
        onChange={(e) => setConfig(prev => ({
          ...prev,
          schema: {
            ...prev.schema,
            schema: e.target.value
          }
        }))}
        className="w-full h-[200px] p-3 rounded-lg border bg-background font-mono text-sm resize-none"
        placeholder={`{
  analysis: {
    sentiment: String,
    topics: {
      topic: Array(String)
    },
    key_points: {
      key_point: Array({
        point: String,
        relevance: Number
      })
    },
    summary: String
  }
}`}
      />
    </div>

    {/* Schema Templates */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Quick Templates
      </label>
      <select
        onChange={(e) => {
          if (e.target.value) {
            const template = SCHEMA_TEMPLATES[e.target.value];
            setConfig(prev => ({
              ...prev,
              schema: {
                ...prev.schema,
                ...template
              }
            }));
          }
        }}
        className="w-full px-3 py-1.5 rounded border bg-background"
        defaultValue=""
      >
        <option value="">Select a template...</option>
        <option value="analysis">Text Analysis</option>
        <option value="profile">User Profile</option>
      </select>
    </div>
  </div>
)}
      setOutput('Error: All messages must have content')
      return
    }

    setLoading(true)
    setOutput('Running...\n')

    try {
      let schemaConfig = undefined;
      
      if (config.schema.enabled && config.schema.schema) {
        try {
          schemaConfig = {
            schema: eval(`(${config.schema.schema})`)
          };
        } catch (e: unknown) {
          if (e instanceof Error) {
            setOutput('Error: Invalid schema\n' + e.message);
          } else {
            setOutput('Error: Invalid schema\n' + String(e));
          }
          return;
        }
      }

      function onChunk(chunk: string) {
        setRawOutput(prev => prev + chunk);
      }

      // Handle 'all' model selection
      const models = config.model === 'all' ? ALL_MODELS : [config.model];
      
      for (const model of models) {
        if (models.length > 1) {
          setOutput(prev => prev + `\n\n=== Using ${model} ===\n`);
        }

        const theStream = stream(
          {
            messages: config.messages,
            system: config.systemPrompt,
            model: model,
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            top_p: config.topP,
            onChunk,
            presence_penalty: config.presencePenalty,
            stop: config.stop ? config.stop.split(',').map(s => s.trim()) : undefined,
            ...(schemaConfig && { schema: schemaConfig.schema })
          }, 
          { clientProvider }
        )

        if (config.schema.enabled) {
          // For schema-based responses, wait for complete result and format
          for await (const chunk of theStream) {
            setOutput(JSON.stringify(chunk, null, 2))
          }
        } else {
          // For raw responses, stream as before
          let isFirstChunk = true
          for await (const chunk of theStream.raw()) {
            if (isFirstChunk) {
              setOutput(chunk)
              isFirstChunk = false
            } else {
              setOutput(prev => prev + chunk)
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error('Stream error:', error);
      if (error instanceof Error) {
        setOutput(prev => prev + `\nError: ${error.message}`);
      } else {
        setOutput(prev => prev + `\nError: ${String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background text-foreground">
      <div className="max-w-[1800px] mx-auto">
        {/* Header with subtle gradient */}
        <header className="border-b border-border/40 pb-4 mb-8 bg-gradient-to-r from-background to-card/20">
          <h1 className="text-3xl font-light tracking-wide">xmllm playground</h1>
          <p className="text-muted-foreground/80 mt-2 text-sm">
            Configure and test different LLM settings
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[1.2fr,0.8fr] lg:gap-6">
          {/* Left column - Configuration */}
          <div className="space-y-4">
            {/* System Prompt - Blue tint */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-border/60 rounded-lg p-3">
              <div className="mb-2">
                <h2 className="text-base font-medium">System Prompt</h2>
                <p className="text-muted-foreground/70 text-xs">
                  Define the AI's role and behavior
                </p>
              </div>
              <textarea
                value={config.systemPrompt}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  systemPrompt: e.target.value 
                }))}
                className="w-full h-[80px] p-2.5 rounded-md border-border/50 bg-background/50 
                  font-mono text-sm resize-none focus:ring-1 focus:ring-primary/30"
                placeholder="You are a helpful AI assistant..."
              />
            </div>

            {/* Schema Configuration - Purple tint */}
            <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-border/60 rounded-lg p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium">Schema Configuration</h2>
                  <p className="text-muted-foreground/70 text-xs">
                    Define structured output format
                  </p>
                </div>
                <button
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    schema: {
                      ...prev.schema,
                      enabled: !prev.schema.enabled
                    }
                  }))}
                  className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors
                    ${config.schema.enabled
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-muted/50 text-muted-foreground/70 border border-border/40'
                    }`}
                >
                  {config.schema.enabled && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  Schema {config.schema.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {config.schema.enabled && (
                <div className="space-y-4">
                  {/* Schema Templates */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quick Templates
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const template = SCHEMA_TEMPLATES[e.target.value];
                          setConfig(prev => ({
                            ...prev,
                            schema: {
                              ...prev.schema,
                              ...template
                            }
                          }));
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded border bg-background"
                      defaultValue=""
                    >
                      <option value="">Select a template...</option>
                      <option value="analysis">Text Analysis</option>
                      <option value="profile">User Profile</option>
                    </select>
                  </div>

                  {/* Schema Definition */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Schema Definition
                      <span className="text-muted-foreground ml-2">(JavaScript)</span>
                    </label>
                    <textarea
                      value={config.schema.schema}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        schema: {
                          ...prev.schema,
                          schema: e.target.value
                        }
                      }))}
                      className="w-full h-[200px] p-3 rounded-lg border bg-background font-mono text-sm resize-none"
                      placeholder={`{
  analysis: {
    sentiment: String,
    topics: {
      topic: Array(String)
    },
    score: Number
  }
}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Message History - Green tint */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-border/60 rounded-lg p-3">
              <div className="mb-2">
                <h2 className="text-base font-medium">Message History</h2>
                <p className="text-muted-foreground/70 text-xs">
                  Build a conversation history
                </p>
              </div>

              <div className="space-y-3">
                {config.messages.map((message, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 text-xs rounded-md border ${
                        message.role === 'user' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900'
                      }`}>
                        {message.role}
                      </span>
                      {index > 0 && (
                        <button
                          onClick={() => removeMessage(index)}
                          className="text-xs text-red-500/70 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      value={message.content}
                      onChange={(e) => updateMessage(index, e.target.value)}
                      className="w-full h-[80px] p-2.5 rounded-md border-border/50 bg-background/50 
                        font-mono text-sm resize-none focus:ring-1 focus:ring-primary/30"
                      placeholder={`${message.role === 'user' ? 'User message...' : 'Assistant response...'}`}
                    />
                  </div>
                ))}
              </div>

              {/* Add Message - Subtle button */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => addMessage(
                    config.messages[config.messages.length - 1]?.role === 'user' 
                      ? 'assistant' 
                      : 'user'
                  )}
                  disabled={!config.messages[config.messages.length - 1]?.content}
                  className="px-3 py-1.5 text-xs rounded-md bg-background border border-border/60 
                    text-foreground/80 hover:bg-card/50 disabled:opacity-50 transition-colors"
                >
                  Add Message
                </button>
              </div>
            </div>
          </div>

          {/* Right column - Model Config & Output */}
          <div className="mt-6 lg:mt-0 space-y-4">
            {/* Model Configuration - Amber tint */}
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-border/60 rounded-lg p-3">
              <h2 className="text-base font-medium mb-3">Model Configuration</h2>
              
              <div className="space-y-3">
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

            {/* Output Panel - Slate tint */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-border/60 rounded-lg">
              <div className="p-2.5 border-b border-border/40 bg-card/30 flex items-center justify-between">
                <h2 className="text-base font-medium">Output</h2>
                {output && (
                  <button
                    onClick={() => setOutput('')}
                    className="text-xs text-muted-foreground/70 hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="bg-muted/30 p-3 font-mono text-sm whitespace-pre-wrap rounded-b-lg max-h-[300px] overflow-y-auto">
                {output || 'Output will appear here...'}
              </div>
            </div>

            {/* Raw Output Panel [for debugging] - Slate tint */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-border/60 rounded-lg">
              <div className="p-2.5 border-b border-border/40 bg-card/30 flex items-center justify-between">
                <h2 className="text-base font-medium">Raw Output</h2>
                {rawOutput && (
                  <button
                    onClick={() => setRawOutput('')}
                    className="text-xs text-muted-foreground/70 hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="bg-muted/30 p-3 font-mono text-sm whitespace-pre-wrap rounded-b-lg max-h-[300px] overflow-y-auto">
                {rawOutput || 'Raw output will appear here...'}
              </div>
            </div>
          </div>
        </div>

        {/* Run Button area - Frosted glass effect */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border/40 p-4">
          <div className="max-w-[1800px] mx-auto flex justify-end">
            <button
              onClick={runPrompt}
              disabled={loading || !config.messages.some(m => m.content.trim())}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all
                ${loading || !config.messages.some(m => m.content.trim())
                  ? 'bg-primary/30 text-primary-foreground/50 cursor-not-allowed' 
                  : 'bg-primary/90 text-primary-foreground hover:bg-primary shadow-lg hover:shadow-xl'
                }`}
            >
              {loading ? 'Running...' : 'Run Prompt'}
            </button>
          </div>
        </div>

        {/* Add padding at bottom to account for fixed button */}
        <div className="h-20" />
      </div>
    </main>
  )
} 