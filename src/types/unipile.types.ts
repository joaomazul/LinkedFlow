// ── Accounts ──────────────────────────────────────────
export interface UnipileAccount {
    id: string
    provider: 'LINKEDIN' | 'TWITTER' | 'INSTAGRAM' | 'FACEBOOK'
    name: string
    username?: string
    status: 'OK' | 'CREDENTIALS_INVALID' | 'RECONNECT_REQUIRED'
    created_at: string
}

export interface ListAccountsResponse {
    items: UnipileAccount[]
    cursor?: string
}

// ── Profiles ──────────────────────────────────────────
export interface UnipileLinkedInProfile {
    id: string
    public_identifier: string  // slug do LinkedIn (ex: joaosilva)
    first_name: string
    last_name: string
    headline?: string
    summary?: string
    profile_picture_url?: string
    follower_count?: number
    connection_count?: number
    current_positions?: UnipilePosition[]
}

export interface UnipilePosition {
    title: string
    company_name: string
    start_date?: string
    end_date?: string
    is_current: boolean
}

// ── Posts / Feed ──────────────────────────────────────
export interface UnipilePost {
    id: string
    author: {
        id: string
        name: string
        headline?: string
        profile_picture_url?: string
    }
    text: string
    created_at: string
    num_likes: number
    num_comments: number
    num_reposts?: number
    num_views?: number
    media?: UnipilePostMedia[]
    article?: {
        title: string
        url: string
        thumbnail_url?: string
    }
    post_url?: string
}

export interface UnipilePostMedia {
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
    url: string
    thumbnail_url?: string
}

export interface UnipileFeedResponse {
    items: UnipilePost[]
    cursor?: string
}

// ── Comments ──────────────────────────────────────────
export interface UnipileComment {
    id: string
    post_id: string
    text: string
    author: {
        id: string
        name: string
    }
    created_at: string
}

export interface PostCommentPayload {
    account_id: string
    text: string
}

export interface PostCommentResponse {
    id: string               // ID do comentário criado
    post_id: string
    created_at: string
}

// ── Connections (futuro) ──────────────────────────────
export interface UnipileConnection {
    id: string
    provider_id: string
    name: string
    headline?: string
    profile_picture_url?: string
    connected_at: string
}

export interface ListConnectionsResponse {
    items: UnipileConnection[]
    cursor?: string
    total?: number
}

// ── Messages (futuro) ─────────────────────────────────
export interface UnipileConversation {
    id: string
    participants: UnipileParticipant[]
    last_message?: UnipileMessage
    unread_count: number
    created_at: string
    updated_at: string
}

export interface UnipileParticipant {
    id: string
    name: string
    profile_picture_url?: string
}

export interface UnipileMessage {
    id: string
    conversation_id: string
    sender_id: string
    text: string
    created_at: string
    is_read: boolean
}

// ── Webhooks (futuro) ─────────────────────────────────
export type UnipileWebhookEvent =
    | 'new_message'
    | 'new_connection'
    | 'post_reaction'
    | 'comment_on_post'
    | 'connection_request'

export interface UnipileWebhookPayload {
    event: UnipileWebhookEvent
    account_id: string
    data: Record<string, unknown>   // varia por tipo de evento
    received_at: string
}

// ── Erros ─────────────────────────────────────────────
export interface UnipileApiError {
    status: number
    message: string
    code?: string
}
