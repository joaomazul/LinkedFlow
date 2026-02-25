import { db, monitoredProfiles } from '@/db'
import { eq, and, asc, } from 'drizzle-orm'
import type { NewMonitoredProfile } from '@/db/schema/profiles'

// Busca todos os perfis de um usuário, ordenados por displayOrder
export async function getProfilesByUser(userId: string) {
    return db
        .select()
        .from(monitoredProfiles)
        .where(eq(monitoredProfiles.userId, userId))
        .orderBy(asc(monitoredProfiles.displayOrder))
}

// Apenas perfis ativos (para o feed)
export async function getActiveProfilesByUser(userId: string) {
    return db
        .select()
        .from(monitoredProfiles)
        .where(
            and(
                eq(monitoredProfiles.userId, userId),
                eq(monitoredProfiles.active, true)
            )
        )
        .orderBy(asc(monitoredProfiles.displayOrder))
}

export async function getProfileById(id: string) {
    const [profile] = await db
        .select()
        .from(monitoredProfiles)
        .where(eq(monitoredProfiles.id, id))
        .limit(1)
    return profile ?? null
}

export async function createProfile(data: NewMonitoredProfile) {
    const [profile] = await db
        .insert(monitoredProfiles)
        .values(data)
        .returning()
    return profile
}

export async function updateProfile(
    id: string,
    data: Partial<NewMonitoredProfile>
) {
    const [updated] = await db
        .update(monitoredProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(monitoredProfiles.id, id))
        .returning()
    return updated
}

export async function toggleProfileActive(id: string, active: boolean) {
    return updateProfile(id, { active })
}

export async function deleteProfile(id: string) {
    await db
        .delete(monitoredProfiles)
        .where(eq(monitoredProfiles.id, id))
}

// Reordena perfis: recebe array de { id, order }
export async function reorderProfiles(
    userId: string,
    order: Array<{ id: string; displayOrder: number }>
) {
    await db.transaction(async (tx) => {
        await Promise.all(
            order.map(({ id, displayOrder }) =>
                tx
                    .update(monitoredProfiles)
                    .set({ displayOrder, updatedAt: new Date() })
                    .where(
                        and(
                            eq(monitoredProfiles.id, id),
                            eq(monitoredProfiles.userId, userId)
                        )
                    )
            )
        )
    })
}
