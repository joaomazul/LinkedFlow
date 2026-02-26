import { db } from '@/db'
import { cadenceSuggestions } from '@/db/schema/cadence'
import { crmPeople } from '@/db/schema/crm'
import { eq, desc, and } from 'drizzle-orm'
import { getAuthenticatedUserId } from '@/lib/auth/user'
import CadencePageClient from './CadencePageClient'

export default async function CadencePage() {
    const userId = await getAuthenticatedUserId()

    const suggestions = await db
        .select({
            suggestion: cadenceSuggestions,
            personId: crmPeople.id,
            personName: crmPeople.name,
            personAvatar: crmPeople.avatarUrl,
            personHeadline: crmPeople.headline
        })
        .from(cadenceSuggestions)
        .innerJoin(crmPeople, eq(cadenceSuggestions.personId, crmPeople.id))
        .where(eq(cadenceSuggestions.userId, userId))
        .orderBy(desc(cadenceSuggestions.urgencyScore), desc(cadenceSuggestions.createdAt))
        .limit(50)

    const pendingCount = suggestions.filter(s => s.suggestion.status === 'pending').length
    const doneCount = suggestions.filter(s => s.suggestion.status === 'done').length
    const dismissedCount = suggestions.filter(s => s.suggestion.status === 'dismissed').length

    return (
        <CadencePageClient
            initialSuggestions={suggestions}
            stats={{ pending: pendingCount, done: doneCount, dismissed: dismissedCount }}
        />
    )
}
