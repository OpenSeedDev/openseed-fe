import { z } from 'zod'

const schema=z.object({VITE_API_MODE:z.enum(['mock','real']).default('mock'),VITE_API_BASE_URL:z.string().default('/api')})
export const env=schema.parse(import.meta.env)
