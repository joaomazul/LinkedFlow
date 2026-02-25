import type { UnipilePost } from '@/types/unipile.types'
import type { LinkedInPost, } from '@/types/linkedin.types'
import type { MonitoredProfile } from '@/types/linkedin.types'
// Converte post da API Unipile para o modelo interno do app
export function mapUnipilePost(
    post: UnipilePost,
    profile: MonitoredProfile
): LinkedInPost {
    return {
        id: `local_${post.id}`,
        linkedinPostId: post.id,
        authorId: profile.id,
        authorName: profile.name,
        authorRole: profile.role,
        authorLinkedinId: post.author.id,
        authorAvatarUrl: post.author.profile_picture_url,
        authorInitials: profile.initials,
        authorColor: profile.color,
        text: post.text,
        imageUrls: post.media?.filter(m => m.type === 'IMAGE').map(m => m.url),
        videoUrl: post.media?.find(m => m.type === 'VIDEO')?.url,
        articleUrl: post.article?.url,
        articleTitle: post.article?.title,
        metrics: {
            likes: post.num_likes,
            comments: post.num_comments,
            reposts: post.num_reposts ?? 0,
            views: post.num_views,
        },
        postedAt: post.created_at,
        fetchedAt: new Date().toISOString(),
        commentStatus: 'idle',
        url: post.post_url,
    }
}

export function formatNumber(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toString()
}

import { formatDistance, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toZonedTime, format as formatTz } from 'date-fns-tz'

const SP_TIMEZONE = 'America/Sao_Paulo'

// "há 2 horas", "há 3 dias" etc — relativo ao horário de SP
export function formatRelativeTime(isoDate: string): string {
    const date = toZonedTime(parseISO(isoDate), SP_TIMEZONE)
    const spNow = toZonedTime(new Date(), SP_TIMEZONE)
    return formatDistance(date, spNow, { addSuffix: true, locale: ptBR })
}

// Data completa: "15 jan 2025, 14h30" no horário de SP
export function formatFullDate(isoDate: string): string {
    const date = toZonedTime(parseISO(isoDate), SP_TIMEZONE)
    return formatTz(date, "d MMM yyyy, HH'h'mm", { timeZone: SP_TIMEZONE, locale: ptBR })
}

// Apenas hora: "14:30"
export function formatTime(isoDate: string): string {
    const date = toZonedTime(parseISO(isoDate), SP_TIMEZONE)
    return formatTz(date, 'HH:mm', { timeZone: SP_TIMEZONE })
}

// Para gravar no banco: sempre UTC (ISO string)
export function nowIso(): string {
    return new Date().toISOString()
}

