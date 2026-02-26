"use client";

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MessageSquare, User, Search, Users, Activity, Filter } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CRMPageClientProps {
    initialPeople: any[]
}

const statusLabels: Record<string, string> = {
    prospect: 'Prospect',
    qualified: 'Qualificado',
    customer: 'Cliente',
    churned: 'Perdido',
}

export default function CRMPageClient({ initialPeople }: CRMPageClientProps) {
    const [people] = useState(initialPeople)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const filtered = people.filter(p => {
        const matchesSearch = !search ||
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.headline?.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalInteractions = people.reduce((s: number, p: any) => s + (p.interactionCount || 0), 0)
    const recentCount = people.filter((p: any) => {
        if (!p.lastInteractionAt) return false
        const diff = Date.now() - new Date(p.lastInteractionAt).getTime()
        return diff < 7 * 24 * 60 * 60 * 1000 // last 7 days
    }).length

    const filters = [
        { key: 'all', label: 'Todos' },
        { key: 'prospect', label: 'Prospects' },
        { key: 'qualified', label: 'Qualificados' },
        { key: 'customer', label: 'Clientes' },
    ]

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">CRM Social</h1>
                <p className="text-sm text-muted-foreground mt-1">Gerencie seus contatos e acompanhe interações</p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Total Contatos" value={people.length} icon={<Users size={16} className="text-lf-accent" />} />
                <StatsCard label="Interações" value={totalInteractions} icon={<MessageSquare size={16} className="text-blue-500" />} />
                <StatsCard label="Ativos (7d)" value={recentCount} icon={<Activity size={16} className="text-emerald-500" />} />
                <StatsCard label="Prospects" value={people.filter((p: any) => p.status === 'prospect').length} icon={<User size={16} className="text-amber-500" />} />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar contatos..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setStatusFilter(f.key)}
                            className={cn(
                                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                                statusFilter === f.key
                                    ? 'bg-white text-lf-accent shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* People List */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                        {people.length === 0 ? 'Nenhum contato no CRM' : 'Nenhum resultado encontrado'}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        {people.length === 0
                            ? 'Leads das suas campanhas aparecerão aqui automaticamente.'
                            : 'Tente ajustar o filtro ou a busca.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((person: any) => (
                        <Card key={person.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={person.avatarUrl} alt={person.name} />
                                        <AvatarFallback>{person.name?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg truncate">{person.name}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{person.headline}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant={person.status === 'prospect' ? 'default' : 'secondary'}>
                                                {statusLabels[person.status] || person.status}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px]">
                                                {person.interactionCount} interações
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {person.aiBrief && (
                                    <div className="mt-4 p-2 bg-primary/5 rounded text-xs border border-primary/10 italic">
                                        &quot;{person.aiBrief.slice(0, 100)}...&quot;
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
                                        <Link href={`/crm/${person.id}`}>
                                            <Button size="sm" variant="outline">Ver Detalhes</Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
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
