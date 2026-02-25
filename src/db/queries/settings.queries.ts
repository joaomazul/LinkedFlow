import { db, appSettings, personas } from '@/db'
import { eq, and } from 'drizzle-orm'
import type { NewAppSettings } from '@/db/schema/settings'
import type { NewPersona } from '@/db/schema/personas'

// ── App Settings ──
export async function getSettingsByUser(userId: string) {
    const [settings] = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.userId, userId))
        .limit(1)
    return settings ?? null
}

export async function upsertSettings(userId: string, data: Partial<NewAppSettings>) {
    const [settings] = await db
        .insert(appSettings)
        .values({ userId, ...data })
        .onConflictDoUpdate({
            target: appSettings.userId,
            set: { ...data, updatedAt: new Date() },
        })
        .returning()
    return settings
}

// ── Persona ──
export async function getActivePersona(userId: string) {
    const [persona] = await db
        .select()
        .from(personas)
        .where(
            and(
                eq(personas.userId, userId),
                eq(personas.isActive, 'true')
            )
        )
        .limit(1)
    return persona ?? null
}

export async function upsertPersona(userId: string, data: Partial<NewPersona>) {
    // Busca persona ativa existente
    const existing = await getActivePersona(userId)

    if (existing) {
        const [updated] = await db
            .update(personas)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(personas.id, existing.id))
            .returning()
        return updated
    }

    // Cria primeira persona
    const [created] = await db
        .insert(personas)
        .values({ userId, isActive: 'true', name: 'Minha Persona', ...data })
        .returning()
    return created
}
