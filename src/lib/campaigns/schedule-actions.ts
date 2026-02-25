import type { Campaign } from './types'

export type ActionType = 'like' | 'reply' | 'dm' | 'invite'

interface ScheduledAction {
    type: ActionType
    scheduledFor: Date
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Calcula os horários de execução para as ações de um lead.
 * Adiciona offsets aleatórios baseados na configuração da campanha.
 */
export function scheduleLeadsActions(
    campaign: Campaign,
    baseDate: Date = new Date()
): ScheduledAction[] {
    const actions: ScheduledAction[] = []
    let lastActionTime = baseDate.getTime()

    // 1. LIKE (Geralmente a primeira ação)
    if (campaign.actionLike) {
        const delay = getRandomInt(campaign.delayLikeMin || 30, campaign.delayLikeMax || 120)
        const scheduledFor = new Date(lastActionTime + delay * 1000)
        actions.push({ type: 'like', scheduledFor })
        // Opcional: não atualizar lastActionTime para permitir Reply/DM em paralelo ou pouco depois do Like
    }

    // 2. REPLY
    if (campaign.actionReply) {
        const delay = getRandomInt(campaign.delayReplyMin || 60, campaign.delayReplyMax || 300)
        const scheduledFor = new Date(lastActionTime + delay * 1000)
        actions.push({ type: 'reply', scheduledFor })
        lastActionTime = scheduledFor.getTime()
    }

    // 3. DM
    if (campaign.actionDm) {
        const delay = getRandomInt(campaign.delayDmMin || 300, campaign.delayDmMax || 1800)
        const scheduledFor = new Date(lastActionTime + delay * 1000)
        actions.push({ type: 'dm', scheduledFor })
        lastActionTime = scheduledFor.getTime()
    }

    // 4. INVITE (Futuro)
    if (campaign.actionInvite) {
        const delay = getRandomInt(3600, 7200) // 1-2 horas depois
        actions.push({ type: 'invite', scheduledFor: new Date(lastActionTime + delay * 1000) })
    }

    return actions
}
