"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface BestTime {
    day: number
    hour: number
    engagement: number
}

interface BestTimesHeatmapProps {
    data: BestTime[]
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function BestTimesHeatmap({ data }: BestTimesHeatmapProps) {
    const maxEngagement = Math.max(...data.map(d => d.engagement), 1)

    const getEngagement = (day: number, hour: number) => {
        return data.find(d => d.day === day && d.hour === hour)?.engagement || 0
    }

    const getColor = (engagement: number) => {
        if (engagement === 0) return 'bg-muted/20'
        const intensity = engagement / maxEngagement
        if (intensity < 0.2) return 'bg-primary/20'
        if (intensity < 0.4) return 'bg-primary/40'
        if (intensity < 0.6) return 'bg-primary/60'
        if (intensity < 0.8) return 'bg-primary/80'
        return 'bg-primary'
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Melhores Horários para Postar</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="min-w-[600px] flex flex-col gap-1">
                        <div className="flex gap-1">
                            <div className="w-10" />
                            {HOURS.filter(h => h % 2 === 0).map(h => (
                                <div key={h} className="flex-1 text-[10px] text-muted-foreground text-center">
                                    {h}h
                                </div>
                            ))}
                        </div>

                        <TooltipProvider>
                            {DAYS.map((dayLabel, dayIndex) => (
                                <div key={dayLabel} className="flex gap-1 items-center">
                                    <div className="w-10 text-[10px] font-medium text-muted-foreground">
                                        {dayLabel}
                                    </div>
                                    {HOURS.map(hour => {
                                        const engagement = getEngagement(dayIndex, hour)
                                        return (
                                            <Tooltip key={hour}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "flex-1 aspect-square rounded-sm border-[0.5px] border-background/50 transition-transform active:scale-90",
                                                            getColor(engagement)
                                                        )}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">
                                                        {dayLabel}, {hour}h: <strong>{Math.round(engagement * 10) / 10}% engajamento</strong>
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    })}
                                </div>
                            ))}
                        </TooltipProvider>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
