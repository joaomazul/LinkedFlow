import { db } from '@/db'
import { crmPeople, crmInteractions } from '@/db/schema/crm'
import { eq, and, desc } from 'drizzle-orm'
import { getAuthenticatedUserId } from '@/lib/auth/user'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BriefSection } from '@/components/crm/brief-section'
import { InteractionTimeline } from '@/components/crm/interaction-timeline'
import { ArrowLeft, ExternalLink, Linkedin } from 'lucide-react'
import Link from 'next/link'

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const userId = await getAuthenticatedUserId()

    const [person] = await db
        .select()
        .from(crmPeople)
        .where(and(eq(crmPeople.id, id), eq(crmPeople.userId, userId)))
        .limit(1)

    if (!person) notFound()

    const interactions = await db
        .select()
        .from(crmInteractions)
        .where(eq(crmInteractions.personId, id))
        .orderBy(desc(crmInteractions.occurredAt))

    return (
        <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
            <Link href="/crm" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" /> Voltar para o CRM
            </Link>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Card className="w-full md:w-1/3">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4 border-2 border-primary/20">
                            <AvatarImage src={person.avatarUrl || ''} alt={person.name} />
                            <AvatarFallback className="text-2xl">{person.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h1 className="text-2xl font-bold">{person.name}</h1>
                        <p className="text-muted-foreground text-sm mt-1">{person.headline}</p>
                        <p className="text-primary font-medium text-xs mt-2">{person.company}</p>

                        <div className="flex gap-2 mt-4">
                            <Badge variant="secondary">{person.status}</Badge>
                            <Badge variant="outline">{person.priority}</Badge>
                        </div>

                        <div className="flex flex-col w-full gap-2 mt-6">
                            {person.linkedinUrl && (
                                <Button asChild variant="outline" className="w-full gap-2">
                                    <a href={person.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="h-4 w-4" /> Perfil LinkedIn
                                        <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                                    </a>
                                </Button>
                            )}
                            <Button className="w-full bg-primary text-primary-foreground">Nova Interação</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex-1 flex flex-col gap-6">
                    <BriefSection personId={person.id} initialBrief={person.aiBrief} lastBriefAt={person.lastBriefAt} />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Linha do Tempo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InteractionTimeline interactions={interactions} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
