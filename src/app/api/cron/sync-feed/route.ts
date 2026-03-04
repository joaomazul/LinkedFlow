import { NextResponse } from 'next/server'
import { db } from '@/db'
import { monitoredProfiles } from '@/db/schema/profiles'
import { eq, and, lt, or, isNull } from 'drizzle-orm'
import { fetchAndCacheProfilePosts } from '@/app/api/linkedin/feed/route'
import { createLogger } from '@/lib/logger'
import { env } from '@/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const log = createLogger('cron/sync-feed')

const BATCH_SIZE = 3
const INTER_BATCH_DELAY_MS = 500
const SKIP_IF_FETCHED_WITHIN_MS = 2 * 60 * 60 * 1000 // 2 hours
// Time budget: stop processing before serverless timeout (default 8s, configurable)
const MAX_EXECUTION_MS = Number(process.env.CRON_TIME_BUDGET_MS ?? 8000)

export async function GET(req: Request) {
    if (req.headers.get('Authorization') !== `Bearer ${env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()

    try {
        log.info('Iniciando sync automático do feed')

        // Get all profiles that need syncing (across all users, sorted by oldest fetch)
        const threshold = new Date(Date.now() - SKIP_IF_FETCHED_WITHIN_MS)

        const profilesToSync = await db
            .select()
            .from(monitoredProfiles)
            .where(and(
                eq(monitoredProfiles.active, true),
                or(
                    isNull(monitoredProfiles.lastFetchedAt),
                    lt(monitoredProfiles.lastFetchedAt, threshold)
                )
            ))

        if (profilesToSync.length === 0) {
            log.info('Nenhum perfil precisa de sync')
            return NextResponse.json({ ok: true, synced: 0, skipped: 0, failed: 0, message: 'No profiles need sync' })
        }

        log.info({ count: profilesToSync.length }, 'Perfis para sincronizar')

        let totalSynced = 0
        let totalFailed = 0
        let timedOut = false

        // Process in batches with time budget
        for (let i = 0; i < profilesToSync.length; i += BATCH_SIZE) {
            // Check time budget before starting a new batch
            if (Date.now() - startTime > MAX_EXECUTION_MS) {
                log.warn({ elapsed: Date.now() - startTime, processed: totalSynced + totalFailed, remaining: profilesToSync.length - i }, 'Approaching timeout, stopping early')
                timedOut = true
                break
            }

            const batch = profilesToSync.slice(i, i + BATCH_SIZE)

            const results = await Promise.allSettled(
                batch.map(profile => fetchAndCacheProfilePosts(profile.userId, profile))
            )

            results.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                    totalSynced++
                } else {
                    totalFailed++
                    log.warn({
                        profileId: batch[idx].id,
                        profileName: batch[idx].name,
                        err: result.reason?.message ?? String(result.reason),
                    }, 'Falha ao sincronizar perfil')
                }
            })

            // Short delay between batches to avoid rate limits
            if (i + BATCH_SIZE < profilesToSync.length) {
                await new Promise(resolve => setTimeout(resolve, INTER_BATCH_DELAY_MS))
            }
        }

        const elapsed = Date.now() - startTime
        log.info({ totalSynced, totalFailed, timedOut, elapsed }, 'Sync automático do feed concluído')

        return NextResponse.json({
            ok: true,
            synced: totalSynced,
            failed: totalFailed,
            timedOut,
            elapsed,
        })

    } catch (err: unknown) {
        log.error({ err: (err as Error).message }, 'Erro crítico no sync automático do feed')
        return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
}
