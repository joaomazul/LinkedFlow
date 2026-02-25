import {
    pgTable, uuid, text, timestamp, index
, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

// Configuração de persona da IA por usuário
// Cada usuário tem uma persona principal + histórico de versões
export const personas = pgTable('personas', {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Metadados
    name: varchar('name', { length: 100 }).default('Minha Persona').notNull(),
    // Permite múltiplas personas no futuro

    isActive: varchar('is_active', { length: 10 }).default('true').notNull(),
    // 'true' | 'false' — somente uma pode ser ativa por vez

    // Campos da persona (todos opcionais — usuário preenche progressivamente)
    personaName: varchar('persona_name', { length: 255 }),
    role: varchar('role', { length: 255 }),
    company: varchar('company', { length: 255 }),
    niche: varchar('niche', { length: 500 }),
    tone: varchar('tone', { length: 500 }),
    goals: text('goals'),
    avoid: text('avoid'),
    customPrompt: text('custom_prompt'),

    // Cache do prompt compilado (gerado por buildPersonaPrompt)
    // Evita recomputar em cada geração
    compiledPrompt: text('compiled_prompt'),
    compiledAt: timestamp('compiled_at', { withTimezone: true }),

    // Versioning simples: guarda a versão anterior para possível rollback
    previousCompiledPrompt: text('previous_compiled_prompt'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('personas_user_id_idx').on(table.userId),
    activeIdx: index('personas_active_idx').on(table.userId, table.isActive),
}))

export type Persona = typeof personas.$inferSelect
export type NewPersona = typeof personas.$inferInsert
