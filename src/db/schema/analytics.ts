import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    integer,
    numeric,
    jsonb,
    index,
    uniqueIndex,
    date,
    varchar,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { generatedPosts } from './posts'

// ── ANALYTICS SNAPSHOTS ──────────────────────────────────────────────────
export const analyticsSnapshots = pgTable('analytics_snapshots', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    snapshotDate: date('snapshot_date').notNull(),
    snapshotType: varchar('snapshot_type', { length: 20 }).notNull(), // daily | weekly | monthly

    // Métricas de posts
    postsCreated: integer('posts_created').default(0),
    postsPublished: integer('posts_published').default(0),
    avgScoreHook: numeric('avg_score_hook', { precision: 5, scale: 2 }),
    avgScoreOverall: numeric('avg_score_overall', { precision: 5, scale: 2 }),
    bestFormat: varchar('best_format', { length: 50 }),
    bestHour: integer('best_hour'),
    bestWeekday: integer('best_weekday'),

    // Métricas de campanhas
    campaignsActive: integer('campaigns_active').default(0),
    leadsCaptured: integer('leads_captured').default(0),
    leadsApproved: integer('leads_approved').default(0),
    leadsCompleted: integer('leads_completed').default(0),
    actionsExecuted: integer('actions_executed').default(0),
    conversionRate: numeric('conversion_rate', { precision: 5, scale: 2 }),

    // Métricas do LinkedIn
    linkedinImpressions: integer('linkedin_impressions'),
    linkedinLikes: integer('linkedin_likes'),
    linkedinComments: integer('linkedin_comments'),
    linkedinShares: integer('linkedin_shares'),
    linkedinProfileViews: integer('linkedin_profile_views'),
    linkedinFollowers: integer('linkedin_followers'),

    payload: jsonb('payload').default({}),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userDateIdx: index('analytics_snapshots_user_date_idx').on(table.userId, table.snapshotDate),
    typeIdx: uniqueIndex('analytics_snapshots_type_idx').on(table.userId, table.snapshotType, table.snapshotDate),
}))

// ── POST PERFORMANCE ────────────────────────────────────────────────────────
export const postPerformance = pgTable('post_performance', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    generatedPostId: uuid('generated_post_id').references(() => generatedPosts.id, { onDelete: 'cascade' }),
    linkedinPostId: varchar('linkedin_post_id', { length: 255 }).notNull().unique(),

    // Métricas do LinkedIn
    impressions: integer('impressions').default(0),
    likes: integer('likes').default(0),
    comments: integer('comments').default(0),
    shares: integer('shares').default(0),
    clicks: integer('clicks').default(0),

    // Métricas calculadas
    engagementRate: numeric('engagement_rate', { precision: 6, scale: 3 }),

    // Correlação com score predito
    predictedScore: integer('predicted_score'),
    scoreAccuracy: numeric('score_accuracy', { precision: 5, scale: 2 }),

    // Snapshot do post
    format: varchar('format', { length: 50 }),
    objective: varchar('objective', { length: 50 }),
    charCount: integer('char_count'),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    // Controle
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    syncCount: integer('sync_count').default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userPublishedIdx: index('post_perf_user_published_idx').on(table.userId, table.publishedAt),
    formatIdx: index('post_perf_format_idx').on(table.userId, table.format),
}))

// ── ENGAGEMENT INSIGHTS ─────────────────────────────────────────────────────
export const engagementInsights = pgTable('engagement_insights', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    insightType: varchar('insight_type', { length: 50 }).notNull(), // best_time | best_format | topic_suggestion | warning | milestone
    title: text('title').notNull(),
    body: text('body').notNull(),
    data: jsonb('data').default({}),
    isRead: boolean('is_read').default(false),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userCreatedIdx: index('eng_insights_user_created_idx').on(table.userId, table.createdAt),
    unreadIdx: index('eng_insights_unread_idx').on(table.userId, table.isRead),
}))

export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect
export type PostPerformance = typeof postPerformance.$inferSelect
export type EngagementInsight = typeof engagementInsights.$inferSelect
