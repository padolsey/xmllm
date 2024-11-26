import { userProfileDemo } from './userProfile'
import { speciesDemo } from './species'

export const demos = [
  userProfileDemo,
  speciesDemo
] as const

export type DemoId = typeof demos[number]['id'] 