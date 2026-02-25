import { db } from '@/db'
import { crmPeople, crmInteractions } from '@/db/schema/crm'
import { campaignLeads } from '@/db/schema/campaigns'
import { eq, and, sql } from 'drizzle-orm'
import { createLogger } from '@/lib/logger'

const log = createLogger('crm/sync-leads')

export async function syncLeadToCRM(leadId: string) {
    log.info({ leadId }, 'Sincronizando lead para o CRM')

    try {
        // 1. Buscar o lead da campanha
        const [lead] = await db
            .select()
            .from(campaignLeads)
            .where(eq(campaignLeads.id, leadId))
            .limit(1)

        if (!lead) {
            log.error({ leadId }, 'Lead não encontrado para sincronização')
            return
        }

        // 2. Upsert em crm_people
        const [person] = await db
            .insert(crmPeople)
            .values({
                userId: lead.userId,
                linkedinProfileId: lead.linkedinProfileId,
                linkedinUrl: lead.linkedinProfileUrl,
                name: lead.profileName,
                status: lead.status === 'completed' ? 'prospect' : 'lead',
                priority: lead.intentScore && lead.intentScore > 70 ? 'high' : 'medium',
                updatedAt: new Date()
            })
            .onConflictDoUpdate({
                target: [crmPeople.userId, crmPeople.linkedinProfileId],
                set: {
                    name: lead.profileName,
                    linkedinUrl: lead.linkedinProfileUrl,
                    status: lead.status === 'completed' ? 'prospect' : 'lead',
                    updatedAt: new Date()
                }
            })
            .returning()

        // 3. Registrar a interação (o comentário original ou ação da campanha)
        // Evitar duplicidade de interação baseada no comment_id ou campaign_action_id
        await db.insert(crmInteractions).values({
            userId: lead.userId,
            personId: person.id,
            type: 'comment',
            source: 'campaign',
            sourceId: lead.commentId,
            content: lead.commentText,
            occurredAt: lead.commentedAt || new Date()
        }).onConflictDoNothing()

        // 4. Atualizar contagem de interações
        const [counts] = await db.select({ count: sql`count(*)` }).from(crmInteractions).where(eq(crmInteractions.personId, person.id))
        const [lastInteraction] = await db.select({ date: crmInteractions.occurredAt }).from(crmInteractions).where(eq(crmInteractions.personId, person.id)).orderBy(sql`occurred_at desc`).limit(1)

        await db.update(crmPeople).set({
            interactionCount: Number((counts as any).count),
            lastInteractionAt: lastInteraction?.date
        }).where(eq(crmPeople.id, person.id))

        log.info({ personId: person.id }, 'Lead sincronizado com sucesso')

    } catch (error: any) {
        log.error({ leadId, err: error.message }, 'Erro ao sincronizar lead para o CRM')
    }
}
