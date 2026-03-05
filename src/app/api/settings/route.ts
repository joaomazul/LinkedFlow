import { getAuthenticatedUserId } from '@/lib/auth/user'
import { getSettingsByUser, getActivePersona } from '@/db/queries/settings.queries'
import { getStylesByUser } from '@/db/queries/styles.queries'
import { getProfilesByUser } from '@/db/queries/profiles.queries'
import { success, apiError } from '@/lib/utils/api-response'
import { db } from '@/db'
import { profileGroups } from '@/db/schema/groups'
import { eq } from 'drizzle-orm'
import { env } from '@/env'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
    try {
        const userId = await getAuthenticatedUserId()
        logger.info({ userId }, '[settings] GET started')

        const t0 = Date.now()
        const [settings, persona, styles, profiles, groups] = await Promise.all([
            getSettingsByUser(userId),
            getActivePersona(userId),
            getStylesByUser(userId),
            getProfilesByUser(userId),
            db.select().from(profileGroups).where(eq(profileGroups.userId, userId))
        ])

        const activeAccountId = settings?.activeLinkedinAccountId || env.UNIPILE_LINKEDIN_ACCOUNT_ID || null
        logger.info({
            userId,
            ms: Date.now() - t0,
            profiles: profiles?.length ?? 0,
            groups: groups?.length ?? 0,
            styles: styles?.length ?? 0,
            hasPersona: !!persona,
            hasAccountId: !!activeAccountId,
            isSetupComplete: !!(settings?.activeLinkedinAccountId && profiles.length > 0),
        }, '[settings] GET complete')

        return success({
            linkedinAccountId: activeAccountId,
            autoRefreshInterval: settings?.autoRefreshInterval || 0,
            persona: persona || null,
            styles: styles || [],
            profiles: profiles || [],
            groups: groups || [],
            isSetupComplete: !!(settings?.activeLinkedinAccountId && profiles.length > 0)
        })
    } catch (error) {
        logger.error({ err: error }, '[settings] GET FAILED')
        return apiError('Erro ao carregar configurações', 500)
    }
}
