'use client'

import { useState, useEffect } from 'react'
import { ClientProvider, xmllm, stream } from '../../../../src/xmllm-client.mjs'
import { demos } from '@/config/demos'
import type { DemoId } from '../../config/demos'

const clientProvider = new ClientProvider('http://localhost:3124/api/stream')

export default function FluidDemo() {
  const [selectedDemo, setSelectedDemo] = useState<DemoId>('user-profile')
  const [xmlContent, setXmlContent] = useState('')
  const [parsedContent, setParsedContent] = useState<any>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [chunkSize, setChunkSize] = useState(3)
  const [useRealLLM, setUseRealLLM] = useState(true)

  const currentDemo = demos.find(d => d.id === selectedDemo)!
  const DemoComponent = currentDemo?.component

  console.log('Current demo config:', {
    demo: currentDemo,
    component: DemoComponent,
    componentName: DemoComponent?.name,
    isFunction: typeof DemoComponent === 'function'
  })

  if (!currentDemo || !DemoComponent) {
    console.error('Demo Configuration Error:', {
      selectedDemo,
      currentDemo,
      DemoComponent
    })
    return <div>Invalid demo configuration</div>
  }

  useEffect(() => {
    if (!isPlaying || !currentDemo) return

    let mounted = true
    const controller = new AbortController()
    
    const runStream = async () => {
      if (useRealLLM) {

        const theStream = stream({
          model: ['togetherai:fast', 'claude:fast', 'openai:fast'],
          prompt: currentDemo.prompt,
          schema: currentDemo.schema,
          temperature: currentDemo.temperature,
          max_tokens: currentDemo.maxTokens,
          onChunk: (rawChunk: string) => {
            setXmlContent(prev => prev + rawChunk)
          },
          system: currentDemo.system
        }, {
          clientProvider
        }).map((chunk: any) => {
          const rootKey = Object.keys(currentDemo.schema)[0]
          const data = chunk[rootKey]
          return currentDemo.transform(data)
        })

        try {
          for await (const chunk of theStream) {
            if (!mounted) return
            setParsedContent(chunk)
          }
        } catch (error) {
          console.error('Stream error:', error)
        }
      } else {
        // Use the demo's simulation function
        await currentDemo.simulateStream({
          chunkSize,
          speed,
          onChunk: (chunk) => setXmlContent(prev => prev + chunk),
          onResult: (result) => setParsedContent(result),
          signal: controller.signal
        })
      }

      if (mounted) setIsPlaying(false)
    }

    runStream().catch(console.error)

    return () => {
      mounted = false
      controller.abort()
    }
  }, [isPlaying, speed, chunkSize, useRealLLM, selectedDemo, currentDemo])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">XML Streaming Demos</h1>
          
          {/* Demo Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm">Demo:</label>
            <select
              value={selectedDemo}
              onChange={(e) => {
                setSelectedDemo(e.target.value as DemoId)
                setXmlContent('')
                setParsedContent({})
              }}
              disabled={isPlaying}
              className="px-3 py-1.5 rounded border bg-background"
            >
              {demos.map(demo => (
                <option key={demo.id} value={demo.id}>
                  {demo.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Demo Description */}
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            See how xmllm allows you to stream XML data to a UI seamlessly.
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-8 mb-8 items-center flex-wrap">
          <div className="flex items-center gap-3">
            <label className="text-sm">Mode:</label>
            <select 
              value={useRealLLM ? 'real' : 'simulated'}
              onChange={(e) => setUseRealLLM(e.target.value === 'real')}
              disabled={isPlaying}
              className="px-3 py-1.5 rounded border bg-background"
            >
              <option value="simulated">Simulated Stream</option>
              <option value="real">Real LLM</option>
            </select>
            
            {/* Simulation Controls */}
            {!useRealLLM && (
              <>
                <label className="text-sm ml-6">Chunk Size:</label>
                <select 
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  disabled={isPlaying}
                  className="px-3 py-1.5 rounded border bg-background"
                >
                  <option value={1}>1 character</option>
                  <option value={3}>3 characters</option>
                  <option value={5}>5 characters</option>
                  <option value={10}>10 characters</option>
                </select>

                <label className="text-sm ml-6">Delay:</label>
                <select 
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  disabled={isPlaying}
                  className="px-3 py-1.5 rounded border bg-background"
                >
                  <option value={10}>Very Fast (10ms)</option>
                  <option value={50}>Fast (50ms)</option>
                  <option value={100}>Normal (100ms)</option>
                  <option value={200}>Slow (200ms)</option>
                </select>
              </>
            )}
          </div>

          <button
            onClick={() => {
              if (!isPlaying) {
                setXmlContent('')
                setParsedContent({})
                setIsPlaying(true)
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            {isPlaying ? 'Streaming...' : 'Start Stream'}
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-8">
          {/* XML View */}
          <div className="border border-border rounded-lg">
            <div className="p-3 border-b border-border bg-card">
              <h2 className="font-bold">Incoming XML</h2>
              <p className="text-sm text-muted-foreground">
                {useRealLLM
                  ? 'Raw LLM completion arriving'
                  : `Simulated XML arriving ${chunkSize} characters at a time`
                }
              </p>
            </div>
            <pre className="p-4 font-mono text-sm whitespace-pre bg-muted overflow-hidden max-h-[800px]">
              {xmlContent || 'XML will appear here...'}
            </pre>
          </div>

          {/* Parsed Data View */}
          <div className="border border-border rounded-lg">
            <div className="p-3 border-b border-border bg-card">
              <h2 className="font-bold">Parsed Structure</h2>
              <p className="text-sm text-muted-foreground">
                Structured JSON updated in real-time
              </p>
            </div>
            <pre className="p-4 font-mono text-sm whitespace-pre bg-muted overflow-hidden max-h-[800px]">
              {JSON.stringify(parsedContent, null, 2) || 'Parsed data will appear here...'}
            </pre>
          </div>

          {/* Live Preview */}
          <div className="border border-border rounded-lg">
            <div className="p-3 border-b border-border bg-card">
              <h2 className="font-bold">Live Preview</h2>
              <p className="text-sm text-muted-foreground">
                Visual representation updated in real-time
              </p>
            </div>
            <div className="p-4 bg-muted overflow-auto max-h-[800px]">
              <DemoComponent data={parsedContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 