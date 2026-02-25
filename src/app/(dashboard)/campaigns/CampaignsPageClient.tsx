"use client";

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { Plus, Target, Users, Zap, ExternalLink, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Campaign {
    id: string
    name: string
    status: string
    postUrl: string
    totalCaptured: number
    totalApproved: number
    totalCompleted: number
    createdAt: string
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/campaigns')
            .then(res => res.json())
            .then(data => {
                setCampaigns(data.data || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="flex flex-col h-full bg-lf-s2">
            {/* Header */}
            <header className="h-[70px] border-b border-lf-border bg-white px-8 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="lf-title text-xl">Campanhas</h1>
                    <p className="lf-caption text-lf-text3">Monitore posts e automatize seu social selling</p>
                </div>

                <Link
                    href="/campaigns/new"
                    className="h-10 px-4 bg-lf-accent text-white rounded-lg lf-caption font-semibold flex items-center gap-2 hover:bg-lf-accent/90 transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} />
                    Nova Campanha
                </Link>
            </header>

            <main className="flex-1 overflow-y-auto p-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lf-accent"></div>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="max-w-md mx-auto mt-12 text-center flex flex-col items-center gap-4">
                        <div className="h-16 w-16 bg-lf-s1 rounded-full flex items-center justify-center text-lf-text4 border border-lf-border">
                            <Target size={32} />
                        </div>
                        <div>
                            <h3 className="lf-title text-lg mb-1">Nenhuma campanha ativa</h3>
                            <p className="lf-caption text-lf-text3 text-center">
                                Crie sua primeira campanha de Lead Magnet para começar a capturar leads automaticamente de seus posts.
                            </p>
                        </div>
                        <Link
                            href="/campaigns/new"
                            className="mt-2 h-11 px-6 bg-lf-accent text-white rounded-lg lf-caption font-semibold flex items-center gap-2 hover:bg-lf-accent/90 transition-all"
                        >
                            Começar agora
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
    const statusColors: Record<string, string> = {
        active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        paused: 'bg-amber-100 text-amber-700 border-amber-200',
        draft: 'bg-slate-100 text-slate-700 border-slate-200',
        completed: 'bg-blue-100 text-blue-700 border-blue-200'
    }

    return (
        <div className="bg-white border border-lf-border rounded-xl p-5 hover:shadow-lg transition-all group flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div>
                    <div className={cn(
                        "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-2",
                        statusColors[campaign.status] || statusColors.draft
                    )}>
                        {campaign.status === 'active' ? '● Ativa' : campaign.status}
                    </div>
                    <h3 className="lf-title text-base leading-tight group-hover:text-lf-accent transition-colors">
                        {campaign.name}
                    </h3>
                </div>
                <button className="h-8 w-8 rounded-lg flex items-center justify-center text-lf-text4 hover:bg-lf-s1 hover:text-lf-text2 transition-colors">
                    <MoreVertical size={16} />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-lf-s1/50 rounded-lg p-3">
                <div className="flex flex-col">
                    <span className="lf-label text-[10px] text-lf-text4">Leads</span>
                    <span className="font-bricolage text-lg font-bold text-lf-text2">{campaign.totalCaptured}</span>
                </div>
                <div className="flex flex-col border-x border-lf-border/50 px-3">
                    <span className="lf-label text-[10px] text-lf-text4">Aceitos</span>
                    <span className="font-bricolage text-lg font-bold text-emerald-600">{campaign.totalApproved}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="lf-label text-[10px] text-lf-text4">Feitos</span>
                    <span className="font-bricolage text-lg font-bold text-lf-accent">{campaign.totalCompleted}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <Link
                    href={`/campaigns/${campaign.id}/leads`}
                    className="flex-1 h-9 px-3 rounded-lg border border-lf-border flex items-center justify-center gap-2 lf-caption text-xs font-semibold hover:bg-lf-s1 hover:border-lf-border2 transition-all"
                >
                    <Users size={14} />
                    Fila de Leads
                </Link>
                <Link
                    href={`/campaigns/${campaign.id}/results`}
                    className="flex-1 h-9 px-3 rounded-lg bg-lf-s1 flex items-center justify-center gap-2 lf-caption text-xs font-semibold text-lf-text2 border border-transparent hover:border-lf-accent/30 hover:text-lf-accent transition-all"
                >
                    <Zap size={14} />
                    Resultados
                </Link>
            </div>

            <a
                href={campaign.postUrl}
                target="_blank"
                rel="noreferrer"
                className="lf-caption text-[11px] text-lf-text4 hover:text-lf-accent flex items-center justify-center gap-1 mt-1 transition-colors"
            >
                Ver post original <ExternalLink size={10} />
            </a>
        </div>
    )
}
