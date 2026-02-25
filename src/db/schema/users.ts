import {
    pgTable, uuid, text, timestamp, boolean, integer
, varchar } from 'drizzle-orm/pg-core'

// Tabela preparada para autenticação futura (Clerk/NextAuth)
// Por ora, o app usa um único "usuário padrão" criado no seed
// Quando autenticação for adicionada, esta tabela já está pronta
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Auth fields (opcionais agora, obrigatórios com autenticação)
    clerkId: text('clerk_id').unique(),         // para integração futura com Clerk
    email: text('email').unique(),
    name: varchar('name', { length: 255 }),
    avatarUrl: varchar('avatar_url', { length: 2048 }),

    // Preferências de UI (não são settings de negócio)
    sidebarCollapsed: boolean('sidebar_collapsed').default(false),
    theme: varchar('theme', { length: 20 }).default('dark'),
    language: varchar('language', { length: 10 }).default('pt-BR'),

    // Rate limiting de geração de IA
    aiGenerationsToday: integer('ai_generations_today').default(0),
    aiGenerationsResetAt: timestamp('ai_generations_reset_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
