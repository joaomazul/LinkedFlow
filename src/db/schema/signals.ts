import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core'
import { users } from './users'
import { monitoredProfiles } from './profiles'

export const abmTargets = pgTable('abm_targets', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id').notNull().references(() => monitoredProfiles.id, { onDelete: 'cascade' }),

    priority: varchar('priority', { length: 10 }).default('medium').notNull(), // high | medium | low
    notes: text('notes'),

    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('abm_targets_user_id_idx').on(table.userId),
    profileIdIdx: index('abm_targets_profile_id_idx').on(table.profileId),
}))

export const abmSignals = pgTable('abm_signals', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id').notNull().references(() => monitoredProfiles.id, { onDelete: 'cascade' }),
    targetId: uuid('target_id').references(() => abmTargets.id, { onDelete: 'set null' }),

    type: varchar('type', { length: 50 }).notNull(), // job_change | company_news | funding | specific_keyword
    title: text('title').notNull(),
    description: text('description'),
    url: varchar('url', { length: 500 }),

    isBuyingTrigger: boolean('is_buying_trigger').default(false).notNull(),
    relevanceScore: integer('relevance_score').default(0).notNull(),

    isRead: boolean('is_read').default(false).notNull(),
    processedInCadence: boolean('processed_in_cadence').default(false).notNull(),

    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('abm_signals_user_id_idx').on(table.userId),
    profileIdIdx: index('abm_signals_profile_id_idx').on(table.profileId),
    buyingTriggerIdx: index('abm_signals_buying_trigger_idx').on(table.userId, table.isBuyingTrigger),
}))
