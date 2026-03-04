"use client";

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Users } from 'lucide-react'
import { useProfilesStore } from '@/store/profiles.store'
import { useFeedStore } from '@/store/feed.store'
import { useHistoryStore } from '@/store/history.store'
import { GroupRow } from '@/components/profiles/GroupRow'
import { ProfileRow } from '@/components/profiles/ProfileRow'
import { AddProfileModal } from '@/components/profiles/AddProfileModal'

export function LeftPanel() {
    const groups = useProfilesStore((s) => s.groups)
    const profiles = useProfilesStore((s) => s.profiles)
    const postsCount = useFeedStore((s) => s.posts.length)
    const historyCount = useHistoryStore((s) => s.entries.length)
    const activeCount = profiles.filter(p => p.active).length

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [preselectedGroupId, setPreselectedGroupId] = useState<string | undefined>()

    // Listen for global custom event to open modal (from GroupRow plus buttons)
    const handleOpenModal = useCallback((e: Event) => {
        const detail = (e as CustomEvent).detail
        if (detail?.groupId) {
            setPreselectedGroupId(detail.groupId)
        } else {
            setPreselectedGroupId(undefined)
        }
        setIsModalOpen(true)
    }, [])

    useEffect(() => {
        window.addEventListener('open-add-profile', handleOpenModal)
        return () => window.removeEventListener('open-add-profile', handleOpenModal)
    }, [handleOpenModal])

    // Profiles without a group
    const ungroupedProfiles = profiles.filter(p => !p.groupId)

    return (
        <aside className="flex w-[200px] h-full flex-col border-r border-edge bg-white shrink-0 overflow-hidden">
            {/* Header: Gerenciar / Batch */}
            <div className="p-3 shrink-0">
                <button
                    onClick={() => {
                        setPreselectedGroupId(undefined)
                        setIsModalOpen(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--r-md)] bg-page text-ink-3 text-[12px] font-bold transition-all hover:bg-lime hover:text-ink"
                >
                    <Plus size={14} strokeWidth={2.5} />
                    Gerenciar / Batch
                </button>
            </div>

            {/* Section Label */}
            <div className="px-4 pb-2">
                <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-ink-4">
                    Organização
                </span>
            </div>

            {/* Scrollable Groups + Profiles */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {groups.length === 0 && ungroupedProfiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--r-md)] bg-page">
                            <Users size={18} className="text-ink-4" />
                        </div>
                        <p className="text-[11px] font-semibold text-ink-3">Nenhum perfil</p>
                        <p className="text-[10px] text-ink-4">Adicione perfis para monitorar</p>
                    </div>
                ) : (
                    <>
                        {/* Groups */}
                        {groups.map((group) => (
                            <GroupRow key={group.id} groupId={group.id} />
                        ))}

                        {/* Ungrouped profiles */}
                        {ungroupedProfiles.length > 0 && (
                            <div className="mt-1">
                                <div className="px-3 py-1.5">
                                    <span className="text-[9px] font-bold tracking-[1px] uppercase text-ink-4">
                                        Sem grupo
                                    </span>
                                </div>
                                {ungroupedProfiles.map((p) => (
                                    <ProfileRow key={p.id} profileId={p.id} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Stats Footer */}
            <div className="shrink-0 border-t border-edge h-[56px] flex items-center">
                <StatBox label="Posts" value={postsCount} />
                <StatBox label="Feitos" value={historyCount} />
                <StatBox label="Ativos" value={activeCount} highlight={activeCount > 0} />
            </div>

            {/* Add Profile Modal */}
            <AddProfileModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setPreselectedGroupId(undefined)
                }}
                defaultGroupId={preselectedGroupId}
            />
        </aside>
    )
}

function StatBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors">
            <span className={`text-[16px] font-bold leading-none ${highlight ? 'text-brand' : 'text-ink'}`}>
                {value}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[1px] text-ink-4">
                {label}
            </span>
        </div>
    )
}
