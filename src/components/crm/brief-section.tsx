'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function BriefSection({
    personId,
    initialBrief,
    lastBriefAt
}: {
    personId: string,
    initialBrief: string | null,
    lastBriefAt: Date | null
}) {
    const [brief, setBrief] = useState(initialBrief)
    const [lastUpdate, setLastUpdate] = useState(lastBriefAt)
    const [loading, setLoading] = useState(false)

    async function handleGenerate() {
        setLoading(true)
        try {
            const res = await fetch(`/api/crm/people/${personId}/brief`, { method: 'POST' })
            const data = await res.json()
            if (data.ok) {
                setBrief(data.data.brief)
                setLastUpdate(new Date())
                toast.success('Brief gerado com sucesso!')
            } else {
                toast.error('Erro ao gerar brief')
            }
        } catch (err) {
            toast.error('Erro de conexão')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    AI Strategic Brief
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {brief ? (
                    <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-muted-foreground italic">
                            "{brief}"
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-primary/60">
                            <Sparkles className="h-3 w-3" />
                            Geral pela IA {lastUpdate ? formatDistanceToNow(new Date(lastUpdate), { addSuffix: true, locale: ptBR }) : ''}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-4 text-center">
                        <p className="text-xs text-muted-foreground mb-4">Ainda não há um brief estratégico para este contato.</p>
                        <Button size="sm" onClick={handleGenerate} disabled={loading} className="gap-2">
                            <Sparkles className="h-4 w-4" /> Gerar Brief Agora
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
