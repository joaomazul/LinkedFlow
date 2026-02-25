"use client";

import { useQuery } from '@tanstack/react-query'

import type { ApiResponse } from '@/lib/utils/api-response'
import type { Post } from '@/db/schema/posts'

async function fetchFeed(): Promise<Post[]> {
    const res = await fetch(`/api/linkedin/feed`)
    const json: ApiResponse<{ items: Post[]; message?: string }> = await res.json()
    if (!json.ok) throw new Error(json.error?.message || 'Erro ao buscar feed')
    return json.data?.items ?? []
}

export function useFeed() {
    return useQuery({
        queryKey: ['feed'],
        queryFn: fetchFeed,
        staleTime: 1000 * 60 * 5,    // 5 minutos
        refetchInterval: 1000 * 60 * 10, // refetch a cada 10 min
    })
}
