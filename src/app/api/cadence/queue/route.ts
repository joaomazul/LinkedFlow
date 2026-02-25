import { NextRequest } from 'next/server'
import { db } from '@/db'
import { cadenceSuggestions } from '@/db/schema/cadence'
import { crmPeople } from '@/db/schema/crm'
import { eq, desc, and } from 'drizzle-orm'
import { getAuthenticatedUserId } from '@/lib/auth/user'
import { createApiResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId()
        if (!userId) return createApiResponse.unauthorized()

        const suggestions = await db
            .select({
                suggestion: cadenceSuggestions,
                personName: crmPeople.name,
                personAvatar: crmPeople.avatarUrl,
                personHeadline: crmPeople.headline
            })
            .from(cadenceSuggestions)
            .innerJoin(crmPeople, eq(cadenceSuggestions.personId, crmPeople.id))
            .where(and(
                eq(cadenceSuggestions.userId, userId),
                eq(cadenceSuggestions.status, 'pending')
            ))
            .orderBy(desc(cadenceSuggestions.urgencyScore), desc(cadenceSuggestions.createdAt))
            .limit(20)

        return createApiResponse.success({ suggestions })

    } catch (error: any) {
        return createApiResponse.error(error.message)
    }
}
