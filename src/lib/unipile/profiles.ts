import { unipileFetch } from './client'
import { env } from '@/env'
import { createLogger } from '@/lib/logger'

const log = createLogger('unipile/profiles')

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface UnipileProfile {
    providerId: string   // ACoAAAcDMMQBODyLwZrRcgYhrkCafURGqva0U4E
    publicIdentifier: string   // joao-silva
    name: string
    firstName: string
    lastName: string
    headline: string
    avatarUrl: string | null
    avatarUrlLarge: string | null
    followerCount: number
    connectionsCount: number
    location: string
    isOpenProfile: boolean
    networkDistance: string   // FIRST_DEGREE, SECOND_DEGREE, etc.
}

export interface UnipilePost {
    id: string   // urn:li:activity:123... OU número puro
    socialId: string   // urn:li:activity:123...
    text: string
    publishedAt: string   // ISO 8601
    likesCount: number
    commentsCount: number
    repostsCount: number
    shareUrl: string | null
    imageUrl: string | null
    articleUrl: string | null
    articleTitle: string | null
    isRepost: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSO 1 — Extrai o public_identifier da URL do LinkedIn
// ─────────────────────────────────────────────────────────────────────────────

export function extractPublicIdentifier(linkedinUrl: string): string | null {
    // Suporta todos os formatos:
    // https://www.linkedin.com/in/nome-do-perfil/
    // https://linkedin.com/in/nome-do-perfil
    // linkedin.com/in/nome-do-perfil
    // nome-do-perfil (já extraído)
    const trimmed = linkedinUrl.trim().replace(/\/$/, '')

    // Se já é só o identifier (sem linkedin.com)
    if (!trimmed.includes('linkedin.com')) {
        // Valida que parece um identifier válido (sem espaços, sem /)
        if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed
        return null
    }

    const match = trimmed.match(/linkedin\.com\/in\/([^/?#\s]+)/)
    return match ? match[1] : null
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSO 2 — Busca perfil pelo public_identifier → retorna provider_id
// ─────────────────────────────────────────────────────────────────────────────

export async function resolveProfileByUrl(linkedinUrl: string): Promise<UnipileProfile> {
    const publicIdentifier = extractPublicIdentifier(linkedinUrl)

    if (!publicIdentifier) {
        throw new Error(
            `URL do LinkedIn inválida: "${linkedinUrl}". ` +
            `Use o formato: https://www.linkedin.com/in/nome-do-perfil`
        )
    }

    log.info({ publicIdentifier }, 'Resolvendo perfil')

    return resolveProfileByIdentifier(publicIdentifier)
}

export async function resolveProfileByIdentifier(identifier: string): Promise<UnipileProfile> {
    // Aceita tanto public_identifier (joao-silva) quanto provider_id (ACoAAA...)
    const qs = new URLSearchParams({
        account_id: env.UNIPILE_LINKEDIN_ACCOUNT_ID,
        linkedin_sections: 'about', // só dados básicos, sem histórico completo
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await unipileFetch<any>(
        `/users/${encodeURIComponent(identifier)}?${qs}`
    )

    if (!data?.provider_id) {
        throw new Error(
            `Perfil não encontrado para o identificador: "${identifier}". ` +
            `Verifique se a URL está correta e se o perfil é público.`
        )
    }

    const profile: UnipileProfile = {
        providerId: data.provider_id,
        publicIdentifier: data.public_identifier ?? identifier,
        name: [data.first_name, data.last_name].filter(Boolean).join(' ').trim(),
        firstName: data.first_name ?? '',
        lastName: data.last_name ?? '',
        headline: data.headline ?? '',
        avatarUrl: data.profile_picture_url ?? null,
        avatarUrlLarge: data.profile_picture_url_large ?? data.profile_picture_url ?? null,
        followerCount: data.follower_count ?? 0,
        connectionsCount: data.connections_count ?? 0,
        location: data.location ?? '',
        isOpenProfile: data.is_open_profile ?? false,
        networkDistance: data.network_distance ?? 'UNKNOWN',
    }

    log.info({
        identifier,
        providerId: profile.providerId,
        name: profile.name,
    }, 'Perfil resolvido')

    return profile
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSO 3 — Busca posts usando o provider_id
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchUserPosts(
    providerId: string,
    options: { limit?: number; cursor?: string } = {}
): Promise<{ posts: UnipilePost[]; nextCursor: string | null }> {
    const qs = new URLSearchParams({
        account_id: env.UNIPILE_LINKEDIN_ACCOUNT_ID,
        limit: String(options.limit ?? 10),
    })

    if (options.cursor) {
        qs.set('cursor', options.cursor)
    }

    log.info({ providerId, limit: options.limit ?? 10 }, 'Buscando posts')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await unipileFetch<any>(
        `/users/${encodeURIComponent(providerId)}/posts?${qs}`
    )

    const rawPosts = data.items ?? data.posts ?? data ?? []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posts: UnipilePost[] = (Array.isArray(rawPosts) ? rawPosts : [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((post: any): UnipilePost | null => {
            // Ignora itens sem ID
            const id = post.social_id ?? post.id ?? post.post_id
            if (!id) return null

            // Extrai imagem do primeiro attachment
            const firstAttachment = post.attachments?.[0]
            const imageUrl = firstAttachment?.url ?? firstAttachment?.image_url ?? null

            // Extrai artigo
            const article = post.article ?? post.shared_article ?? null

            return {
                id,
                socialId: post.social_id ?? id,
                text: post.text ?? post.commentary ?? '',
                publishedAt: post.parsed_datetime ?? post.date ?? null,
                likesCount: post.reaction_counter ?? post.num_likes ?? post.likes_count ?? 0,
                commentsCount: post.comment_counter ?? post.num_comments ?? post.comments_count ?? 0,
                repostsCount: post.repost_counter ?? post.num_reposts ?? post.reposts_count ?? 0,
                shareUrl: post.share_url ?? null,
                imageUrl: imageUrl,
                articleUrl: article?.url ?? null,
                articleTitle: article?.title ?? null,
                isRepost: post.is_repost ?? false,
            }
        })
        .filter((p): p is UnipilePost => p !== null)

    const nextCursor = data.cursor ?? data.next_cursor ?? null

    log.info({ providerId, count: posts.length, hasMore: !!nextCursor }, 'Posts recebidos')

    return { posts, nextCursor }
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNÇÃO COMPLETA — URL → posts (combina os 3 passos)
// Use quando ainda NÃO tem o provider_id salvo no banco
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchPostsFromProfileUrl(
    linkedinUrl: string,
    options: { limit?: number } = {}
): Promise<{ profile: UnipileProfile; posts: UnipilePost[] }> {
    // PASSO 1 + 2: URL → public_identifier → profile + provider_id
    const profile = await resolveProfileByUrl(linkedinUrl)

    // PASSO 3: provider_id → posts
    const { posts } = await fetchUserPosts(profile.providerId, options)

    return { profile, posts }
}
