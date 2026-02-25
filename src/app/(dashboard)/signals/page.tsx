import { db } from '@/db'
import { abmSignals } from '@/db/schema/signals'
import { monitoredProfiles } from '@/db/schema/profiles'
import { eq, desc, and } from 'drizzle-orm'
import { getAuthenticatedUserId } from '@/lib/auth/user'
import { SignalFeed } from '@/components/signals/signal-feed'
import { Zap } from 'lucide-react'

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
        .limit(50)

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Zap className="h-8 w-8 text-primary fill-primary/20" />
                        ABM Signal Engine
                    </h1>
                    <p className="text-muted-foreground mt-1">Sinais detectados nos perfis que você monitora.</p>
                </div>
            </div>

            <SignalFeed initialSignals={signals} />
        </div>
    )
}
