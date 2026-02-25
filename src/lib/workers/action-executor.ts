import { db } from '@/db'
import { campaignActions, campaignLeads, campaignEvents } from '@/db/schema/campaigns'
import { appSettings } from '@/db/schema'
import { eq, and, sql, lte } from 'drizzle-orm'
import { executeLinkedInAction } from '@/lib/campaigns/execute-action'
import { syncLeadToCRM } from '@/lib/crm/sync-leads'
import { createLogger } from '@/lib/logger'

const log = createLogger('workers/action-executor')

const MAX_RETRIES = 3

export async function runActionExecutor() {
    log.info('Iniciando ciclo de execução de ações')

    // 1. Buscar ações na fila que já deveriam ter sido executadas
    const pendingActions = await db
        .select()
        .from(campaignActions)
        .where(
            and(
                eq(campaignActions.status, 'queued'),
                lte(campaignActions.scheduledFor, new Date())
            )
        )
        .limit(20) // Processa em lotes pequenos

    log.info({ count: pendingActions.length }, 'Ações pendentes encontradas')

    for (const action of pendingActions) {
        try {
            log.info({ actionId: action.id, type: action.type }, 'Executando ação')

            // a. Pegar conta ativa do usuário
            const [settings] = await db
                .select()
                .from(appSettings)
                .where(eq(appSettings.userId, action.userId))
                .limit(1)

            const accountId = settings?.activeLinkedinAccountId
            if (!accountId) {
                throw new Error('Conta LinkedIn ativa não configurada para este usuário')
            }

            // b. Pegar o targetId (postId para reply/like, profileId para dm)
            const [lead] = await db
                .select()
                .from(campaignLeads)
                .where(eq(campaignLeads.id, action.leadId))
                .limit(1)

            if (!lead) {
                throw new Error(`Lead ${action.leadId} não encontrado`)
            }

            const targetId = (action.type === 'like' || action.type === 'reply')
                ? lead.commentId // Para reply/like no comentário
                : lead.linkedinProfileId // Para DM

            // Marcar como executando para evitar duplicidade em execuções paralelas
            await db.update(campaignActions)
                .set({ status: 'executing', updatedAt: new Date() })
                .where(eq(campaignActions.id, action.id))

            // c. Executar no LinkedIn
            const result = await executeLinkedInAction(
                action.type as any,
                accountId,
                targetId,
                action.contentFinal || action.content
            )

            if (result.success) {
                log.info({ actionId: action.id }, 'Ação executada com sucesso')

                await db.update(campaignActions)
                    .set({
                        status: 'done',
                        linkedinActionId: result.linkedinActionId,
                        executedAt: new Date(),
                        updatedAt: new Date()
                    })
                    .where(eq(campaignActions.id, action.id))

                // Se for a última ação do lead, marcar lead como completed
                // (Lógica simplificada: se não houver mais ações queued para este lead)
                const [remaining] = await db
                    .select({ count: sql`count(*)` })
                    .from(campaignActions)
                    .where(and(eq(campaignActions.leadId, lead.id), eq(campaignActions.status, 'queued')))

                if (Number((remaining as any).count) === 0) {
                    await db.update(campaignLeads)
                        .set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() })
                        .where(eq(campaignLeads.id, lead.id))

                    // Sincronizar com o CRM
                    await syncLeadToCRM(lead.id)
                }

            } else {
                throw new Error(result.errorMessage || 'Falha na execução do LinkedIn')
            }

        } catch (err: any) {
            log.error({ actionId: action.id, err: err.message }, 'Erro ao executar ação')

            const newRetryCount = (action.retryCount || 0) + 1
            const shouldRetry = newRetryCount < MAX_RETRIES

            await db.update(campaignActions)
                .set({
                    status: shouldRetry ? 'queued' : 'failed',
                    retryCount: newRetryCount,
                    errorMessage: err.message,
                    // Backoff de 10 min * retryCount
                    scheduledFor: shouldRetry ? new Date(Date.now() + 600000 * newRetryCount) : action.scheduledFor,
                    updatedAt: new Date()
                })
                .where(eq(campaignActions.id, action.id))

            // Registrar evento
            await db.insert(campaignEvents).values({
                campaignId: action.campaignId,
                leadId: action.leadId,
                userId: action.userId,
                eventType: 'action_error',
                payload: { actionType: action.type, error: err.message, retry: shouldRetry }
            })
        }
    }

    log.info('Ciclo de execução finalizado')
}
