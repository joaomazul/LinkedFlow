import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MessageSquare, ThumbsUp, UserPlus, FileText, BadgeCheck } from 'lucide-react'

export function InteractionTimeline({ interactions }: { interactions: any[] }) {
    if (interactions.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">Nenhuma interação registrada ainda.</p>
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'comment': return <MessageSquare className="h-4 w-4" />
            case 'like': return <ThumbsUp className="h-4 w-4" />
            case 'invite': return <UserPlus className="h-4 w-4" />
            case 'dm': return <MessageSquare className="h-4 w-4" />
            case 'completed': return <BadgeCheck className="h-4 w-4 text-green-500" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    return (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
            {interactions.map((interaction, idx) => (
                <div key={interaction.id} className="relative flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm z-10 ${idx === 0 ? 'ring-2 ring-primary/20 border-primary/50' : ''}`}>
                        {getIcon(interaction.type)}
                    </div>
                    <div className="flex flex-col flex-1 gap-1 pt-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold capitalize">{interaction.type}</span>
                            <time className="text-[10px] text-muted-foreground">
                                {format(new Date(interaction.occurredAt), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                            </time>
                        </div>
                        {interaction.content && (
                            <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border border-muted/50 mt-1">
                                {interaction.content}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
