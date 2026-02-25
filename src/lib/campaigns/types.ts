// Todos os tipos para a feature de campaigns
// Importe desta pasta — não crie tipos duplicados em outros lugares

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'
export type CaptureMode = 'any' | 'keyword'
export type LeadStatus = 'pending' | 'approved' | 'executing' | 'completed' | 'skipped' | 'error'
export type ActionType = 'like' | 'reply' | 'dm' | 'invite'
export type ActionStatus = 'queued' | 'executing' | 'done' | 'failed' | 'skipped'

export interface Campaign {
    id: string
    userId: string
    name: string
    status: CampaignStatus
    postUrl: string
    linkedinPostId: string | null
    postTextSnapshot: string | null
    postAuthorName: string | null
    postAuthorId: string | null
    captureMode: CaptureMode
    keywords: string[]
    actionLike: boolean
    actionReply: boolean
    actionDm: boolean
    actionInvite: boolean
    leadMagnetUrl: string | null
    leadMagnetLabel: string
    replyTemplate: string | null
    dmTemplate: string | null
    requireApproval: boolean
    windowDays: number
    // Delays em segundos
    delayLikeMin: number
    delayLikeMax: number
    delayReplyMin: number
    delayReplyMax: number
    delayDmMin: number
    delayDmMax: number
    // Controle de polling
    lastPolledAt: Date | null
    lastCommentId: string | null
    expiresAt: Date | null
    totalCaptured: number
    totalApproved: number
    totalCompleted: number
    createdAt: Date
    updatedAt: Date
}

export interface CampaignLead {
    id: string
    campaignId: string
    userId: string
    linkedinProfileId: string
    linkedinProfileUrl: string | null
    profileName: string
    profileHeadline: string | null
    profileAvatarUrl: string | null
    commentId: string
    commentText: string
    commentedAt: Date | null
    keywordMatched: string | null
    intentScore: number
    isConnection: boolean
    status: LeadStatus
    generatedReply: string | null
    generatedDm: string | null
    createdAt: Date
    updatedAt: Date
}

export interface CampaignAction {
    id: string
    campaignId: string
    leadId: string
    userId: string
    type: ActionType
    status: ActionStatus
    content: string | null
    contentFinal: string | null
    scheduledFor: Date
    executedAt: Date | null
    linkedinActionId: string | null
    errorMessage: string | null
    retryCount: number
}

// Payload para criação de campaign
export interface CreateCampaignInput {
    name: string
    postUrl: string
    captureMode: CaptureMode
    keywords?: string[]
    actionLike?: boolean
    actionReply?: boolean
    actionDm?: boolean
    actionInvite?: boolean
    leadMagnetUrl?: string
    leadMagnetLabel?: string
    replyTemplate?: string
    dmTemplate?: string
    requireApproval?: boolean
    windowDays?: number
}
