import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

export const crmPeople = pgTable('crm_people', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // LinkedIn Info
    linkedinProfileId: varchar('linkedin_profile_id', { length: 255 }).notNull(),
    linkedinUrl: varchar('linkedin_url', { length: 500 }),
    name: varchar('name', { length: 255 }).notNull(),
    headline: text('headline'),
    company: varchar('company', { length: 255 }),
    location: varchar('location', { length: 100 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),

    // CRM Metadata
    status: varchar('status', { length: 20 }).default('lead').notNull(), // lead | prospect | customer | partner
    priority: varchar('priority', { length: 10 }).default('medium').notNull(), // low | medium | high
    tags: varchar('tags', { length: 255 }).array(),

    // Interaction Summary
    interactionCount: integer('interaction_count').default(0).notNull(),
    lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }),

    // AI Brief
    aiBrief: text('ai_brief'),
    lastBriefAt: timestamp('last_brief_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userProfileIdx: uniqueIndex('crm_people_user_profile_idx').on(table.userId, table.linkedinProfileId),
    userIdIdx: index('crm_people_user_id_idx').on(table.userId),
    statusIdx: index('crm_people_status_idx').on(table.userId, table.status),
}))

export const crmInteractions = pgTable('crm_interactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    personId: uuid('person_id').notNull().references(() => crmPeople.id, { onDelete: 'cascade' }),

    type: varchar('type', { length: 50 }).notNull(), // message | comment | like | meeting | note
    source: varchar('source', { length: 50 }).default('manual').notNull(), // manual | campaign | feed
    sourceId: varchar('source_id', { length: 255 }), // ID do post/ID da msg no unipile/vincular com campaign_lead

    content: text('content'),
    sentiment: varchar('sentiment', { length: 20 }), // positive | neutral | negative

    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('crm_interactions_user_id_idx').on(table.userId),
    personIdIdx: index('crm_interactions_person_id_idx').on(table.personId),
}))
