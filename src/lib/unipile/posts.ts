import { unipileFetch } from './client'
import type {
    UnipilePost,
    UnipileComment,
    PostCommentPayload,
    PostCommentResponse,
} from '@/types/unipile.types'

export async function getPost(
    postId: string,
    accountId: string
): Promise<UnipilePost> {
    return unipileFetch<UnipilePost>(
        `/posts/${encodeURIComponent(postId)}?account_id=${accountId}`
    )
}

export async function commentOnPost(
    postId: string,
    payload: PostCommentPayload
): Promise<PostCommentResponse> {
    return unipileFetch<PostCommentResponse>(
        `/linkedin/posts/${postId}/comments`,
        {
            method: 'POST',
            body: JSON.stringify(payload),
        }
    )
}

export async function getPostComments(
    postId: string,
    accountId: string
): Promise<UnipileComment[]> {
    const res = await unipileFetch<{ items: UnipileComment[] }>(
        `/linkedin/posts/${postId}/comments?account_id=${accountId}`
    )
    return res.items
}

// Busca posts de um perfil ou organização específico
export async function getAccountPosts(
    accountId: string,
    identifier: string,
    limit: number = 5
): Promise<{ items: unknown[] }> {
    return unipileFetch<{ items: unknown[] }>(
        `/posts?account_id=${accountId}&identifier=${identifier}&limit=${limit}`
    )
}
// Publica um post (status) no LinkedIn
export async function publishLinkedInPost(
    accountId: string,
    text: string
): Promise<{ id: string }> {
    return unipileFetch<{ id: string }>(
        `/linkedin/posts`,
        {
            method: 'POST',
            body: JSON.stringify({
                account_id: accountId,
                text,
            }),
        }
    )
}
