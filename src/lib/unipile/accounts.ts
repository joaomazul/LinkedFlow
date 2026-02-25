import { unipileFetch } from './client'
import type { ListAccountsResponse, UnipileAccount } from '@/types/unipile.types'

// Lista todas as contas conectadas ao Unipile (pode ter múltiplas contas LinkedIn)
export async function listAccounts(): Promise<UnipileAccount[]> {
    const res = await unipileFetch<ListAccountsResponse>('/accounts')
    // Filtra apenas contas LinkedIn
    return res.items.filter(a => a.provider === 'LINKEDIN')
}

export async function getAccount(accountId: string): Promise<UnipileAccount> {
    return unipileFetch<UnipileAccount>(`/accounts/${accountId}`)
}
