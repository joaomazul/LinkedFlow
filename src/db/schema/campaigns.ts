import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    integer,
    jsonb,
    index,
    varchar,
    unique,
} from 'drizzle-orm/pg-core'
import { users } from './users'

// ── CAMPAIGNS ──────────────────────────────────────────────────────────────
export const campaigns = pgTable('campaigns', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    name: varchar('name', { length: 255 }).notNull(),
    status: varchar('status', { length: 20 }).default('draft').notNull(), // draft | active | paused | completed

    // Post monitorado
    postUrl: text('post_url').notNull(),
    linkedinPostId: varchar('linkedin_post_id', { length: 255 }),
    postTextSnapshot: text('post_text_snapshot'),
    postAuthorName: varchar('post_author_name', { length: 255 }),
    postAuthorId: varchar('post_author_id', { length: 255 }),

    // Configuração de captura
    captureMode: varchar('capture_mode', { length: 20 }).default('any').notNull(), // any | keyword
    keywords: jsonb('keywords').default([]),

    // Ações habilitadas
    actionLike: boolean('action_like').default(true).notNull(),
    actionReply: boolean('action_reply').default(false).notNull(),
    actionDm: boolean('action_dm').default(true).notNull(),
    actionInvite: boolean('action_invite').default(false).notNull(),

    // Lead magnet
    leadMagnetUrl: text('lead_magnet_url'),
    leadMagnetLabel: varchar('lead_magnet_label', { length: 100 }).default('Acesse aqui'),

    // Templates (opcional — se null, IA gera do zero)
    replyTemplate: text('reply_template'),
    dmTemplate: text('dm_template'),

    // Execução
    requireApproval: boolean('require_approval').default(true).notNull(),
    windowDays: integer('window_days').default(7).notNull(),

    // Delays (em segundos)
    delayLikeMin: integer('delay_like_min').default(30),
    delayLikeMax: integer('delay_like_max').default(120),
    delayReplyMin: integer('delay_reply_min').default(120),
    delayReplyMax: integer('delay_reply_max').default(600),
    delayDmMin: integer('delay_dm_min').default(600),
    delayDmMax: integer('delay_dm_max').default(2700),

    // Controle de polling
    lastPolledAt: timestamp('last_polled_at', { withTimezone: true }),
    lastCommentId: varchar('last_comment_id', { length: 255 }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),

    // Métricas (cache para dashboard rápido)
    totalCaptured: integer('total_captured').default(0),
    totalApproved: integer('total_approved').default(0),
    totalCompleted: integer('total_completed').default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    user_id_idx: index('campaigns_user_id_idx').on(table.userId),
    status_idx: index('campaigns_status_idx').on(table.status),
    linkedin_post_id_idx: index('campaigns_linkedin_post_id_idx').on(table.linkedinPostId),
    expires_at_idx: index('campaigns_expires_at_idx').on(table.expiresAt),
}))

// ── CAMPAIGN LEADS ─────────────────────────────────────────────────────────
export const campaignLeads = pgTable('campaign_leads', {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Identificação do lead
    linkedinProfileId: varchar('linkedin_profile_id', { length: 255 }).notNull(),
    linkedinProfileUrl: text('linkedin_profile_url'),
    profileName: varchar('profile_name', { length: 255 }).notNull(),
    profileHeadline: varchar('profile_headline', { length: 500 }),
    profileAvatarUrl: text('profile_avatar_url'),

    // Comentário capturado
    commentId: varchar('comment_id', { length: 255 }).notNull(),
    commentText: text('comment_text').notNull(),
    commentedAt: timestamp('commented_at', { withTimezone: true }),

    // Classificação
    keywordMatched: varchar('keyword_matched', { length: 255 }),
    intentScore: integer('intent_score').default(50),
    isConnection: boolean('is_connection').default(false),

    // Status do fluxo
    status: varchar('status', { length: 20 }).default('pending').notNull(), // pending | approved | executing | completed | skipped | error

    // Conteúdo gerado pela IA (editável antes de aprovar)
    generatedReply: text('generated_reply'),
    generatedDm: text('generated_dm'),

    // Metadados
    skippedReason: text('skipped_reason'),
    errorMessage: text('error_message'),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    campaign_id_idx: index('leads_campaign_id_idx').on(table.campaignId),
    user_id_idx: index('leads_user_id_idx').on(table.userId),
    status_idx: index('leads_status_idx').on(table.status),
    unique_lead: unique('leads_campaign_profile_unique').on(table.campaignId, table.linkedinProfileId),
}))

// ── CAMPAIGN ACTIONS ───────────────────────────────────────────────────────
export const campaignActions = pgTable('campaign_actions', {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
    leadId: uuid('lead_id').notNull().references(() => campaignLeads.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Tipo e status
    type: varchar('type', { length: 20 }).notNull(), // like | reply | dm | invite
    status: varchar('status', { length: 20 }).default('queued').notNull(), // queued | executing | done | failed | skipped

    // Conteúdo
    content: text('content'),
    contentFinal: text('content_final'),

    // Scheduling
    scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
    executedAt: timestamp('executed_at', { withTimezone: true }),

    // Resultado
    linkedinActionId: varchar('linkedin_action_id', { length: 255 }),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    queued_idx: index('actions_queued_idx').on(table.status, table.scheduledFor),
    lead_id_idx: index('actions_lead_id_idx').on(table.leadId),
}))

// ── CAMPAIGN EVENTS ────────────────────────────────────────────────────────
export const campaignEvents = pgTable('campaign_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
    leadId: uuid('lead_id').references(() => campaignLeads.id, { onDelete: 'set null' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    eventType: varchar('event_type', { length: 50 }).notNull(),
    payload: jsonb('payload').default({}),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    campaign_id_idx: index('events_campaign_id_idx').on(table.campaignId),
    created_at_idx: index('events_created_at_idx').on(table.createdAt),
}))

export type Campaign = typeof campaigns.$inferSelect
export type CampaignLead = typeof campaignLeads.$inferSelect
export type CampaignAction = typeof campaignActions.$inferSelect
export type CampaignEvent = typeof campaignEvents.$inferSelect
