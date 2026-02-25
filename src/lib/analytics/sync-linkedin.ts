import { db } from '@/db'
import { postPerformance } from '@/db/schema'
import { getPost } from '@/lib/unipile/posts'
import { eq, sql } from 'drizzle-orm'

export async function syncPostMetrics(
    linkedinPostId: string,
    accountId: string,
    userId: string
): Promise<void> {
    try {
        const post = await getPost(linkedinPostId, accountId) as any

        const interactions = (post.likes_count || 0) + (post.comments_count || 0) + (post.reposts_count || 0)
        const impressions = (post as any).impressions_count || 0 // Unipile might return impressions_count
        const engagementRate = impressions > 0
            ? Math.round((interactions / impressions) * 10000) / 100
            : 0

        await db.insert(postPerformance)
            .values({
                linkedinPostId,
                userId,
                likes: post.likes_count || 0,
                comments: post.comments_count || 0,
                shares: post.reposts_count || 0,
                engagementRate: engagementRate.toString(),
                lastSyncedAt: new Date(),
                syncCount: 1,
            })
            .onConflictDoUpdate({
                target: postPerformance.linkedinPostId,
                set: {
                    likes: post.likes_count || 0,
                    comments: post.comments_count || 0,
                    shares: post.reposts_count || 0,
                    engagementRate: engagementRate.toString(),
                    lastSyncedAt: new Date(),
                    syncCount: sql`${postPerformance.syncCount} + 1`,
                    updatedAt: new Date()
                }
            })
    } catch (error) {
        console.error(`[sync-linkedin] Erro ao sincronizar post ${linkedinPostId}:`, error)
        // Falha silenciosa — não crítico
    }
}
