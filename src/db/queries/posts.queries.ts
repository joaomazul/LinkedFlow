import { db, posts } from '@/db'
import { eq, and, desc, inArray, sql, lt } from 'drizzle-orm'
import type { NewPost } from '@/db/schema/posts'

export async function getFeedByUser(
    userId: string,
    options: {
        limit?: number
        offset?: number
        status?: 'idle' | 'posted' | 'skipped'
        profileIds?: string[]
    } = {}
) {
    const conditions = [
        eq(posts.userId, userId),
        eq(posts.isHidden, false),
    ]

    if (options.status) {
        conditions.push(eq(posts.commentStatus, options.status))
    }

    if (options.profileIds?.length) {
        conditions.push(inArray(posts.profileId, options.profileIds))
    }

    return db
        .select()
        .from(posts)
        .where(and(...conditions))
        .orderBy(desc(posts.postedAt))
        .limit(options.limit ?? 50)
        .offset(options.offset ?? 0)
}

// Upsert: insere se não existir (por linkedinPostId), atualiza métricas se existir
export async function upsertPost(data: NewPost) {
    const [post] = await db
        .insert(posts)
        .values(data)
        .onConflictDoUpdate({
            target: posts.linkedinPostId,
            set: {
                likesCount: data.likesCount,
                commentsCount: data.commentsCount,
                repostsCount: data.repostsCount,
                fetchedAt: new Date(),
                updatedAt: new Date(),
            },
        })
        .returning()
    return post
}

// Upsert em lote para o refresh do feed
export async function upsertPosts(data: NewPost[]) {
    if (!data.length) return []
    return db
        .insert(posts)
        .values(data)
        .onConflictDoUpdate({
            target: posts.linkedinPostId,
            set: {
                likesCount: sql`excluded.likes_count`,
                commentsCount: sql`excluded.comments_count`,
                repostsCount: sql`excluded.reposts_count`,
                fetchedAt: sql`excluded.fetched_at`,
                updatedAt: new Date(),
            },
        })
        .returning()
}

export async function markPostAsCommented(id: string) {
    const [updated] = await db
        .update(posts)
        .set({ commentStatus: 'posted', updatedAt: new Date() })
        .where(eq(posts.id, id))
        .returning()
    return updated
}

export async function hidePost(id: string, userId: string) {
    await db
        .update(posts)
        .set({ isHidden: true, updatedAt: new Date() })
        .where(and(eq(posts.id, id), eq(posts.userId, userId)))
}

// Limpeza: remove posts com mais de 30 dias que não foram comentados
export async function cleanupOldPosts(userId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await db
        .delete(posts)
        .where(
            and(
                eq(posts.userId, userId),
                eq(posts.commentStatus, 'idle'),
                lt(posts.postedAt, thirtyDaysAgo)
            )
        )
}
