import { db } from '@/db'
import { crmPeople } from '@/db/schema/crm'
import { eq, desc } from 'drizzle-orm'
import { getAuthenticatedUserId } from '@/lib/auth/user'
import CRMPageClient from './CRMPageClient'

export default async function CRMPage() {
    const userId = await getAuthenticatedUserId()

    const people = await db
        .select()
        .from(crmPeople)
        .where(eq(crmPeople.userId, userId))
        .orderBy(desc(crmPeople.lastInteractionAt))
        .limit(100)

    return <CRMPageClient initialPeople={people} />
}
