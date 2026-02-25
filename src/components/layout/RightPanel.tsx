'use client'

import React from 'react'
import { useHistoryStore } from '@/store/history.store'
import { formatRelativeTime } from '@/lib/utils/format'
import { CommentHistoryEntry } from '@/types/linkedin.types'
import { Clock } from 'lucide-react'

export function RightPanel() {
    const entries = useHistoryStore((s) => s.entries)
    const sortedHistory = [...entries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return (
        <aside className="hidden lg:flex w-[252px] h-full flex-col border-l border-lf-border bg-lf-s1 shrink-0 overflow-hidden">
            <div className="h-[56px] px-5 flex items-center gap-2 border-b border-lf-border shrink-0">
                <h2 className="lf-subtitle lf-text">
                    Histórico
                </h2>
                <span className="lf-caption text-lf-text3">
                    ({entries.length})
                </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <div className="flex flex-col">
                    {sortedHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
                            <Clock className="h-7 w-7 text-lf-text4" />
                            <div className="flex flex-col gap-0.5">
                                <p className="lf-body-sm text-lf-text3">Seus comentários</p>
                                <p className="lf-body-sm text-lf-text4">aparecem aqui</p>
                            </div>
                        </div>
                    ) : (
                        sortedHistory.map((item) => (
                            <HistoryItem key={item.id} item={item} />
                        ))
                    )}
                </div>
            </div>
        </aside>
    )
}

function HistoryItem({ item }: { item: CommentHistoryEntry }) {
    const initials = item.authorName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <div className="group p-[11px_12px] border border-lf-border rounded-r-lg bg-lf-s2 mb-2 transition-all duration-[var(--t-fast)] hover:border-lf-border2 hover:bg-lf-s3 cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full lf-caption font-bold"
                    style={{
                        backgroundColor: `${item.authorColor || '#5b6ef5'}26`,
                        color: item.authorColor || '#5b6ef5'
                    }}
                >
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="truncate lf-caption font-600 text-lf-accent">
                        {item.authorName}
                    </p>
                </div>
                <span className="lf-caption text-lf-text3 flex-shrink-0">
                    {formatRelativeTime(item.timestamp)}
                </span>
            </div>

            <p className="line-clamp-2 lf-caption text-lf-text2 italic leading-relaxed">
                {item.text}
            </p>

            <div className="mt-[6px] inline-flex items-center gap-1 p-[2px_7px] bg-lf-s3 border border-lf-border rounded-r-sm">
                <span className="text-[11px]">
                    {getStyleIcon(item.styleId)}
                </span>
                <span className="lf-label text-lf-text3">
                    {item.styleId.replace('_', ' ')}
                </span>
            </div>
        </div>
    )
}

function getStyleIcon(styleId: string) {
    const icons: Record<string, string> = {
        positivo: '👍',
        valor: '💡',
        pergunta: '❓',
        sugestao: '🔧',
        relato: '📖',
        discordancia_respeitosa: '🤝',
        parabenizacao: '🎉',
    }
    return icons[styleId] || '💬'
}
