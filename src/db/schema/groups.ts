import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const profileGroups = pgTable('profile_groups', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    color: varchar('color', { length: 7 }), // Hex color for the group

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('pg_user_id_idx').on(table.userId),
}))

export type ProfileGroup = typeof profileGroups.$inferSelect
export type NewProfileGroup = typeof profileGroups.$inferInsert
