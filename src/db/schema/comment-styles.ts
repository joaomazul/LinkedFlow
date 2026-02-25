import {
    pgTable, uuid, text, timestamp, boolean, integer, index, uniqueIndex
    , varchar
} from 'drizzle-orm/pg-core'
import { users } from './users'

// Estilos de comentário configuráveis por usuário
// Os defaults são inseridos no seed; o usuário pode editar/criar/reordenar
export const commentStyles = pgTable('comment_styles', {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Identificador estável (não muda ao editar label/prompt)
    styleKey: varchar('style_key', { length: 100 }).notNull(),
    // ex: 'positivo', 'valor', 'pergunta', 'custom_abc123'
    // Para estilos customizados: 'custom_' + uuid curto

    // Configuração visual e descritiva
    label: varchar('label', { length: 100 }).notNull(),
    icon: varchar('icon', { length: 10 }).notNull(),         // emoji: '👍'
    description: varchar('description', { length: 300 }).notNull(),

    // O prompt enviado à IA para este estilo
    prompt: text('prompt').notNull(),

    // Prompt padrão (para restaurar)
    defaultPrompt: text('default_prompt'),
    // null para estilos customizados (não têm default pré-definido)

    // Estado
    active: boolean('active').default(true).notNull(),
    displayOrder: integer('display_order').default(0).notNull(),
    isCustom: boolean('is_custom').default(false).notNull(),

    // Analytics simples
    usageCount: integer('usage_count').default(0).notNull(),
    // Incrementado cada vez que o usuário gera com este estilo
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('cs_user_id_idx').on(table.userId),
    orderIdx: index('cs_order_idx').on(table.userId, table.active, table.displayOrder),
    styleKeyIdx: uniqueIndex('cs_style_key_idx').on(table.userId, table.styleKey),
    userStyleUnique: uniqueIndex('cs_user_style_unique').on(table.userId, table.styleKey),
}))

export type CommentStyle = typeof commentStyles.$inferSelect
export type NewCommentStyle = typeof commentStyles.$inferInsert
