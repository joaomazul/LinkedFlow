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
            const res = await fetch('/api/ai/generate-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            })

            const data = await res.json()

            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? `Erro ${res.status}`)
            }

            return data.data
        },
        onError: (err) => {
            toast.error(err.message || 'Erro ao gerar comentário. Tente novamente.')
        },
    })
}
