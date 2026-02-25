import { unipileFetch } from './client'
import type { ListConnectionsResponse, UnipileConnection } from '@/types/unipile.types'

export async function getConnections(
    accountId: string,
    cursor?: string
): Promise<ListConnectionsResponse> {
    const params = new URLSearchParams({ account_id: accountId, limit: '50' })
    if (cursor) params.set('cursor', cursor)
    return unipileFetch<ListConnectionsResponse>(`/linkedin/connections?${params}`)
}

export async function searchConnections(
    accountId: string,
    query: string
): Promise<UnipileConnection[]> {
    const params = new URLSearchParams({ account_id: accountId, q: query })
    const res = await unipileFetch<ListConnectionsResponse>(
        `/linkedin/connections?${params}`
    )
    return res.items
}
