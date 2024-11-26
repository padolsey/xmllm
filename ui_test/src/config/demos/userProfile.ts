import { LiveProfile } from '../../components/LiveProfile'
import { xmllm } from '../../../../src/xmllm-client.mjs'
import type { DemoConfig } from '../../types/demos'

function* generateChunks(text: string, chunkSize: number) {
  let index = 0
  while (index < text.length) {
    yield text.slice(index, index + chunkSize)
    index += chunkSize
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const userProfileDemo: DemoConfig = {
  id: 'user-profile',
  name: 'User Profile Generator',
  simulatedXml: `<user_profile>
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
  </user_profile>`,
  schema: {
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
  },
  prompt: "Generate a fun and interesting user profile for a tech professional based somewhere in the world. Seed: not cyberpunk, not USA, not stereotypical.",
  system: "You are a profile generator. Create engaging user profiles with colorful details. Do not over-focus on locale in determinising interests. Do not over-focus on job in determining hobbies.",
  temperature: 0.7,
  maxTokens: 1000,
  component: LiveProfile,
  transform: (data) => ({
    name: data.name,
    bio: data.bio,
    details: {
      location: data.details?.location,
      favoriteColor: {
        name: data.details?.favorite_color?.$text,
        hex: data.details?.favorite_color?.$hex
      }
    },
    hobbies: data.hobbies?.hobby?.map(h => ({
      activity: h.$text,
      category: h.$category
    })) || [],
    skills: data.skills?.skill?.map(s => ({
      name: s.$text,
      level: s.$level
    })) || []
  }),
  simulateStream: async ({ chunkSize, speed, onChunk, onResult, signal }) => {
    console.log('Starting simulated stream')
    
    const stream = xmllm(({ parse, select, map }) => [
      async function*() {
        for (const chunk of generateChunks(userProfileDemo.simulatedXml, chunkSize)) {
          if (signal.aborted) return
          yield chunk
          await delay(speed)
          onChunk(chunk)
        }
      },
      parse(),
      select('user_profile'),
      map(data => {
        console.log('Raw data before transform:', data)
        const transformed = userProfileDemo.transform({
          name: data?.name?.[0]?.$text,
          bio: data?.bio?.[0]?.$text,
          details: {
            location: data?.details?.[0]?.location?.[0]?.$text,
            favorite_color: {
              $text: data?.details?.[0]?.favorite_color?.[0]?.$text,
              $hex: data?.details?.[0]?.favorite_color?.[0]?.$attr?.hex
            }
          },
          hobbies: {
            hobby: data?.hobbies?.[0]?.hobby?.map(h => ({
              $text: h.$text,
              $category: h.$attr.category
            }))
          },
          skills: {
            skill: data?.skills?.[0]?.skill?.map(s => ({
              $text: s.$text,
              $level: s.$attr.level
            }))
          }
        })
        console.log('Transformed data:', transformed)
        return transformed
      })
    ])

    try {
      for await (const result of stream) {
        if (signal.aborted) return
        console.log('Stream result:', result)
        onResult(result)
      }
    } catch (error) {
      console.error('Simulation error:', error)
    }
  }
} 