import {
    pgTable, uuid, timestamp, boolean, integer, index, uniqueIndex
    , varchar
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { profileGroups } from './groups'

// Perfis do LinkedIn que o usuário monitora
export const monitoredProfiles = pgTable('monitored_profiles', {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    groupId: uuid('group_id').references(() => profileGroups.id, { onDelete: 'set null' }),

    // Identificadores LinkedIn
    linkedinUrl: varchar('linkedin_url', { length: 2048 }).notNull(),
    linkedinId: varchar('linkedin_id', { length: 255 }),     // DEPRECATED: antigo provider_id ou slug
    linkedinSlug: varchar('linkedin_slug', { length: 255 }),   // DEPRECATED: antigo slug

    // Novos identificadores recomendados pelo flow Unipile
    linkedinProfileId: varchar('linkedin_profile_id', { length: 255 }), // provider_id: ACoAAA...
    publicIdentifier: varchar('public_identifier', { length: 255 }),  // slug: joao-silva

    // Dados do perfil (sincronizados do Unipile)
    name: varchar('name', { length: 255 }).notNull(),
    role: varchar('role', { length: 255 }).notNull().default(''),
    company: varchar('company', { length: 255 }),
    avatarUrl: varchar('avatar_url', { length: 2048 }),
    headline: varchar('headline', { length: 500 }),
    followerCount: integer('follower_count'),
    connectionCount: integer('connection_count'),

    // Visual no app
    color: varchar('color', { length: 7 }).notNull(),     // hex: #5b6ef5
    initials: varchar('initials', { length: 3 }).notNull(),

    // Estado
    active: boolean('active').default(true).notNull(),
    displayOrder: integer('display_order').default(0).notNull(),

    // Sync metadata
    lastFetchedAt: timestamp('last_fetched_at', { withTimezone: true }),
    lastPostAt: timestamp('last_post_at', { withTimezone: true }),
    newPostsCount: integer('new_posts_count').default(0).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('mp_user_id_idx').on(table.userId),
    linkedinIdIdx: index('mp_linkedin_id_idx').on(table.linkedinId),
    linkedinProfileIdIdx: index('mp_linkedin_profile_id_idx').on(table.linkedinProfileId),
    activeIdx: index('mp_active_idx').on(table.userId, table.active),
    userUrlUnique: uniqueIndex('mp_user_url_unique').on(table.userId, table.linkedinUrl),
}))

export type MonitoredProfile = typeof monitoredProfiles.$inferSelect
export type NewMonitoredProfile = typeof monitoredProfiles.$inferInsert
