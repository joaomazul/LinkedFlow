import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LightbulbIcon, TrendingUpIcon, AlertTriangleIcon, TrophyIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Insight {
    id: string
    insightType: string
    title: string
    body: string
    createdAt: string
    isRead: boolean
}

interface InsightsFeedProps {
    insights: Insight[]
    onMarkAsRead: (id: string) => void
    isLoading?: boolean
}

export function InsightsFeed({ insights, onMarkAsRead, isLoading }: InsightsFeedProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'best_format': return <TrophyIcon className="w-4 h-4 text-yellow-500" />
            case 'conversion_rate': return <TrendingUpIcon className="w-4 h-4 text-blue-500" />
            case 'warning': return <AlertTriangleIcon className="w-4 h-4 text-red-500" />
            default: return <LightbulbIcon className="w-4 h-4 text-primary" />
        }
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <LightbulbIcon className="w-5 h-5 text-primary" />
                    Insights da IA
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {insights.length === 0 && !isLoading && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum insight novo no momento. Continue publicando posts para gerar novas análises.
                    </p>
                )}

                {insights.map((insight) => (
                    <div
                        key={insight.id}
                        className="p-3 rounded-lg border bg-muted/30 relative hover:bg-muted/50 transition-colors cursor-pointer group"
                        onClick={() => onMarkAsRead(insight.id)}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-1">{getIcon(insight.insightType)}</div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold">{insight.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">{insight.body}</p>
                                <span className="text-[10px] text-muted-foreground uppercase pt-1 block">
                                    {formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true, locale: ptBR })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
