import {
    pgTable, uuid, timestamp, boolean
, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

// Contas LinkedIn conectadas via Unipile
// Um usuário pode ter múltiplas contas LinkedIn
export const linkedinAccounts = pgTable('linkedin_accounts', {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Dados do Unipile
    unipileAccountId: varchar('unipile_account_id', { length: 255 }).notNull().unique(),
    unipileDsn: varchar('unipile_dsn', { length: 255 }).notNull(),

    // Dados da conta LinkedIn
    linkedinId: varchar('linkedin_id', { length: 255 }),
    linkedinSlug: varchar('linkedin_slug', { length: 255 }),   // ex: joaosilva
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    avatarUrl: varchar('avatar_url', { length: 2048 }),
    headline: varchar('headline', { length: 500 }),

    // Status da conexão
    status: varchar('status', { length: 50 }).default('ok').notNull(),
    // 'ok' | 'reconnect_required' | 'credentials_invalid'

    isDefault: boolean('is_default').default(false).notNull(),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type LinkedinAccount = typeof linkedinAccounts.$inferSelect
export type NewLinkedinAccount = typeof linkedinAccounts.$inferInsert
