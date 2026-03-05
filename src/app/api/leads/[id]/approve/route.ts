import { getAuthenticatedUserId } from '@/lib/auth/user'
import { db } from '@/db'
import { campaignLeads, campaigns, campaignActions } from '@/db/schema/campaigns'
import { eq, and, sql } from 'drizzle-orm'
import { success, apiError } from '@/lib/utils/api-response'
import { scheduleLeadsActions } from '@/lib/campaigns/schedule-actions'
import { createLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const log = createLogger('api/leads/approve')

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getAuthenticatedUserId()
        const { id: leadId } = await params
        log.info({ userId, leadId }, '[leads] Approve started')

        // 1. Buscar o lead e a campanha
        const [lead] = await db
            .select()
            .from(campaignLeads)
            .where(and(eq(campaignLeads.id, leadId), eq(campaignLeads.userId, userId)))
            .limit(1)

        if (!lead) {
            log.warn({ userId, leadId }, '[leads] Lead not found')
            return apiError('Lead não encontrado', 404)
        }
        if (lead.status !== 'pending') {
            log.warn({ userId, leadId, status: lead.status }, '[leads] Lead already processed')
            return apiError('Lead já processado', 400)
        }

        const [campaign] = await db
            .select()
            .from(campaigns)
            .where(eq(campaigns.id, lead.campaignId))
            .limit(1)

        if (!campaign) {
            log.warn({ userId, campaignId: lead.campaignId }, '[leads] Campaign not found')
            return apiError('Campanha não encontrada', 404)
        }

        // 2. Agendar ações
        const scheduled = scheduleLeadsActions(campaign as any)
        log.info({ leadId, campaignId: campaign.id, actions: scheduled.length }, '[leads] Actions scheduled')

        // 3. Salvar ações e atualizar status em transação atômica
        const actionInserts = scheduled.map(action => ({
            campaignId: campaign.id,
            leadId: lead.id,
            userId: userId,
            type: action.type,
            status: 'queued' as const,
            content: action.type === 'reply' ? lead.generatedReply : (action.type === 'dm' ? lead.generatedDm : null),
            contentFinal: action.type === 'reply' ? lead.generatedReply : (action.type === 'dm' ? lead.generatedDm : null),
            scheduledFor: action.scheduledFor
        }))

        await db.transaction(async (tx) => {
            if (actionInserts.length > 0) {
                await tx.insert(campaignActions).values(actionInserts)
            }

            await tx.update(campaignLeads)
                .set({ status: 'approved', approvedAt: new Date(), updatedAt: new Date() })
                .where(eq(campaignLeads.id, lead.id))

            await tx.update(campaigns)
                .set({
                    totalApproved: sql`${campaigns.totalApproved} + 1`,
                    updatedAt: new Date()
                })
                .where(eq(campaigns.id, campaign.id))
        })

        log.info({ userId, leadId, actionsScheduled: actionInserts.length }, '[leads] Approve complete')
        return success({ status: 'approved', actionsScheduled: actionInserts.length })

    } catch (err: any) {
        log.error({ err: err.message }, '[leads] Approve FAILED')
        return apiError(err.message || 'Erro ao aprovar lead', 500)
    }
}
