"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

interface PostParams {
    linkedinPostId: string
    text: string
    styleId?: string
}

export function usePostComment() {
    const queryClient = useQueryClient()

    return useMutation<{ commentId: string; posted: boolean }, Error, PostParams>({
        mutationFn: async ({ linkedinPostId, text, styleId }) => {
            console.log('[usePostComment] Posting comment:', { linkedinPostId, textLen: text.length, styleId })
            const t0 = performance.now()
            const res = await fetch(`/api/linkedin/posts/${encodeURIComponent(linkedinPostId)}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, styleId }),
            })

            const data = await res.json()
            console.log('[usePostComment] Response:', { ok: data.ok, status: res.status, ms: Math.round(performance.now() - t0) })

            if (!res.ok || !data.ok) {
                console.error('[usePostComment] Error:', data?.error)
                throw new Error(data?.error?.message ?? `Erro ${res.status}`)
            }

            return data.data
        },

        onSuccess: (_, variables) => {
            console.log('[usePostComment] Posted OK for:', variables.linkedinPostId)
            toast.success('Comentário publicado no LinkedIn!')
            queryClient.invalidateQueries({ queryKey: ['comments-history'] })
        },

        onError: (err) => {
            console.error('[usePostComment] Mutation error:', err.message)
            toast.error(err.message || 'Erro ao publicar. Tente novamente.')
        },
    })
}
