import { db } from '@/db'
import { abmSignals, abmTargets } from '@/db/schema/signals'
import { monitoredProfiles } from '@/db/schema/profiles'
import { eq, and, sql } from 'drizzle-orm'
import { createLogger } from '@/lib/logger'

const log = createLogger('signals/detect')

/**
 * Detecta sinais de compra em um perfil monitorado.
 * Pode ser chamado após um refresh de perfil ou post.
 */
export async function detectSignalsForProfile(profileId: string, userId: string) {
    log.info({ profileId, userId }, 'Checking for signals')

    try {
        const [profile] = await db
            .select()
            .from(monitoredProfiles)
            .where(and(eq(monitoredProfiles.id, profileId), eq(monitoredProfiles.userId, userId)))
            .limit(1)

        if (!profile) return

        // 1. Verificar se é um target ABM
        const [target] = await db
            .select()
            .from(abmTargets)
            .where(and(eq(abmTargets.profileId, profileId), eq(abmTargets.userId, userId)))
            .limit(1)

        // 2. Lógica de detecção (Simplificada para MVP)
        // No futuro, isso usaria IA comparando o estado anterior vs atual

        const signals = []

        // Exemplo: Mudança de headline (pode indicar promoção ou mudança de empresa)
        // Isso requereria histórico. Por enquanto, vamos simular detecção de keywords.

        const buyingKeywords = ['hiring', 'contratando', 'nova jornada', 'new role', 'promotion', 'funding', 'investimento', 'round']
        const profileContent = `${profile.name} ${profile.headline} ${profile.company}`.toLowerCase()

        for (const kw of buyingKeywords) {
            if (profileContent.includes(kw)) {
                signals.push({
                    userId,
                    profileId,
                    targetId: target?.id,
                    type: kw === 'hiring' || kw === 'contratando' ? 'buying_intent' : 'job_change',
                    title: `Sinal detectado: ${kw.toUpperCase()}`,
                    description: `${profile.name} mencionou "${kw}" no perfil.`,
                    isBuyingTrigger: true,
                    relevanceScore: 80,
                    occurredAt: new Date()
                })
                break; // Apenas um sinal por vez por simplicidade
            }
        }

        if (signals.length > 0) {
            for (const signal of signals) {
                await db.insert(abmSignals).values(signal)
            }
            log.info({ count: signals.length }, 'Sinais detectados e salvos')
        }

    } catch (error: any) {
        log.error({ profileId, err: error.message }, 'Erro ao detectar sinais')
    }
}
