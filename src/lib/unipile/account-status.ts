import { unipileFetch } from './client'
import { logger } from '@/lib/logger'

export async function checkAccountStatus(accountId: string) {
    try {
        const data = await unipileFetch<{ id: string; sources: Array<{ status: string }> }>(`/accounts/${accountId}`)
        if (!data || !data.sources || data.sources.length === 0) return 'UNKNOWN'

        // Retorna o status da primeira source (geralmente a conta principal)
        return data.sources[0].status // 'OK', 'DISCONNECTED', 'ERROR', 'PENDING'
    } catch (e: unknown) {
        if ((e as Error).message.includes('404')) return 'NOT_FOUND'
        logger.error({ accountId, err: e }, '[Unipile] Erro ao checar status da conta')
        return 'ERROR'
    }
}
