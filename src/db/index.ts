import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { env } from '@/env'

// Skip neon() during Next.js static generation (DATABASE_URL is not available)
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

const sql = isBuildPhase ? ((() => {}) as unknown as ReturnType<typeof neon>) : neon(env.DATABASE_URL)
export const db = isBuildPhase ? ({} as ReturnType<typeof drizzle<typeof schema>>) : drizzle(sql, { schema })
export { sql as neonSql }
export * from './schema'
