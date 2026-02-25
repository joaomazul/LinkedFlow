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
            const res = await fetch(`/api/linkedin/posts/${encodeURIComponent(linkedinPostId)}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, styleId }),
            })

            const data = await res.json()

            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? `Erro ${res.status}`)
            }

            return data.data
        },

        onSuccess: (_, variables) => {
            toast.success('Comentário publicado no LinkedIn!')
            // Invalida histórico para atualizar o painel direito
            queryClient.invalidateQueries({ queryKey: ['comments-history'] })
        },

        onError: (err) => {
            toast.error(err.message || 'Erro ao publicar. Tente novamente.')
        },
    })
}
