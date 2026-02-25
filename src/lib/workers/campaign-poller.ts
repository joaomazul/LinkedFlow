import { db } from '@/db'
import { campaigns, campaignLeads, campaignEvents } from '@/db/schema/campaigns'
import { appSettings, personas } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { fetchNewComments } from '@/lib/campaigns/poll-comments'
import { filterComment, calculateIntentScore } from '@/lib/campaigns/filter-comments'
import { generateCampaignContent } from '@/lib/campaigns/generate-content'
import { isFirstDegreeConnection } from '@/lib/campaigns/check-connection'
import { createLogger } from '@/lib/logger'

const log = createLogger('workers/campaign-poller')

export async function runCampaignPoller() {
    log.info('Iniciando ciclo de polling de campanhas')

    // 1. Buscar campanhas ativas que não expiraram
    const activeCampaigns = await db
        .select()
        .from(campaigns)
        .where(
            and(
                eq(campaigns.status, 'active'),
                sql`${campaigns.expiresAt} > NOW()`
            )
        )

    log.info({ count: activeCampaigns.length }, 'Campanhas ativas encontradas')

    for (const campaign of activeCampaigns) {
        try {
            log.info({ campaignId: campaign.id, name: campaign.name }, 'Processando campanha')

            // Pegar conta ativa do usuário (settings)
            const [settings] = await db
                .select()
                .from(appSettings)
                .where(eq(appSettings.userId, campaign.userId))
                .limit(1)

            const accountId = settings?.activeLinkedinAccountId
            if (!accountId) {
                log.warn({ campaignId: campaign.id }, 'Usuário sem conta LinkedIn ativa configurada')
                continue
            }

            // 2. Buscar novos comentários
            const rawComments = await fetchNewComments(
                campaign.linkedinPostId!,
                accountId,
                campaign.lastCommentId
            )

            if (rawComments.length === 0) {
                log.info({ campaignId: campaign.id }, 'Nenhum comentário novo')
                continue
            }

            // 3. Processar cada comentário
            let capturedCount = 0
            let lastProcessedCommentId = campaign.lastCommentId

            // Pegar persona do usuário (Query extraída do loop de comentários)
            const [activePersona] = await db
                .select()
                .from(personas)
                .where(and(eq(personas.userId, campaign.userId), eq(personas.isActive, 'true')))
                .limit(1)

            const personaPrompt = activePersona?.compiledPrompt || activePersona?.customPrompt || null

            for (const raw of rawComments) {
                lastProcessedCommentId = raw.id

                // a. Filtro e Score
                const { shouldCapture, keywordMatched } = filterComment(
                    raw.text,
                    campaign.captureMode as any,
                    campaign.keywords
                )

                if (!shouldCapture) continue

                // b. Verificar se já é connection
                const isConnection = await isFirstDegreeConnection(raw.author.id, accountId)

                // c. Calcular Score
                const intentScore = calculateIntentScore(raw.text)

                // d. Gerar conteúdo via IA
                log.info({ lead: raw.author.name }, 'Gerando conteúdo IA para novo lead')

                const aiContent = await generateCampaignContent({
                    campaignName: campaign.name,
                    postText: campaign.postTextSnapshot || '',
                    commentText: raw.text,
                    leadName: raw.author.name,
                    personaPrompt: personaPrompt,
                    replyTemplate: campaign.replyTemplate,
                    dmTemplate: campaign.dmTemplate,
                    leadMagnetUrl: campaign.leadMagnetUrl,
                    leadMagnetLabel: campaign.leadMagnetLabel
                })

                // e. Salvar Lead
                try {
                    await db.insert(campaignLeads).values({
                        campaignId: campaign.id,
                        userId: campaign.userId,
                        linkedinProfileId: raw.author.id,
                        linkedinProfileUrl: `https://www.linkedin.com/in/${raw.author.id}`, // Fallback
                        profileName: raw.author.name,
                        commentId: raw.id,
                        commentText: raw.text,
                        commentedAt: new Date(raw.createdAt),
                        keywordMatched,
                        intentScore,
                        isConnection,
                        status: campaign.requireApproval ? 'pending' : 'approved',
                        generatedReply: aiContent.reply,
                        generatedDm: aiContent.dm
                    })
                    capturedCount++
                } catch (dbErr: any) {
                    // Ignorar erro de UNIQUE (lead já capturado anteriormente)
                    if (dbErr.code === '23505' || dbErr.message?.includes('unique')) {
                        log.info({ leadId: raw.author.id }, 'Lead já existe no banco, pulando')
                    } else {
                        throw dbErr
                    }
                }
            }

            // 4. Atualizar metadados da campanha
            await db.update(campaigns)
                .set({
                    lastCommentId: lastProcessedCommentId,
                    lastPolledAt: new Date(),
                    totalCaptured: (campaign.totalCaptured || 0) + capturedCount,
                    updatedAt: new Date()
                })
                .where(eq(campaigns.id, campaign.id))

            log.info({ campaignId: campaign.id, capturedCount }, 'Campanha atualizada com sucesso')

        } catch (err: any) {
            log.error({ campaignId: campaign.id, err: err.message }, 'Erro ao processar polling da campanha')

            // Registrar evento de erro
            await db.insert(campaignEvents).values({
                campaignId: campaign.id,
                userId: campaign.userId,
                eventType: 'poll_error',
                payload: { message: err.message }
            })
        }
    }

    log.info('Ciclo de polling finalizado')
}
