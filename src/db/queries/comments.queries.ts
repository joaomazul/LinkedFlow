import { db, comments, posts, monitoredProfiles } from '@/db'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { NewComment } from '@/db/schema/comments'

// Histórico de comentários postados
export async function getCommentHistory(
    userId: string,
    limit = 50
) {
    return db
        .select({
            comment: comments,
            post: { id: posts.id, text: posts.text, postUrl: posts.postUrl },
            profile: { name: monitoredProfiles.name, color: monitoredProfiles.color },
        })
        .from(comments)
        .innerJoin(posts, eq(comments.postId, posts.id))
        .innerJoin(monitoredProfiles, eq(comments.profileId, monitoredProfiles.id))
        .where(
            and(
                eq(comments.userId, userId),
                eq(comments.status, 'posted')
            )
        )
        .orderBy(desc(comments.postedAt))
        .limit(limit)
}

export async function createComment(data: NewComment) {
    const [comment] = await db
        .insert(comments)
        .values(data)
        .returning()
    return comment
}

export async function markCommentPosted(
    id: string,
    linkedinCommentId: string
) {
    const [updated] = await db
        .update(comments)
        .set({
            status: 'posted',
            linkedinCommentId,
            postedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(comments.id, id))
        .returning()
    return updated
}

export async function markCommentFailed(id: string, reason: string) {
    const [updated] = await db
        .update(comments)
        .set({
            status: 'failed',
            failedAt: new Date(),
            failReason: reason,
            updatedAt: new Date(),
        })
        .where(eq(comments.id, id))
        .returning()
    return updated
}

// Analytics: estilos mais usados por um usuário
export async function getStyleUsageStats(userId: string) {
    return db
        .select({
            styleId: comments.styleId,
            count: sql<number>`count(*)::int`,
        })
        .from(comments)
        .where(
            and(
                eq(comments.userId, userId),
                eq(comments.status, 'posted')
            )
        )
        .groupBy(comments.styleId)
        .orderBy(desc(sql`count(*)`))
}
