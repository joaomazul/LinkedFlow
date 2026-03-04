import { neon } from '@neondatabase/serverless'

// DB-backed rate limiter using Neon SQL (works across serverless instances)
// Auto-creates the rate_limits table on first use

let _sql: ReturnType<typeof neon> | null = null
let _tableReady = false

function getSql() {
    if (!_sql) {
        _sql = neon(process.env.DATABASE_URL!)
    }
    return _sql
}

async function ensureTable() {
    if (_tableReady) return
    const sql = getSql()
    await sql`
        CREATE TABLE IF NOT EXISTS rate_limits (
            key TEXT PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 1,
            expires_at BIGINT NOT NULL
        )
    `
    _tableReady = true
}

export async function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    await ensureTable()
    const sql = getSql()

    const now = Date.now()
    const expiresAt = now + windowMs

    // Atomic upsert: insert new record or increment existing (reset if expired)
    const result = await sql`
        INSERT INTO rate_limits (key, count, expires_at)
        VALUES (${key}, 1, ${expiresAt})
        ON CONFLICT (key) DO UPDATE SET
            count = CASE
                WHEN rate_limits.expires_at < ${now} THEN 1
                ELSE rate_limits.count + 1
            END,
            expires_at = CASE
                WHEN rate_limits.expires_at < ${now} THEN ${expiresAt}
                ELSE rate_limits.expires_at
            END
        RETURNING count, expires_at
    ` as Record<string, unknown>[]

    const currentCount = Number(result[0].count)
    const resetAt = Number(result[0].expires_at)

    return {
        success: currentCount <= limit,
        limit,
        remaining: Math.max(0, limit - currentCount),
        reset: resetAt,
    }
}
