'use client'

import { useState, useEffect } from 'react'
import { xmllm, stream, ClientProvider } from '../../../src/xmllm-client.mjs'
import type { PipelineHelpers } from '../../../index'

// The complete XML string for simulation
const completeXml = `<user_profile>
  <name>Alexandra Chen</name>
  <bio>A passionate software engineer with a love for creative problem solving and open source contributions.</bio>
  <details>
    <location>San Francisco, CA</location>
    <favorite_color hex="#4B0082">Indigo</favorite_color>
  </details>
  <hobbies>
    <hobby category="tech">Programming side projects</hobby>
    <hobby category="outdoor">Rock climbing</hobby>
    <hobby category="creative">Digital art and design</hobby>
  </hobbies>
  <skills>
    <skill level="expert">TypeScript</skill>
    <skill level="advanced">React</skill>
    <skill level="intermediate">Rust Programming</skill>
  </skills>
</user_profile>`

// Helper functions
function* generateChunks(text: string, chunkSize: number) {
  let index = 0
  while (index < text.length) {
    yield text.slice(index, index + chunkSize)
    index += chunkSize
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Live Profile Component
function LiveProfile({ data }: { data: any }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg transition-all duration-300">
      {/* Header with name and color accent */}
      <div 
        className="mb-6 pb-4 transition-all duration-300"
        style={{
          borderBottom: data?.details?.favoriteColor?.hex 
            ? `2px solid ${data.details.favoriteColor.hex}` 
            : '2px solid transparent'
        }}
      >
        <h2 className="text-2xl font-bold">
          {data.name || 'Loading...'}
        </h2>
        {data.details?.location && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            📍 {data.details.location}
          </div>
        )}
      </div>

      {/* Bio section */}
      {data.bio && (
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 italic">
            "{data.bio}"
          </p>
        </div>
      )}

      {/* Color preference */}
      {data.details?.favoriteColor && (
        <div className="mb-6 flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full border border-gray-200"
            style={{ backgroundColor: data.details.favoriteColor.hex }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Favorite color: {data.details.favoriteColor.name}
          </span>
        </div>
      )}

      {/* Skills section */}
      {data.skills?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill: any, i: number) => (
              <div 
                key={i}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: data.details?.favoriteColor?.hex 
                    ? `${data.details.favoriteColor.hex}15`
                    : 'bg-gray-100 dark:bg-gray-700'
                }}
              >
                {skill.name}
                {skill.level && (
                  <span className="ml-1 opacity-60">• {skill.level}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hobbies section */}
      {data.hobbies?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Hobbies</h3>
          <div className="space-y-2">
            {data.hobbies.map((hobby: any, i: number) => (
              <div 
                key={i}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-gray-500 dark:text-gray-400">
                  {hobby.category}:
                </span>
                <span>{hobby.activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function UserProfileDemo({ clientProvider }: { clientProvider: ClientProvider }) {
  const [xmlContent, setXmlContent] = useState('')
  const [parsedContent, setParsedContent] = useState<any>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [chunkSize, setChunkSize] = useState(3)
  const [useRealLLM, setUseRealLLM] = useState(true)

  useEffect(() => {
    if (!isPlaying) return

    let mounted = true
    
    // Original simulated approach using select() and map()
    const runSimulatedStream = async () => {
      const stream = xmllm(({ parse, select, map }: PipelineHelpers) => [
        async function*() {
          for (const chunk of generateChunks(completeXml, chunkSize)) {
            if (!mounted) return
            yield chunk
            await delay(speed)
            setXmlContent(prev => prev + chunk)
          }
        },
        
        parse(),
        select('user_profile'),
        map((profile: any) => {
          return {
            name: profile?.name?.[0]?.$text,
            bio: profile?.bio?.[0]?.$text,
            details: {
              location: profile?.details?.[0]?.location?.[0]?.$text,
              favoriteColor: {
                name: profile?.details?.[0]?.favorite_color?.[0]?.$text,
                hex: profile?.details?.[0]?.favorite_color?.[0]?.$attr?.hex
              }
            },
            hobbies: profile?.hobbies?.[0]?.hobby?.map((h: any) => ({
              activity: h.$text,
              category: h.$attr.category
            })) || [],
            skills: profile?.skills?.[0]?.skill?.map((s: any) => ({
              name: s.$text,
              level: s.$attr.level
            })) || []
          }
        })
      ])

      for await (const result of stream) {
        if (!mounted) return
        setParsedContent(result)
      }

      if (mounted) setIsPlaying(false)
    }

    // Real LLM approach using stream() with schema
    const runRealStream = async () => {
      const schema = {
        user_profile: {
          name: String,
          bio: String,
          details: {
            location: String,
            favorite_color: {
              $hex: String,
              $text: String
            }
          },
          hobbies: {
            hobby: [{
              $category: String,
              $text: String
            }]
          },
          skills: {
            skill: [{
              $level: String,
              $text: String
            }]
          }
        }
      }

      const theStream = stream({
        prompt: "Generate a fun and interesting user profile for a tech professional based somewhere in the world. Seed: not cyberpunk, not USA, not stereotypical.",
        schema,
        temperature: 0.7,
        max_tokens: 1000,
        onChunk: (rawChunk: string) => {
          setXmlContent(prev => prev + rawChunk)
        },
        system: "You are a profile generator. Create engaging user profiles with colorful details. Do not over-focus on locale in determinising interests. Do not over-focus on job in determining hobbies."
      }, {
        clientProvider
      }).map((chunk: any) => chunk.user_profile).map((profile: any) => {
        profile.details = {
          ...(profile.details || {}),
          favoriteColor: {
            name: profile?.details?.favorite_color?.$text,
            hex: profile?.details?.favorite_color?.$hex
          }
        };
        profile.hobbies = profile.hobbies?.hobby?.map((h: any) => ({
          activity: h.$text,
          category: h.$category
        })) || [];
        profile.skills = profile.skills?.skill?.map((s: any) => ({
          name: s.$text,
          level: s.$level
        })) || [];
        return profile;
      })

      try {
        for await (const chunk of theStream) {
          if (!mounted) return
          setParsedContent(chunk)
        }
        if (mounted) setIsPlaying(false)
      } catch (error) {
        console.error('Stream error:', error)
        if (mounted) setIsPlaying(false)
      }
    }

    // Choose which approach to use
    const runSelectedStream = useRealLLM ? runRealStream : runSimulatedStream
    runSelectedStream().catch(console.error)

    return () => {
      mounted = false
    }
  }, [isPlaying, speed, chunkSize, useRealLLM, clientProvider])

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">XML Streaming Demo: User Profile</h1>
      
      <div className="flex gap-8 mb-8 items-center flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-sm">
            Mode:
          </label>
          <select 
            value={useRealLLM ? 'real' : 'simulated'}
            onChange={(e) => setUseRealLLM(e.target.value === 'real')}
            disabled={isPlaying}
            className="px-3 py-1.5 rounded border bg-background"
          >
            <option value="simulated">Simulated Stream</option>
            <option value="real">Real LLM</option>
          </select>
          
          {/* Only show chunk controls for simulated mode */}
          {!useRealLLM && (
            <>
              <label className="text-sm ml-6">
                Chunk Size:
              </label>
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

              <label className="text-sm ml-6">
                Delay:
              </label>
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

      <div className="grid grid-cols-3 gap-8">
        {/* XML View */}
        <div className="border border-border rounded-lg">
          <div className="p-3 border-b border-border bg-card">
            <h2 className="font-bold">Incoming XML</h2>
            <p className="text-sm text-muted-foreground">
              {
                useRealLLM
                  ? 'Raw LLM completion arriving'
                  : `Simulated XML arriving ${chunkSize} characters at a time`
              }
            </p>
          </div>
          <pre className="p-4 font-mono text-sm whitespace-pre bg-muted overflow-auto max-h-[600px]">
            {xmlContent || 'XML will appear here...'}
          </pre>
        </div>

        {/* Parsed Data View */}
        <div className="border border-border rounded-lg">
          <div className="p-3 border-b border-border bg-card">
            <h2 className="font-bold">Parsed Structure</h2>
            <p className="text-sm text-muted-foreground">
              Structured JSON updated in real-time as XML is parsed
            </p>
          </div>
          <pre className="p-4 font-mono text-sm whitespace-pre bg-muted overflow-auto max-h-[600px]">
            {JSON.stringify(parsedContent, null, 2) || 'Parsed data will appear here...'}
          </pre>
        </div>

        {/* Live Preview */}
        <div className="border border-border rounded-lg">
          <div className="p-3 border-b border-border bg-card">
            <h2 className="font-bold">Live Preview</h2>
            <p className="text-sm text-muted-foreground">
              React component updating as data arrives
            </p>
          </div>
          <div className="p-4 bg-muted overflow-auto max-h-[600px]">
            <LiveProfile data={parsedContent} />
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-bold mb-2">About this demo</h3>
        <p className="text-sm text-muted-foreground">
          This demo shows how xmllm handles XML streaming using two different approaches:
          <br/><br/>
          <strong>Simulated Stream:</strong> Uses select() and map() functions with simulated chunks.
          <br/>
          <strong>Real LLM:</strong> Uses the stream() API with schema to get real-time responses from an AI model.
          <br/><br/>
          {useRealLLM 
            ? "Currently using real LLM responses with schema-based parsing."
            : `Currently simulating chunks of ${chunkSize} characters at a time.`
          }
        </p>
      </div>
    </div>
  )
} 