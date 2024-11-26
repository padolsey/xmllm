'use client'

import { useState, useEffect } from 'react'
import { ClientProvider, stream } from '../../../../../src/xmllm-client.mjs'
import { speciesDemo } from '../../../config/demos/species'
import { SpeciesProfile } from '../../../components/SpeciesProfile'

const clientProvider = new ClientProvider('http://localhost:3124/api/stream')

export default function SpeciesGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [speciesData, setSpeciesData] = useState<any>(null)

  useEffect(() => {
    if (!isGenerating) return
    let mounted = true

    const generateSpecies = async () => {
      const theStream = stream({
        prompt: speciesDemo.prompt,
        schema: speciesDemo.schema,
        temperature: speciesDemo.temperature,
        max_tokens: speciesDemo.maxTokens,
        system: speciesDemo.system
      }, {
        clientProvider
      }).map(chunk => {
        const data = chunk.species
        return speciesDemo.transform(data)
      })

      try {
        for await (const chunk of theStream) {
          if (!mounted) return
          setSpeciesData(chunk)
        }
      } catch (error) {
        console.error('Generation error:', error)
      } finally {
        if (mounted) setIsGenerating(false)
      }
    }

    generateSpecies()

    return () => {
      mounted = false
    }
  }, [isGenerating])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header and Generate Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Alien Species Generator</h1>
          <button
            onClick={() => {
              setSpeciesData(null)
              setIsGenerating(true)
            }}
            disabled={isGenerating}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate New Species'}
          </button>
        </div>

        {/* Species Profile */}
        <div className="border border-border rounded-lg bg-card">
          <div className="p-4 bg-muted">
            <SpeciesProfile data={speciesData} />
          </div>
        </div>
      </div>
    </div>
  )
} 