import { db } from '@/db'
import { abmSignals } from '@/db/schema/signals'
import { monitoredProfiles } from '@/db/schema/profiles'
import { eq, desc, and, gte } from 'drizzle-orm'
import { getAuthenticatedUserId } from '@/lib/auth/user'
import SignalsPageClient from './SignalsPageClient'

export default async function SignalsPage() {
    const userId = await getAuthenticatedUserId()

    const signals = await db
        .select({
            signal: abmSignals,
            profileName: monitoredProfiles.name,
            profileAvatar: monitoredProfiles.avatarUrl,
            profileHeadline: monitoredProfiles.headline
        })
        .from(abmSignals)
        .innerJoin(monitoredProfiles, eq(abmSignals.profileId, monitoredProfiles.id))
        .where(eq(abmSignals.userId, userId))
        .orderBy(desc(abmSignals.occurredAt))
        .limit(100)

    const buyingTriggers = signals.filter(s => s.signal.isBuyingTrigger).length
    const highRelevance = signals.filter(s => (s.signal.relevanceScore ?? 0) >= 80).length
    const types = [...new Set(signals.map(s => s.signal.type))]

    return (
        <SignalsPageClient
            initialSignals={signals}
            stats={{
                total: signals.length,
                buyingTriggers,
                highRelevance,
                types,
            }}
        />
    )
}
