"use client";


import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MessageSquare, User, Zap } from 'lucide-react'
import Link from 'next/link'

export function PeopleList({ initialPeople }: { initialPeople: any[] }) {
    const [people] = useState(initialPeople)

    if (people.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum contato no CRM</h3>
                <p className="text-muted-foreground">Leads das suas campanhas aparecerão aqui automaticamente.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {people.map((person) => (
                <Card key={person.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={person.avatarUrl} alt={person.name} />
                                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{person.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">{person.headline}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={person.status === 'prospect' ? 'default' : 'secondary'}>
                                        {person.status}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                        {person.interactionCount} interações
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {person.aiBrief && (
                            <div className="mt-4 p-2 bg-primary/5 rounded text-xs border border-primary/10 italic">
                                "{person.aiBrief.slice(0, 100)}..."
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-4 border-t gap-2">
                            <div className="text-[10px] text-muted-foreground">
                                {person.lastInteractionAt ? (
                                    <>Última interação {formatDistanceToNow(new Date(person.lastInteractionAt), { addSuffix: true, locale: ptBR })}</>
                                ) : (
                                    <>Aguardando interação</>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Link href={`/crm/${person.id}`}>
                                    <Button size="sm" variant="outline">Ver Detalhes</Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
