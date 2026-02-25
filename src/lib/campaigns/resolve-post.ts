import { getPost } from '@/lib/unipile/posts'

interface ResolvedPost {
    linkedinPostId: string
    postText: string
    authorName: string
    authorId: string
    publishedAt: string | null
    commentsCount: number
    likesCount: number
}

/**
 * Extrai o identificador do post de diferentes formatos de URL do LinkedIn.
 * Suporta:
 *   - https://www.linkedin.com/feed/update/urn:li:activity:123456789/
 *   - https://www.linkedin.com/posts/username_slug-123456789/
 *   - https://www.linkedin.com/posts/username_slug-ugcPost-123456789-TrackCode/
 *   - urn:li:activity:123456789 (passado diretamente)
 *   - urn:li:ugcPost:123456789 (passado diretamente)
 */
export function extractPostIdentifier(url: string): string | null {
    const trimmed = url.trim()

    // Formato direto: urn:li:activity:XXXXXXXXX ou urn:li:ugcPost:XXXXXXXXX
    if (trimmed.startsWith('urn:li:activity:') || trimmed.startsWith('urn:li:ugcPost:')) {
        return trimmed
    }

    // Formato: /feed/update/urn:li:activity:XXXXXXXXX ou urn:li:ugcPost:XXXXXXXXX
    const feedMatch = trimmed.match(/\/feed\/update\/(urn:li:(?:activity|ugcPost):\d+)/)
    if (feedMatch) return feedMatch[1]

    // Formato ugcPost: /posts/username_slug-ugcPost-XXXXXXXXX[-TrackCode][/?...]
    // Ex: /posts/joaoturazzi_...-ugcPost-7430621104173424640-LqVy?utm_source=...
    const ugcMatch = trimmed.match(/\/posts\/[^/?]+-ugcPost-(\d{10,})(?:-[A-Za-z0-9]+)?\/?(?:\?|$)/)
    if (ugcMatch) return `urn:li:ugcPost:${ugcMatch[1]}`

    // Formato activity regular: /posts/username_slug-XXXXXXXXX[-TrackCode][/?...]
    const postsMatch = trimmed.match(/\/posts\/[^/?]+-(\d{10,})(?:-[A-Za-z0-9]+)?\/?(?:\?|$)/)
    if (postsMatch) return `urn:li:activity:${postsMatch[1]}`

    // Fallback: tenta extrair qualquer sequência de 10+ dígitos na URL
    const numericMatch = trimmed.match(/[^0-9](\d{10,})(?:-[A-Za-z0-9]+)?\/?(?:\?.*)?$/)
    if (numericMatch) return `urn:li:activity:${numericMatch[1]}`

    return null
}

export async function resolvePostFromUrl(
    url: string,
    accountId: string
): Promise<ResolvedPost> {
    const identifier = extractPostIdentifier(url)

    if (!identifier) {
        throw new Error('URL do LinkedIn inválida. Cole a URL completa do post.')
    }

    try {
        const post = await getPost(identifier, accountId)

        return {
            linkedinPostId: post.id,
            postText: post.text,
            authorName: post.author.name,
            authorId: post.author.id,
            publishedAt: post.created_at,
            commentsCount: post.num_comments,
            likesCount: post.num_likes,
        }

    } catch (error: any) {
        // getPost já lida com 401 e erros genéricos via unipileFetch
        // Mas podemos adicionar contexto extra aqui se necessário
        if (error.message.includes('404')) {
            throw new Error('Post não encontrado. Verifique se o post ainda existe e está público.')
        }
        throw error
    }
}
