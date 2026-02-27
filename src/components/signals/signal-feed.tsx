"use client";


import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, ExternalLink, Sparkles, TrendingUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SignalFeed({ initialSignals }: { initialSignals: any[] }) {
    const [signals] = useState(initialSignals)
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const handleActNow = async (signal: any, personId: string) => {
        setLoading(signal.id)
        try {
            const res = await fetch('/api/cadence/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personId,
                    reason: `Sinal "${signal.title}" (${signal.type}) detectado. IA: Aproveite o gatilho para puxar assunto.`,
                })
            })
            if (!res.ok) throw new Error()
            toast.success('Cadência criada!', { description: 'Sinal convertido em ação na sua fila de cadência.' })
            router.push('/cadence')
        } catch (e) {
            toast.error('Erro ao criar cadência. Tente novamente.')
        } finally {
            setLoading(null)
        }
    }

    if (signals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed rounded-xl bg-muted/10">
                <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium">Nenhum sinal detectado</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    Aguarde o monitoramento dos perfis ABM para ver gatilhos de compra e mudanças de carreira aqui.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {signals.map(({ signal, profileName, profileAvatar, profileHeadline }) => (
                <Card key={signal.id} className={`transition-all hover:shadow-md ${signal.isBuyingTrigger ? 'border-primary/30 bg-primary/5' : ''}`}>
                    <CardContent className="p-5">
                        <div className="flex gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={profileAvatar} />
                                <AvatarFallback>{profileName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-semibold text-sm">{profileName}</h4>
                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                        {formatDistanceToNow(new Date(signal.occurredAt), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{profileHeadline}</p>

                                <div className="mt-3 flex items-center gap-2">
                                    <Badge variant={signal.isBuyingTrigger ? 'default' : 'secondary'} className="text-[10px] h-5">
                                        {signal.type.toUpperCase()}
                                    </Badge>
                                    {signal.relevanceScore >= 80 && (
                                        <Badge variant="outline" className="text-[10px] h-5 border-orange-500 text-orange-600 gap-1">
                                            <TrendingUp className="h-2 w-2" /> Alta Relevância
                                        </Badge>
                                    )}
                                </div>

                                <div className="mt-3">
                                    <h3 className="text-sm font-bold text-foreground">{signal.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{signal.description}</p>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-2"
                                        onClick={() => handleActNow(signal, signal.personId)}
                                        disabled={loading === signal.id}
                                    >
                                        {loading === signal.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                        Agir agora
                                    </Button>
                                    {signal.url && (
                                        <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" asChild>
                                            <a href={signal.url} target="_blank" rel="noopener noreferrer">
                                                Fonte <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
