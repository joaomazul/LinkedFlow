import { unipileFetch } from '@/lib/unipile/client'
import { commentOnPost } from '@/lib/unipile/posts'
import { sendDirectMessage } from '@/lib/unipile/messages'
import type { ActionType } from './types'

interface ExecutionResult {
    success: boolean
    linkedinActionId?: string
    errorMessage?: string
}

export async function executeLinkedInAction(
    type: ActionType,
    accountId: string,
    targetId: string, // postId para like/reply, profileId para dm/invite
    content?: string | null
): Promise<ExecutionResult> {
    try {
        switch (type) {
            case 'like':
                const likeRes = await unipileFetch<any>(
                    `/linkedin/posts/${encodeURIComponent(targetId)}/reactions`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            account_id: accountId,
                            reaction: 'LIKE',
                        }),
                    }
                )
                return { success: true, linkedinActionId: likeRes.id }

            case 'reply':
                if (!content) throw new Error('Conteúdo obrigatório para resposta')
                const replyRes = await commentOnPost(targetId, {
                    account_id: accountId,
                    text: content,
                })
                return { success: true, linkedinActionId: replyRes.id }

            case 'dm':
                if (!content) throw new Error('Conteúdo obrigatório para DM')
                const dmRes = await sendDirectMessage(accountId, targetId, content)
                return { success: true, linkedinActionId: dmRes.id }

            case 'invite':
                const inviteRes = await unipileFetch<any>(
                    `/linkedin/invitations`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            account_id: accountId,
                            provider_id: targetId, // Unipile usa provider_id para invitations
                            message: content || undefined,
                        }),
                    }
                )
                return { success: true, linkedinActionId: inviteRes.id }

            default:
                return { success: false, errorMessage: `Tipo de ação desconhecido: ${type}` }
        }
    } catch (error: any) {
        console.error(`[execute-action] Erro ao executar ${type} no LinkedIn:`, error)
        return {
            success: false,
            errorMessage: error.message || 'Erro desconhecido na execução do LinkedIn'
        }
    }
}
