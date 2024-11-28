export type DemoConfig = {
  id: string
  name: string
  schema: any
  simulatedXml: string
  prompt: string
  system: string
  temperature: number
  maxTokens: number
  component: React.ComponentType<{ data: any }>
  transform: (data: any) => any
  simulateStream: (options: {
    chunkSize: number
    speed: number
    onChunk: (chunk: string) => void
    onResult: (result: any) => void
    signal: AbortSignal
  }) => Promise<void>
} 