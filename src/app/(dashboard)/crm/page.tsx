import { db } from '@/db'
import { crmPeople } from '@/db/schema/crm'
import { eq, desc } from 'drizzle-orm'
import { getAuthenticatedUserId } from '@/lib/auth/user'
import { PeopleList } from '@/components/crm/people-list'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default async function CRMPage() {
    const userId = await getAuthenticatedUserId()

    // Fetch inicial direto no servidor para performance
    const people = await db
        .select()
        .from(crmPeople)
        .where(eq(crmPeople.userId, userId))
        .orderBy(desc(crmPeople.lastInteractionAt))
        .limit(50)

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Mini CRM Social</h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar contatos..."
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="grid gap-6">
                <PeopleList initialPeople={people} />
            </div>
        </div>
    )
}
