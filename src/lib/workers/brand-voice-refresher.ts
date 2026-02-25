import { db } from '@/db'
import { appSettings } from '@/db/schema'
import { analyzeBrandVoice } from '@/lib/posts/analyze-brand-voice'
import { createLogger } from '@/lib/logger'
import { getAccount } from '@/lib/unipile/accounts'

const log = createLogger('workers/brand-voice-refresher')

export async function refreshAllBrandVoices() {
    log.info('Starting weekly brand voice refresh')

    try {
        // Busca usuários que têm conta LinkedIn configurada
        const usersWithAccount = await db.select().from(appSettings)

        log.info({ count: usersWithAccount.length }, 'Users found for refresh')

        for (const settings of usersWithAccount) {
            if (!settings.activeLinkedinAccountId) continue

            try {
                log.info({ userId: settings.userId }, 'Refreshing brand voice for user')

                let selfProfileId: string | null = null
                try {
                    const meData = await getAccount(settings.activeLinkedinAccountId) as any
                    selfProfileId = meData?.id ?? meData?.profile_id ?? meData?.provider_id ?? null
                } catch {
                    log.warn(`[brand-voice-refresher] Não foi possível obter selfProfileId para userId ${settings.userId}`)
                }

                if (!selfProfileId) continue

                await analyzeBrandVoice(settings.userId, settings.activeLinkedinAccountId, selfProfileId)
            } catch (err) {
                log.error({ userId: settings.userId, err: (err as Error).message }, 'Failed to refresh for user')
            }
        }

        log.info('Brand voice refresh cycle complete')
    } catch (err) {
        log.error({ err: (err as Error).message }, 'Critical error in refresher worker')
    }
}
