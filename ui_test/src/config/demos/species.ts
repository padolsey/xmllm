import { SpeciesProfile } from '../../components/SpeciesProfile'
import { xmllm } from '../../../../src/xmllm-client.mjs'
import type { DemoConfig } from '../../types/demos'
import type { PipelineHelpers } from '../../../../index'

function* generateChunks(text: string, chunkSize: number) {
  let index = 0
  while (index < text.length) {
    yield text.slice(index, index + chunkSize)
    index += chunkSize
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const speciesDemo: DemoConfig = {
  id: 'species',
  name: 'Alien Species Generator',
  simulatedXml: `<species>
    <name>Zephyrians</name>
    <origin>Kepler-186f</origin>
    <description>A highly advanced species of crystalline beings...</description>
    <characteristics>
      <physiology>Crystalline entities that absorb and reflect light...</physiology>
      <society>Harmonious collective focused on knowledge...</society>
      <technology>Quantum crystalline computing...</technology>
    </characteristics>
    <flag>
      <colors>
        <color hex="#4B0082">Deep Purple</color>
        <color hex="#00FF7F">Emerald</color>
        <color hex="#4169E1">Royal Blue</color>
      </colors>
      <path>M 10 10 H 90 V 90 H 10 Z</path>
      <meaning>The three colors represent mind, energy, and unity...</meaning>
    </flag>
  </species>`,
  schema: {
    species: {
      name: String,
      origin: String,
      description: String,
      characteristics: {
        physiology: String,
        society: String,
        technology: String
      },
      flag: {
        colors: {
          color: [{
            $hex: String,
            $text: String
          }]
        },
        path: String,
        meaning: String
      }
    }
  },
  prompt: "Generate a unique and imaginative alien species profile with a distinctive flag design. Include specific details about their physiology, society, and technology level. Make the flag colors meaningful to their culture. Describe the specific details (like the flag meaning, physiology, society, technology) in only a couple sentences each.) Don't use too much text.",
  system: "You are a xenoanthropologist specializing in documenting alien species. Create detailed, creative species profiles with plausible yet unique characteristics. For flags, use 3-4 colors and create simple SVG paths (e.g., 'M 10 10 H 90 V 90 H 10 Z' or beziers for more stranger expressions). Make the species feel truly alien yet relatable.",
  temperature: .8,
  maxTokens: 1000,
  component: SpeciesProfile,
  transform: (data) => ({
    name: data.name,
    origin: data.origin,
    description: data.description,
    characteristics: {
      physiology: data.characteristics?.physiology,
      society: data.characteristics?.society,
      technology: data.characteristics?.technology
    },
    flag: {
      colors: data.flag?.colors?.color?.map((c: any) => ({
        name: c.$text,
        hex: c.$hex
      })) || [],
      path: data.flag?.path,
      meaning: data.flag?.meaning
    }
  }),
  simulateStream: async ({ chunkSize, speed, onChunk, onResult, signal }) => {
    console.log('Starting species simulation')
    
    const stream = xmllm(({ parse, select, map }: PipelineHelpers) => [
      async function*() {
        for (const chunk of generateChunks(speciesDemo.simulatedXml, chunkSize)) {
          if (signal.aborted) return
          yield chunk
          await delay(speed)
          onChunk(chunk)
        }
      },
      parse(),
      select('species'),
      map((data: any) => {
        console.log('Raw species data:', data)
        // Transform for simulated mode
        return {
          name: data?.name?.[0]?.$text,
          origin: data?.origin?.[0]?.$text,
          description: data?.description?.[0]?.$text,
          characteristics: {
            physiology: data?.characteristics?.[0]?.physiology?.[0]?.$text,
            society: data?.characteristics?.[0]?.society?.[0]?.$text,
            technology: data?.characteristics?.[0]?.technology?.[0]?.$text
          },
          flag: {
            colors: data?.flag?.[0]?.colors?.[0]?.color?.map((c: any) => ({
              name: c.$text,
              hex: c.$attr.hex
            })) || [],
            path: data?.flag?.[0]?.path?.[0]?.$text,
            meaning: data?.flag?.[0]?.meaning?.[0]?.$text
          }
        }
      })
    ])

    try {
      for await (const result of stream) {
        if (signal.aborted) return
        console.log('Transformed species data:', result)
        onResult(result)
      }
    } catch (error) {
      console.error('Species simulation error:', error)
    }
  }
} 