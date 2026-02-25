import {
    pgTable, uuid, timestamp, boolean, integer
    , varchar
} from 'drizzle-orm/pg-core'
import { users } from './users'

// Configurações gerais do app por usuário
// One-to-one com users (um registro por usuário)
export const appSettings = pgTable('app_settings', {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id').notNull().unique()
        .references(() => users.id, { onDelete: 'cascade' }),

    // Conta LinkedIn ativa (unipile_account_id)
    activeLinkedinAccountId: varchar('active_linkedin_account_id', { length: 255 }),

    // Estilo default de comentário (styleKey)
    defaultStyleKey: varchar('default_style_key', { length: 100 }).default('positivo'),

    // Auto-refresh
    autoRefreshEnabled: boolean('auto_refresh_enabled').default(true).notNull(),
    autoRefreshInterval: integer('auto_refresh_interval').default(600),
    // segundos: 300=5min, 600=10min, 900=15min, 1800=30min, 3600=1h

    // Idioma da geração de comentários
    commentLanguage: varchar('comment_language', { length: 10 }).default('pt-BR').notNull(),

    // Timezone do usuário para analytics
    timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),

    // Quantidade de opções geradas pela IA por vez
    generationCount: integer('generation_count').default(3).notNull(),
    // 1 | 2 | 3 — padrão 3

    // Notificações (futuro)
    notifyNewPosts: boolean('notify_new_posts').default(false).notNull(),
    notifyOnReply: boolean('notify_on_reply').default(false).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type AppSettings = typeof appSettings.$inferSelect
export type NewAppSettings = typeof appSettings.$inferInsert
