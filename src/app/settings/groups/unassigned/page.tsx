"use client";

import { useRouter } from 'next/navigation'
import { useProfilesStore } from '@/store/profiles.store'
import { useShallow } from 'zustand/react/shallow'
import { ChevronLeft, Trash2, UserPlus, LayoutList, MoreVertical, ExternalLink, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

export default function UnassignedPage() {
    const router = useRouter()

    const profiles = useProfilesStore(
        useShallow((s) => s.profiles.filter(p => !p.groupId))
    )
    const deleteProfile = useProfilesStore((s) => s.deleteProfile)

    const handleDeleteProfile = async (profileId: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover ${name}?`)) return

        try {
            const res = await fetch(`/api/linkedin/profiles/${profileId}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error()

            deleteProfile(profileId)
            toast.success(`${name} removido com sucesso`)
        } catch (err) {
            toast.error('Erro ao remover perfil')
        }
    }

    return (
        <div className="flex-1 flex flex-col bg-lf-s1 overflow-hidden h-full">
            {/* Header */}
            <div className="px-8 py-6 border-b border-lf-border flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-lf-s2 rounded-full text-lf-text3 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="lf-heading text-lf-text">Sem Grupo</h1>
                        <p className="lf-caption text-lf-text4 mt-0.5">{profiles.length} perfis avulsos</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => {
                            const event = new CustomEvent('open-add-profile', { detail: {} })
                            window.dispatchEvent(event)
                        }}
                        className="bg-lf-accent hover:bg-lf-accent2 text-white h-10 px-4 rounded-xl flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        Adicionar Leads
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    {profiles.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center border-[2px] border-dashed border-lf-border rounded-3xl bg-lf-s2/50">
                            <div className="h-16 w-16 rounded-full bg-lf-s1 flex items-center justify-center text-lf-text4 mb-4 shadow-sm">
                                <LayoutList size={32} />
                            </div>
                            <h3 className="lf-heading text-lf-text">Não há leads sem grupo</h3>
                            <p className="lf-body text-lf-text4 mt-2 max-w-sm">
                                Todos os seus leads estão organizados em grupos.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {profiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    className="group bg-white border border-lf-border rounded-2xl p-4 flex items-center gap-4 hover:border-lf-accent/30 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-lf-border">
                                        {profile.avatarUrl ? (
                                            <Image src={profile.avatarUrl} alt={profile.name} width={48} height={48} className="object-cover h-full w-full" unoptimized />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center font-bold text-lg"
                                                style={{ backgroundColor: `${profile.color}20`, color: profile.color }}
                                            >
                                                {profile.initials}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="lf-subtitle text-lf-text truncate font-bold">{profile.name}</h4>
                                            {!profile.active && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-lf-s3 text-lf-text4 font-bold border border-lf-border">INATIVO</span>
                                            )}
                                        </div>
                                        <p className="lf-caption text-lf-text3 truncate mt-0.5">{profile.role || 'Perfil LinkedIn'}</p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <a
                                            href={profile.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-lf-s2 rounded-xl text-lf-text4 hover:text-lf-accent transition-colors"
                                            title="Ver no LinkedIn"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                        <button
                                            onClick={() => handleDeleteProfile(profile.id, profile.name)}
                                            className="p-2 hover:bg-lf-red/10 rounded-xl text-lf-text4 hover:text-lf-red transition-colors"
                                            title="Remover Lead"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-lf-s2 rounded-xl text-lf-text4">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
