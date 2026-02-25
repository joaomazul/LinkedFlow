import { unipileFetch } from '@/lib/unipile/client'
import type { UnipileComment } from '@/types/unipile.types'

/**
 * Busca novos comentários de um post do LinkedIn.
 * Tenta usar paginação ou filtro se disponível, caso contrário filtra manualmente.
 */

interface RawComment {
    id: string
    text: string
    author: {
        id: string
        name: string
        headline?: string
        profileUrl?: string
        avatarUrl?: string
    }
    createdAt: string
}

export async function fetchNewComments(
    linkedinPostId: string,
    accountId: string,
    sinceCommentId?: string | null,
    limit = 100
): Promise<RawComment[]> {
    try {
        // Busca comentários via Unipile
        // Nota: Estamos usando unipileFetch diretamente para suportar parâmetros extras se necessário
        const url = `/linkedin/posts/${encodeURIComponent(linkedinPostId)}/comments?account_id=${accountId}&limit=${limit}`

        const response = await unipileFetch<{ items: UnipileComment[] }>(url)
        const items = response.items || []

        // Unipile geralmente retorna do mais antigo para o mais recente em comments
        // Se sinceCommentId for fornecido, pegamos apenas os que vieram DEPOIS dele
        let newItems = items
        if (sinceCommentId) {
            const lastIndex = items.findIndex(item => item.id === sinceCommentId)
            if (lastIndex !== -1) {
                newItems = items.slice(lastIndex + 1)
            }
        }

        return newItems.map(item => ({
            id: item.id,
            text: item.text,
            author: {
                id: item.author.id,
                name: item.author.name,
                // Detalhes extras podem não vir no UnipileComment básico, dependendo da versão da API
                // Mas o tipo UnipileComment no projeto atual é simples:
                // id, post_id, text, author { id, name }, created_at
            },
            createdAt: item.created_at
        }))
    } catch (error: any) {
        if (error.message.includes('404')) {
            console.warn(`[poll-comments] Post ${linkedinPostId} não encontrado — pode ter sido deletado`)
            return []
        }
        throw error
    }
}
