import { unipileFetch } from '@/lib/unipile/client'

/**
 * Verifica se um perfil é conexão de 1º grau.
 * Unipile retorna 'FIRST_DEGREE' no campo network_distance se for conexão.
 */
export async function isFirstDegreeConnection(
    profileId: string,
    accountId: string
): Promise<boolean> {
    try {
        const url = `/users/${encodeURIComponent(profileId)}?account_id=${accountId}`
        const data = await unipileFetch<any>(url)

        // Unipile network_distance: 'FIRST_DEGREE', 'SECOND_DEGREE', 'THIRD_DEGREE', 'OUT_OF_NETWORK'
        const distance = data?.network_distance
        const isConnection = data?.is_connection // Alguns endpoints retornam boolean direto
        const relation = data?.relation // Outro possível campo dependendo do provider

        return distance === 'FIRST_DEGREE' || isConnection === true || relation === 'connection'
    } catch (error) {
        console.error(`[check-connection] Erro ao verificar conexão para ${profileId}:`, error)
        return false // Fallback seguro
    }
}
