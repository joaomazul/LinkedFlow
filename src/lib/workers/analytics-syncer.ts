import { db } from '@/db'
import { appSettings, generatedPosts, analyticsSnapshots } from '@/db/schema'
import { eq, and, gt, sql } from 'drizzle-orm'
import { syncPostMetrics } from '@/lib/analytics/sync-linkedin'
import { computeMetricsForPeriod } from '@/lib/analytics/compute-metrics'
import { generateWeeklyInsights } from '@/lib/analytics/generate-insights'
import { createLogger } from '@/lib/logger'

const log = createLogger('workers/analytics-syncer')

export async function runDailyAnalyticsSync() {
    log.info('Iniciando sincronização diária de analytics')

    try {
        const usersWithAccount = await db.select().from(appSettings)

        for (const settings of usersWithAccount) {
            if (!settings.activeLinkedinAccountId) continue
            const userId = settings.userId

            try {
                // 1. Sincronizar métricas dos posts publicados nos últimos 30 dias
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                const recentPosts = await db.select().from(generatedPosts)
                    .where(and(
                        eq(generatedPosts.userId, userId),
                        eq(generatedPosts.status, 'published'),
                        gt(generatedPosts.publishedAt, thirtyDaysAgo)
                    ))

                log.info({ userId, postCount: recentPosts.length }, 'Sincronizando posts para usuário')

                for (const post of recentPosts) {
                    if (post.linkedinPostIdFromUnipile) {
                        await syncPostMetrics(
                            post.linkedinPostIdFromUnipile,
                            settings.activeLinkedinAccountId as string,
                            userId
                        )
                    }
                }

                // 2. Criar snapshot diário
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                yesterday.setHours(0, 0, 0, 0)

                const metrics = await computeMetricsForPeriod(userId, thirtyDaysAgo, new Date())

                await db.insert(analyticsSnapshots).values({
                    userId,
                    snapshotDate: yesterday.toISOString().split('T')[0],
                    snapshotType: 'daily',
                    postsCreated: metrics.postsCreated,
                    postsPublished: metrics.postsPublished,
                    avgScoreOverall: metrics.avgScoreOverall?.toString(),
                    bestFormat: metrics.bestFormat,
                    campaignsActive: metrics.campaignsActive,
                    leadsCaptured: metrics.leadsCaptured,
                    leadsApproved: metrics.leadsApproved,
                    leadsCompleted: metrics.leadsCompleted,
                    actionsExecuted: metrics.actionsExecuted,
                    conversionRate: metrics.conversionRate.toString(),
                    linkedinLikes: metrics.totalLikes,
                    linkedinComments: metrics.totalComments,
                    linkedinShares: metrics.totalShares,
                }).onConflictDoUpdate({
                    target: [analyticsSnapshots.userId, analyticsSnapshots.snapshotDate, analyticsSnapshots.snapshotType],
                    set: {
                        postsCreated: metrics.postsCreated,
                        postsPublished: metrics.postsPublished,
                        avgScoreOverall: metrics.avgScoreOverall?.toString(),
                        bestFormat: metrics.bestFormat,
                        campaignsActive: metrics.campaignsActive,
                        leadsCaptured: metrics.leadsCaptured,
                        leadsApproved: metrics.leadsApproved,
                        leadsCompleted: metrics.leadsCompleted,
                        actionsExecuted: metrics.actionsExecuted,
                        conversionRate: metrics.conversionRate.toString(),
                        linkedinLikes: metrics.totalLikes,
                        linkedinComments: metrics.totalComments,
                        linkedinShares: metrics.totalShares,
                    }
                })

                // 3. Toda segunda-feira: gerar insights semanais
                if (new Date().getDay() === 1) {
                    await generateWeeklyInsights(userId, metrics)
                }

                log.info({ userId }, 'Analytics sincronizado com sucesso')
            } catch (err) {
                log.error({ userId, err: (err as Error).message }, 'Falha ao sincronizar analytics para usuário')
            }
        }

        log.info('Ciclo de sincronização de analytics finalizado')
    } catch (err) {
        log.error({ err: (err as Error).message }, 'Erro crítico no worker de analytics')
    }
}
