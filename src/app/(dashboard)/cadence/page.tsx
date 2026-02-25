import { db } from '@/db'
import { cadenceSuggestions } from '@/db/schema/cadence'
import { crmPeople } from '@/db/schema/crm'
import { eq, desc, and } from 'drizzle-orm'
import { getAuthenticatedUserId } from '@/lib/auth/user'
import { CadenceQueue } from '@/components/cadence/cadence-queue'
import { ListChecks } from 'lucide-react'

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
        .where(and(
            eq(cadenceSuggestions.userId, userId),
            eq(cadenceSuggestions.status, 'pending')
        ))
        .orderBy(desc(cadenceSuggestions.urgencyScore), desc(cadenceSuggestions.createdAt))
        .limit(20)

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ListChecks className="h-8 w-8 text-primary" />
                        Cadência Inteligente
                    </h1>
                    <p className="text-muted-foreground mt-1">Próximos passos sugeridos pela IA para seus contatos.</p>
                </div>
            </div>

            <CadenceQueue initialSuggestions={suggestions} />
        </div>
    )
}
