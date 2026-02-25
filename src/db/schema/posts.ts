import {
    pgTable, uuid, text, timestamp, boolean, integer,
    jsonb, index, uniqueIndex
    , varchar
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { monitoredProfiles } from './profiles'

// Cache de posts do LinkedIn
// Não é fonte de verdade (LinkedIn é), mas permite:
// - Exibir feed sem re-fetchar
// - Histórico de posts que já comentamos
// - Analytics futuros
export const posts = pgTable('posts', {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id').notNull().references(() => monitoredProfiles.id, { onDelete: 'cascade' }),

    // Identificador único do LinkedIn
    linkedinPostId: varchar('linkedin_post_id', { length: 255 }).notNull(),

    // Cache do autor (para exibição mesmo sem o perfil no store)
    authorName: varchar('author_name', { length: 255 }),
    authorHeadline: varchar('author_headline', { length: 500 }),
    authorAvatarUrl: varchar('author_avatar_url', { length: 2048 }),

    // Conteúdo
    text: text('text').notNull().default(''),
    htmlText: text('html_text'),
    imageUrls: jsonb('image_urls').$type<string[]>().default([]),
    videoUrl: varchar('video_url', { length: 2048 }),
    articleUrl: varchar('article_url', { length: 2048 }),
    articleTitle: varchar('article_title', { length: 500 }),
    postUrl: varchar('post_url', { length: 2048 }),

    // Métricas (snapshot no momento do fetch)
    likesCount: integer('likes_count').default(0).notNull(),
    commentsCount: integer('comments_count').default(0).notNull(),
    repostsCount: integer('reposts_count').default(0).notNull(),
    viewsCount: integer('views_count'),

    // Estado de comentário
    commentStatus: varchar('comment_status', { length: 50 }).default('idle').notNull(),
    // 'idle' | 'posted' | 'skipped'

    // Se o usuário ocultou este post do feed local
    isHidden: boolean('is_hidden').default(false).notNull(),

    // Data original do post no LinkedIn
    postedAt: timestamp('posted_at', { withTimezone: true }).notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('posts_user_id_idx').on(table.userId),
    profileIdIdx: index('posts_profile_id_idx').on(table.profileId),
    linkedinPostIdx: uniqueIndex('posts_linkedin_post_id_idx').on(table.linkedinPostId),
    postedAtIdx: index('posts_posted_at_idx').on(table.postedAt),
    statusIdx: index('posts_status_idx').on(table.userId, table.commentStatus),
    // Index composto para a query mais comum: feed de um usuário ordenado por data
    feedIdx: index('posts_feed_idx').on(table.userId, table.isHidden, table.postedAt),
}))

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

// ── FASE 2: Novos esquemas para Post Intelligence ───────────────────────────

export const generatedPosts = pgTable('generated_posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(), // Usando text para compatibilidade com Clerk se necessário, ou uuid conforme padrão

    // Origem da geração
    inputType: varchar('input_type', { length: 50 }).notNull().default('idea'),
    // 'idea' | 'article_url' | 'article_text' | 'topic' | 'recycled'
    inputContent: text('input_content').notNull(),
    inputUrl: varchar('input_url', { length: 2048 }),

    // Formato
    format: varchar('format', { length: 50 }).notNull(),
    // 'short' | 'storytelling' | 'carousel' | 'thread' | 'controversial' | 'lead_magnet_cta'

    // Configuração
    objective: varchar('objective', { length: 50 }).default('engagement'),
    icp: text('icp'),
    toneOverride: text('tone_override'),

    // Conteúdo
    title: text('title'),
    body: text('body').notNull(),
    hashtags: jsonb('hashtags').$type<string[]>().default([]),
    emojisEnabled: boolean('emojis_enabled').default(true),
    charCount: integer('char_count'),

    // Scoring
    scoreHook: integer('score_hook'),
    scoreDepth: integer('score_depth'),
    scoreClarity: integer('score_clarity'),
    scoreEngagementPrediction: integer('score_engagement_prediction'),
    scoreOverall: integer('score_overall'),
    scoreFeedback: text('score_feedback'),

    // Status
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    // 'draft' | 'scheduled' | 'published' | 'archived'
    scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    linkedinPostIdFromUnipile: varchar('linkedin_post_id', { length: 255 }),
    linkedinPostUrl: varchar('linkedin_post_url', { length: 2048 }),

    // Versões
    version: integer('version').default(1),
    parentId: uuid('parent_id'),

    // Metadados
    brandVoiceSnapshot: text('brand_voice_snapshot'),
    generationModel: varchar('generation_model', { length: 100 }),
    generationMs: integer('generation_ms'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('gen_posts_user_id_idx').on(table.userId),
    statusIdx: index('gen_posts_status_idx').on(table.status),
    createdAtIdx: index('gen_posts_user_created_idx').on(table.userId, table.createdAt),
}))

export const postTemplates = pgTable('post_templates', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id'), // null = template do sistema
    name: varchar('name', { length: 100 }).notNull(),
    format: varchar('format', { length: 50 }).notNull(),
    description: text('description'),
    systemPrompt: text('system_prompt').notNull(),
    userPromptTemplate: text('user_prompt_template').notNull(),
    exampleOutput: text('example_output'),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdx: index('post_tpl_user_idx').on(table.userId),
    formatIdx: index('post_tpl_format_idx').on(table.format),
}))

export const brandVoiceCache = pgTable('brand_voice_cache', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().unique(),

    writingStyle: text('writing_style'),
    toneAdjectives: jsonb('tone_adjectives').$type<string[]>().default([]),
    recurringTopics: jsonb('recurring_topics').$type<string[]>().default([]),
    avgPostLength: integer('avg_post_length'),
    usesEmojis: boolean('uses_emojis').default(false),
    usesHashtags: boolean('uses_hashtags').default(true),

    topPostsSample: jsonb('top_posts_sample').$type<Array<{ text: string, likes: number, comments: number }>>().default([]),

    postsAnalyzed: integer('posts_analyzed').default(0),
    lastAnalyzedAt: timestamp('last_analyzed_at', { withTimezone: true }),
    lastPostId: varchar('last_post_id', { length: 255 }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIndex: index('brand_voice_user_idx').on(table.userId),
}))

export type GeneratedPost = typeof generatedPosts.$inferSelect
export type PostTemplate = typeof postTemplates.$inferSelect
export type BrandVoiceCache = typeof brandVoiceCache.$inferSelect
