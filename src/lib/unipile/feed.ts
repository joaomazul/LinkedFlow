import { unipileFetch } from './client'
import type { UnipileFeedResponse, UnipilePost } from '@/types/unipile.types'

export interface GetFeedOptions {
    accountId: string
    cursor?: string
    limit?: number
}

export interface GetProfilePostsOptions {
    accountId: string
    profileId: string        // LinkedIn provider_id
    cursor?: string
    limit?: number
}

// Feed geral da conta (o que aparece no home do LinkedIn)
export async function getHomeFeed(options: GetFeedOptions): Promise<UnipileFeedResponse> {
    const params = new URLSearchParams({
        account_id: options.accountId,
        limit: String(options.limit ?? 20),
    })
    if (options.cursor) params.set('cursor', options.cursor)

    return unipileFetch<UnipileFeedResponse>(`/linkedin/posts?${params}`)
}

// Posts de um perfil específico
export async function getProfilePosts(
    options: GetProfilePostsOptions
): Promise<UnipileFeedResponse> {
    const params = new URLSearchParams({
        account_id: options.accountId,
        limit: String(options.limit ?? 10),
    })
    if (options.cursor) params.set('cursor', options.cursor)

    return unipileFetch<UnipileFeedResponse>(
        `/linkedin/posts?author_id=${options.profileId}&${params}`
    )
}

// Busca posts de múltiplos perfis e mescla por data (mais recente primeiro)
export async function getMultiProfileFeed(
    accountId: string,
    profileIds: string[],
    limitPerProfile = 5
): Promise<UnipilePost[]> {
    const results = await Promise.allSettled(
        profileIds.map(pid =>
            getProfilePosts({ accountId, profileId: pid, limit: limitPerProfile })
        )
    )

    const allPosts: UnipilePost[] = []
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allPosts.push(...result.value.items)
        }
        // Posts de perfis que falharam são simplesmente ignorados
    })

    // Ordena do mais recente para o mais antigo
    return allPosts.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
}
