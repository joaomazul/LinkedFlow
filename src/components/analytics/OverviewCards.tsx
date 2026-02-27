import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpIcon, ArrowDownIcon, FileTextIcon, UsersIcon, BarChart3Icon, TargetIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
    title: string
    value: string | number
    trend?: number
    icon: React.ReactNode
    isLoading?: boolean
}

function MetricCard({ title, value, trend, icon, isLoading }: MetricCardProps) {
    if (isLoading) return <Skeleton className="h-32 w-full" />

    const isPositive = trend && trend > 0
    const isNegative = trend && trend < 0

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="text-primary">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend !== undefined && (
                    <p className={cn(
                        "text-xs mt-1 flex items-center gap-1",
                        isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-muted-foreground"
                    )}>
                        {isPositive ? <ArrowUpIcon className="w-3 h-3" /> : isNegative ? <ArrowDownIcon className="w-3 h-3" /> : null}
                        <span>{Math.abs(trend)}%</span>
                        <span className="text-muted-foreground">vs período anterior</span>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

interface OverviewCardsProps {
    data?: {
        scoreAccuracy: number | null
        leadsCaptured: number
        totalLikes: number
        totalComments: number
        conversionRate: number
        trend: {
            leads: number
            engagement: number
        }
    }
    isLoading?: boolean
}

export function OverviewCards({ data, isLoading }: OverviewCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Score da IA vs Real"
                value={data?.scoreAccuracy !== null && data?.scoreAccuracy !== undefined ? `${data.scoreAccuracy}%` : 'N/A'}
                icon={<TargetIcon className="w-4 h-4" />}
                isLoading={isLoading}
            />
            <MetricCard
                title="Leads Capturados"
                value={data?.leadsCaptured ?? 0}
                trend={data?.trend.leads}
                icon={<TargetIcon className="w-4 h-4" />}
                isLoading={isLoading}
            />
            <MetricCard
                title="Engajamento Total"
                value={(data?.totalLikes ?? 0) + (data?.totalComments ?? 0)}
                trend={data?.trend.engagement}
                icon={<BarChart3Icon className="w-4 h-4" />}
                isLoading={isLoading}
            />
            <MetricCard
                title="Taxa de Conversão"
                value={`${Math.round(data?.conversionRate ?? 0)}%`}
                icon={<UsersIcon className="w-4 h-4" />}
                isLoading={isLoading}
            />
        </div>
    )
}
