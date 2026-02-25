import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core'
import { users } from './users'
import { crmPeople } from './crm'
import { abmSignals } from './signals'

export const cadenceSettings = pgTable('cadence_settings', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),

    minDaysBetweenTouches: integer('min_days_between_touches').default(3).notNull(),
    autoSuggestEnabled: boolean('auto_suggest_enabled').default(true).notNull(),
    prioritizeBuyingSignals: boolean('prioritize_buying_signals').default(true).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const cadenceSuggestions = pgTable('cadence_suggestions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    personId: uuid('person_id').notNull().references(() => crmPeople.id, { onDelete: 'cascade' }),
    signalId: uuid('signal_id').references(() => abmSignals.id, { onDelete: 'set null' }),

    type: varchar('type', { length: 50 }).notNull(), // follow_up | ice_breaker | celebratory | re_engagement
    reason: text('reason').notNull(),
    suggestedContent: text('suggested_content'),
    urgencyScore: integer('urgency_score').default(0).notNull(),

    status: varchar('status', { length: 20 }).default('pending').notNull(), // pending | accepted | dismissed | executed

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('cadence_suggestions_user_id_idx').on(table.userId),
    personIdx: index('cadence_suggestions_person_idx').on(table.personId),
    statusIdx: index('cadence_suggestions_status_idx').on(table.userId, table.status),
}))
