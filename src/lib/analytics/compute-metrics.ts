import { db } from '@/db'
import {
    generatedPosts,
    campaignEvents,
    campaignLeads,
    postPerformance,
    campaigns as campaignsTable
} from '@/db/schema'
import { and, eq, gte, lte, sql, count, avg, asc } from 'drizzle-orm'
import { PeriodMetrics } from './types'
import { format } from 'date-fns'

export async function computeMetricsForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<PeriodMetrics> {
    // 1. Posts no período
    const postsQuery = await db.select({
        count: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where status = 'published')::int`,
        avgScore: avg(generatedPosts.scoreOverall)
    }).from(generatedPosts).where(and(
        eq(generatedPosts.userId, userId),
        gte(generatedPosts.createdAt, startDate),
        lte(generatedPosts.createdAt, endDate)
    ))

    const p = postsQuery[0]

    // 2. Campanhas ativas
    const activeCampaigns = await db.select({ count: sql<number>`count(*)::int` })
        .from(campaignsTable)
        .where(and(
            eq(campaignsTable.userId, userId),
            eq(campaignsTable.status, 'active')
        ))

    // 3. Leads e Ações (via campaign_events)
    const events = await db.select({
        type: campaignEvents.eventType,
        count: sql<number>`count(*)::int`
    }).from(campaignEvents).where(and(
        eq(campaignEvents.userId, userId),
        gte(campaignEvents.createdAt, startDate),
        lte(campaignEvents.createdAt, endDate)
    )).groupBy(campaignEvents.eventType)

    const leadsCaptured = events.find(e => e.type === 'comment_captured')?.count || 0
    const actionsExecuted = events.find(e => e.type === 'action_executed')?.count || 0

    // 4. Leads status (via campaign_leads)
    const leadsStatus = await db.select({
        status: campaignLeads.status,
        count: sql<number>`count(*)::int`
    }).from(campaignLeads).where(and(
        eq(campaignLeads.userId, userId),
        gte(campaignLeads.createdAt, startDate),
        lte(campaignLeads.createdAt, endDate)
    )).groupBy(campaignLeads.status)

    const leadsApproved = leadsStatus.find(s => s.status === 'approved')?.count || 0
    const leadsCompleted = leadsStatus.find(s => s.status === 'completed')?.count || 0

    // 5. Performance de posts (reais do LinkedIn)
    const performance = await db.select({
        likes: sql<number>`coalesce(sum(likes), 0)::int`,
        comments: sql<number>`coalesce(sum(comments), 0)::int`,
        shares: sql<number>`coalesce(sum(shares), 0)::int`,
        avgEngagement: avg(postPerformance.engagementRate)
    }).from(postPerformance).where(and(
        eq(postPerformance.userId, userId),
        gte(postPerformance.publishedAt, startDate),
        lte(postPerformance.publishedAt, endDate)
    ))

    const perf = performance[0]

    // 6. Melhor formato
    const formatPerf = await db.select({
        format: generatedPosts.format,
        avgScore: avg(generatedPosts.scoreOverall)
    }).from(generatedPosts).where(and(
        eq(generatedPosts.userId, userId),
        eq(generatedPosts.status, 'published'),
        gte(generatedPosts.publishedAt, startDate),
        lte(generatedPosts.publishedAt, endDate)
    )).groupBy(generatedPosts.format).orderBy(sql`avg(score_overall) desc`).limit(1)

    // 7. Top Post
    const topPost = await db.select({
        id: generatedPosts.id,
        body: generatedPosts.body,
        format: generatedPosts.format,
        interactionCount: sql<number>`(likes + comments + shares)::int`
    }).from(postPerformance)
        .innerJoin(generatedPosts, eq(postPerformance.generatedPostId, generatedPosts.id))
        .where(and(
            eq(postPerformance.userId, userId),
            gte(postPerformance.publishedAt, startDate),
            lte(postPerformance.publishedAt, endDate)
        )).orderBy(sql`interactionCount desc`).limit(1)

    // 8. Time-series para o Gráfico (chartData)
    // Agrupa (likes + comments) por dia usando post_performance
    const dailyPerf = await db.select({
        date: sql<string>`to_char(date_trunc('day', ${postPerformance.publishedAt}), 'MM/DD')`,
        value: sql<number>`(sum(${postPerformance.likes}) + sum(${postPerformance.comments}))::int`
    }).from(postPerformance)
        .where(and(
            eq(postPerformance.userId, userId),
            gte(postPerformance.publishedAt, startDate),
            lte(postPerformance.publishedAt, endDate)
        ))
        .groupBy(sql`date_trunc('day', ${postPerformance.publishedAt})`)
        .orderBy(sql`date_trunc('day', ${postPerformance.publishedAt})`)

    // Se não houver dados diários suficientes, preenche vazio? Vamos retornar o que tem, o frontend lida.
    const chartData = dailyPerf.map(d => ({ date: d.date, value: d.value || 0 }))

    // 9. Heatmap (best times)
    const hourlyPerf = await db.select({
        dayRaw: sql<number>`extract(dow from ${postPerformance.publishedAt})::int`,
        hourRaw: sql<number>`extract(hour from ${postPerformance.publishedAt})::int`,
        engagement: sql<number>`(sum(${postPerformance.likes}) + sum(${postPerformance.comments}))::int`
    }).from(postPerformance)
        .where(and(
            eq(postPerformance.userId, userId),
            gte(postPerformance.publishedAt, startDate),
            lte(postPerformance.publishedAt, endDate)
        ))
        .groupBy(sql`extract(dow from ${postPerformance.publishedAt}), extract(hour from ${postPerformance.publishedAt})`)

    const heatmapData = hourlyPerf.map(h => ({
        day: h.dayRaw,
        hour: h.hourRaw,
        engagement: h.engagement || 0
    }))

    // 10. Format Breakdown (Pie Chart)
    const formatAgg = await db.select({
        format: postPerformance.format,
        count: sql<number>`count(*)::int`,
        totalInteractions: sql<number>`(sum(${postPerformance.likes}) + sum(${postPerformance.comments}))::int`
    }).from(postPerformance)
        .where(and(
            eq(postPerformance.userId, userId),
            gte(postPerformance.publishedAt, startDate),
            lte(postPerformance.publishedAt, endDate)
        ))
        .groupBy(postPerformance.format)

    const totalPostsFormats = formatAgg.reduce((acc, curr) => acc + (curr.count || 0), 0)
    const formatBreakdown = formatAgg.map(f => ({
        format: f.format || 'outros',
        count: f.count || 0,
        percentage: totalPostsFormats > 0 ? Math.round(((f.count || 0) / totalPostsFormats) * 100) : 0
    }))

    // 11. Score Accuracy
    const scoreAcc = await db.select({
        avgAccuracy: avg(postPerformance.scoreAccuracy)
    }).from(postPerformance)
        .where(and(
            eq(postPerformance.userId, userId),
            gte(postPerformance.publishedAt, startDate),
            lte(postPerformance.publishedAt, endDate)
        ))

    const avgScoreAcc = scoreAcc[0]?.avgAccuracy ? Number(scoreAcc[0].avgAccuracy) : null

    const conversionRate = leadsCaptured > 0 ? (leadsCompleted / leadsCaptured * 100) : 0

    return {
        postsCreated: p.count || 0,
        postsPublished: p.published || 0,
        avgScoreOverall: p.avgScore ? Number(p.avgScore) : null,
        bestFormat: formatPerf[0]?.format || null,
        topPost: topPost[0] ? {
            id: topPost[0].id,
            body: topPost[0].body,
            format: topPost[0].format,
            engagementRate: Number(topPost[0].interactionCount)
        } : null,
        campaignsActive: activeCampaigns[0].count || 0,
        leadsCaptured,
        leadsApproved,
        leadsCompleted,
        actionsExecuted,
        conversionRate,
        totalLikes: perf.likes || 0,
        totalComments: perf.comments || 0,
        totalShares: perf.shares || 0,
        avgEngagementRate: perf.avgEngagement ? Number(perf.avgEngagement) : null,
        chartData,
        heatmapData,
        formatBreakdown,
        scoreAccuracy: avgScoreAcc,
        trend: { posts: 0, leads: 0, engagement: 0 }
    }
}

export async function computeTrend(
    userId: string,
    currentStart: Date,
    currentEnd: Date
): Promise<{ posts: number; leads: number; engagement: number }> {
    const periodMs = currentEnd.getTime() - currentStart.getTime()
    const previousStart = new Date(currentStart.getTime() - periodMs)
    const previousEnd = new Date(currentStart.getTime())

    const current = await computeMetricsForPeriod(userId, currentStart, currentEnd)
    const previous = await computeMetricsForPeriod(userId, previousStart, previousEnd)

    const pct = (a: number, b: number) => b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100)

    return {
        posts: pct(current.postsPublished, previous.postsPublished),
        leads: pct(current.leadsCaptured, previous.leadsCaptured),
        engagement: pct(
            (current.totalLikes + current.totalComments),
            (previous.totalLikes + previous.totalComments)
        ),
    }
}
