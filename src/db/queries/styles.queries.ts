import { db, commentStyles } from '@/db'
import { eq, and, asc, sql } from 'drizzle-orm'
import type { NewCommentStyle } from '@/db/schema/comment-styles'

export async function getStylesByUser(userId: string) {
    return db
        .select()
        .from(commentStyles)
        .where(eq(commentStyles.userId, userId))
        .orderBy(asc(commentStyles.displayOrder))
}

export async function getActiveStylesByUser(userId: string) {
    return db
        .select()
        .from(commentStyles)
        .where(
            and(
                eq(commentStyles.userId, userId),
                eq(commentStyles.active, true)
            )
        )
        .orderBy(asc(commentStyles.displayOrder))
}

export async function createStyle(data: NewCommentStyle) {
    const [style] = await db.insert(commentStyles).values(data).returning()
    return style
}

export async function updateStyle(
    id: string,
    userId: string,
    data: Partial<NewCommentStyle>
) {
    const [updated] = await db
        .update(commentStyles)
        .set({ ...data, updatedAt: new Date() })
        .where(
            and(
                eq(commentStyles.id, id),
                eq(commentStyles.userId, userId)
            )
        )
        .returning()
    return updated
}

export async function incrementStyleUsage(id: string) {
    await db
        .update(commentStyles)
        .set({
            usageCount: sql`${commentStyles.usageCount} + 1`,
            lastUsedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(commentStyles.id, id))
}

export async function deleteStyle(id: string, userId: string) {
    await db
        .delete(commentStyles)
        .where(
            and(
                eq(commentStyles.id, id),
                eq(commentStyles.userId, userId),
                eq(commentStyles.isCustom, true) // Só deleta estilos customizados
            )
        )
}

export async function reorderStyles(
    userId: string,
    order: Array<{ id: string; displayOrder: number }>
) {
    await db.transaction(async (tx) => {
        await Promise.all(
            order.map(({ id, displayOrder }) =>
                tx
                    .update(commentStyles)
                    .set({ displayOrder, updatedAt: new Date() })
                    .where(
                        and(
                            eq(commentStyles.id, id),
                            eq(commentStyles.userId, userId)
                        )
                    )
            )
        )
    })
}
