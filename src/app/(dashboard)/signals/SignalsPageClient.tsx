"use client";

import { useState } from 'react'
import { SignalFeed } from '@/components/signals/signal-feed'
import { Zap, Bell, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SignalsPageClientProps {
    initialSignals: any[]
    stats: {
        total: number
        buyingTriggers: number
        highRelevance: number
        types: string[]
    }
}

export default function SignalsPageClient({ initialSignals, stats }: SignalsPageClientProps) {
    const [typeFilter, setTypeFilter] = useState<string>('all')

    const filtered = typeFilter === 'all'
        ? initialSignals
        : initialSignals.filter(s => s.signal.type === typeFilter)

    const uniqueTypes = [...new Set(initialSignals.map(s => s.signal.type))]

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Zap className="h-7 w-7 text-primary fill-primary/20" />
                    ABM Signal Engine
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Sinais detectados nos perfis que você monitora.</p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Total Sinais" value={stats.total} icon={<Zap size={16} className="text-lf-accent" />} />
                <StatsCard label="Gatilhos de Compra" value={stats.buyingTriggers} icon={<AlertCircle size={16} className="text-red-500" />} />
                <StatsCard label="Alta Relevância" value={stats.highRelevance} icon={<TrendingUp size={16} className="text-amber-500" />} />
                <StatsCard label="Tipos Detectados" value={uniqueTypes.length} icon={<Bell size={16} className="text-blue-500" />} />
            </div>

            {/* Type Filter Tabs */}
            {initialSignals.length > 0 && uniqueTypes.length > 1 && (
                <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit flex-wrap">
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={cn(
                            'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                            typeFilter === 'all'
                                ? 'bg-white text-lf-accent shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        Todos
                    </button>
                    {uniqueTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={cn(
                                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize',
                                typeFilter === type
                                    ? 'bg-white text-lf-accent shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {type.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            {initialSignals.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Zap className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Nenhum sinal detectado</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
                        O ABM Signal Engine monitora seus perfis e detecta gatilhos de compra, mudanças de cargo
                        e outros sinais relevantes automaticamente.
                    </p>
                    <Link
                        href="/feed"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all mt-6"
                    >
                        Gerenciar Perfis <ArrowRight size={14} />
                    </Link>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                    Nenhum sinal com o filtro selecionado.
                </div>
            ) : (
                <SignalFeed initialSignals={filtered} />
            )}
        </div>
    )
}

function StatsCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="bg-white border border-lf-border rounded-xl p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-lf-s1 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold font-bricolage">{value}</p>
            </div>
        </div>
    )
}
