import { useQuery } from '@tanstack/react-query'
import type { UnipileAccount } from '@/types/unipile.types'
import type { ApiResponse } from '@/lib/utils/api-response'

async function fetchAccounts(): Promise<UnipileAccount[]> {
    const res = await fetch('/api/linkedin/accounts')
    const json: ApiResponse<UnipileAccount[]> = await res.json()
    if (!json.ok) throw new Error(json.error.message)
    return json.data
}

export function useAccounts() {
    return useQuery({
        queryKey: ['linkedin-accounts'],
        queryFn: fetchAccounts,
        staleTime: 1000 * 60 * 60, // 1 hora — contas mudam raramente
    })
}
