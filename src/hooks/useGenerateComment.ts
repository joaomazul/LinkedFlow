"use client";

import { useMutation } from '@tanstack/react-query'

import { toast } from 'sonner'

interface GenerateParams {
    postText: string
    postAuthor: string
    styleId: string
}

interface GenerateResult {
    options: string[]
    style: { label: string; emoji: string }
}

export function useGenerateComment() {
    return useMutation<GenerateResult, Error, GenerateParams>({
        mutationFn: async (params) => {
            console.log('[useGenerateComment] Generating:', { style: params.styleId, author: params.postAuthor, textLen: params.postText.length })
            const t0 = performance.now()
            const res = await fetch('/api/ai/generate-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            })

            const data = await res.json()
            console.log('[useGenerateComment] Response:', { ok: data.ok, status: res.status, options: data.data?.options?.length ?? 0, ms: Math.round(performance.now() - t0) })

            if (!res.ok || !data.ok) {
                console.error('[useGenerateComment] Error:', data?.error)
                throw new Error(data?.error?.message ?? `Erro ${res.status}`)
            }

            return data.data
        },
        onError: (err) => {
            console.error('[useGenerateComment] Mutation error:', err.message)
            toast.error(err.message || 'Erro ao gerar comentário. Tente novamente.')
        },
    })
}
