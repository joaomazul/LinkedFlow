"use client";

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProfilesStore } from '@/store/profiles.store'
import { useFeedStore } from '@/store/feed.store'
import { useHistoryStore } from '@/store/history.store'
import { ProfileRow } from '../profiles/ProfileRow'
import { AddProfileModal } from '../profiles/AddProfileModal'
import {
    LayoutList,
    SlidersHorizontal,
    UserCircle,
    Plus,
    Link2,
    Target,
    BarChart3Icon,
    MoreVertical,
    Users,
    Zap,
    ListChecks,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

import { GroupRow } from '../profiles/GroupRow'
import { useEffect } from 'react'

export function Sidebar() {
    const pathname = usePathname()
    const profiles = useProfilesStore((s) => s.profiles)
    const groups = useProfilesStore((s) => s.groups)
    const setProfiles = useProfilesStore((s) => s.setProfiles)
    const setGroups = useProfilesStore((s) => s.setGroups)

    const postsCount = useFeedStore((s) => s.posts.length)
    const historyCount = useHistoryStore((s) => s.entries.length)
    const activeProfilesCount = profiles.filter(p => p.active).length

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [preselectedGroupId, setPreselectedGroupId] = useState<string | undefined>()

    // Global listener to open modal with specific group
    useEffect(() => {
        const handleOpen = (e: any) => {
            const gid = e.detail?.groupId
            setPreselectedGroupId(gid)
            setIsModalOpen(true)
        }
        window.addEventListener('open-add-profile', handleOpen)
        return () => window.removeEventListener('open-add-profile', handleOpen)
    }, [])

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            try {
                const [pRes, gRes] = await Promise.all([
                    fetch('/api/linkedin/profiles'),
                    fetch('/api/linkedin/groups')
                ])
                if (pRes.ok) setProfiles((await pRes.json()).data || [])
                if (gRes.ok) setGroups((await gRes.json()).data || [])
            } catch (err) {
                console.error('Failed to load sidebar data', err)
            }
        }
        loadData()
    }, [setProfiles, setGroups])

    const unassignedProfiles = profiles.filter(p => !p.groupId)

    return (
        <aside className="flex w-[264px] h-full flex-col border-r border-lf-border bg-lf-s1 shrink-0 overflow-hidden shadow-sm">
            {/* 1. LOGO AREA */}
            <div className="h-[60px] px-5 flex items-center gap-3 border-b border-lf-border shrink-0">
                <div className="h-8 w-8 rounded-lg bg-lf-accent flex items-center justify-center text-white font-bricolage font-bold text-[13px] shadow-sm">
                    LF
                </div>
                <div className="lf-title tracking-tight">
                    <span className="text-lf-text3">Linked</span>
                    <span className="text-lf-accent">Flow</span>
                </div>
            </div>

            {/* 2. SEÇÃO MONITORADOS */}
            <div className="px-4 pt-5 pb-2 flex items-center justify-between">
                <span className="lf-label text-lf-text3">
                    Organização
                </span>
            </div>

            {/* BOTÃO ADICIONAR PERFIL */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="mx-4 mb-4 flex h-[38px] items-center justify-center gap-2 rounded-lg border border-dashed border-lf-border2 px-3 lf-caption text-lf-text2 font-medium transition-all duration-[var(--t-normal)] hover:bg-[var(--lf-accent-glow)] hover:border-lf-accent/40 hover:text-lf-accent w-[calc(100%-32px)] active:scale-95"
            >
                <Plus size={14} />
                Gerenciar / Batch
            </button>

            <AddProfileModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setPreselectedGroupId(undefined)
                }}
                defaultGroupId={preselectedGroupId}
            />

            {/* 3. LISTA DE GRUPOS E PERFIS */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col pb-4">
                    {/* Groups Section */}
                    {groups.length > 0 && (
                        <div className="flex flex-col">
                            {groups.map((group) => (
                                <GroupRow key={group.id} groupId={group.id} />
                            ))}
                        </div>
                    )}

                    {profiles.length === 0 && groups.length === 0 && (
                        <div className="py-12 px-8 text-center flex flex-col items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-lf-s2 flex items-center justify-center text-lf-text4">
                                <LayoutList size={20} />
                            </div>
                            <p className="lf-caption text-lf-text3">Comece adicionando grupos ou perfis</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. NAV LINKS */}
            <nav className="mx-3 pt-3 border-t border-lf-border flex flex-col gap-1 mb-2">
                <NavLink
                    href="/feed"
                    icon={<LayoutList size={15} />}
                    label="Feed"
                    active={pathname === '/feed'}
                />
                <NavLink
                    href="/posts"
                    icon={<LayoutList size={15} />}
                    label="Posts"
                    active={pathname === '/posts'}
                />
                <NavLink
                    href="/campaigns"
                    icon={<Target size={15} />}
                    label="Campanhas"
                    active={pathname.startsWith('/campaigns')}
                />
                <NavLink
                    href="/analytics"
                    icon={<BarChart3Icon size={15} />}
                    label="Analytics"
                    active={pathname === '/analytics'}
                />
                <NavLink
                    href="/crm"
                    icon={<Users size={15} />}
                    label="CRM Social"
                    active={pathname.startsWith('/crm')}
                />
                <NavLink
                    href="/signals"
                    icon={<Zap size={15} />}
                    label="ABM Signals"
                    active={pathname === '/signals'}
                />
                <NavLink
                    href="/cadence"
                    icon={<ListChecks size={15} />}
                    label="Cadência"
                    active={pathname === '/cadence'}
                />
                <NavLink
                    href="/settings/prompts"
                    icon={<SlidersHorizontal size={15} />}
                    label="Prompts"
                    active={pathname === '/settings/prompts'}
                />
                <NavLink
                    href="/settings/persona"
                    icon={<UserCircle size={15} />}
                    label="Meu Perfil IA"
                    active={pathname === '/settings/persona'}
                />
                <NavLink
                    href="/settings/account"
                    icon={<Link2 size={15} />}
                    label="Conta LinkedIn"
                    active={pathname === '/settings/account'}
                />
            </nav>

            {/* 5. FOOTER — Stats bar */}
            <div className="h-[56px] border-t border-lf-border flex items-center shrink-0">
                <StatBox label="Posts" value={postsCount} />
                <div className="w-[1px] h-6 bg-lf-border" />
                <StatBox label="Feitos" value={historyCount} />
                <div className="w-[1px] h-6 bg-lf-border" />
                <StatBox label="Ativos" value={activeProfilesCount} />
            </div>
        </aside>
    )
}

function NavLink({
    href,
    icon,
    label,
    active,
}: {
    href: string
    icon: React.ReactNode
    label: string
    active: boolean
}) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-2 h-[34px] px-3 rounded-r-md transition-all duration-[var(--t-fast)] lf-caption font-medium border border-transparent',
                active
                    ? 'bg-[var(--lf-accent-glow)] text-lf-accent border-lf-accent/20 shadow-sm'
                    : 'text-lf-text3 hover:bg-lf-s3 hover:text-lf-text2'
            )}
        >
            <span
                className={cn(
                    'transition-colors',
                    active ? 'text-lf-accent' : 'text-lf-text4 group-hover:text-lf-text2'
                )}
            >
                {icon}
            </span>
            {label}
        </Link>
    )
}

function StatBox({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center group cursor-default">
            <span className="font-bricolage text-[18px] font-bold text-lf-text leading-tight group-hover:text-lf-accent transition-colors duration-[var(--t-fast)]">
                {value}
            </span>
            <span className="lf-label text-lf-text4">
                {label}
            </span>
        </div>
    )
}
