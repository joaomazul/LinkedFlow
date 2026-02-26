"use client";

import { useState } from 'react'
import { CadenceQueue } from '@/components/cadence/cadence-queue'
import { ListChecks, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface CadencePageClientProps {
    initialSuggestions: any[]
    stats: { pending: number; done: number; dismissed: number }
}

export default function CadencePageClient({ initialSuggestions, stats }: CadencePageClientProps) {
    const [filter, setFilter] = useState<string>('pending')

    const filtered = initialSuggestions.filter(s => {
        if (filter === 'all') return true
        return s.suggestion.status === filter
    })

    const total = stats.pending + stats.done + stats.dismissed

    const filters = [
        { key: 'pending', label: 'Pendentes', count: stats.pending },
        { key: 'done', label: 'Concluídas', count: stats.done },
        { key: 'dismissed', label: 'Ignoradas', count: stats.dismissed },
    ]

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ListChecks className="h-7 w-7 text-primary" />
                    Cadência Inteligente
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Próximos passos sugeridos pela IA para seus contatos.</p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Total Sugestões" value={total} icon={<ListChecks size={16} className="text-lf-accent" />} />
                <StatsCard label="Pendentes" value={stats.pending} icon={<Clock size={16} className="text-amber-500" />} />
                <StatsCard label="Concluídas" value={stats.done} icon={<CheckCircle size={16} className="text-emerald-500" />} />
                <StatsCard label="Ignoradas" value={stats.dismissed} icon={<XCircle size={16} className="text-slate-400" />} />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={cn(
                            'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5',
                            filter === f.key
                                ? 'bg-white text-lf-accent shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {f.label}
                        <span className="text-[10px] bg-muted px-1.5 rounded-full">{f.count}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {total === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <ListChecks className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Nenhuma sugestão de cadência</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
                        A cadência analisa seus contatos no CRM e sugere ações de follow-up automaticamente.
                        Adicione perfis monitorados e crie campanhas para começar.
                    </p>
                    <div className="flex gap-3 mt-6">
                        <Link href="/crm" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">
                            Ver CRM <ArrowRight size={14} />
                        </Link>
                        <Link href="/signals" className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted/50 transition-all">
                            Ver Sinais ABM
                        </Link>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                    Nenhuma sugestão com o filtro selecionado.
                </div>
            ) : (
                <CadenceQueue initialSuggestions={filtered} />
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
