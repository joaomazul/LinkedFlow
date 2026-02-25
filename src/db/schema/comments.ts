import {
    pgTable, uuid, text, timestamp, boolean, index
, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'
import { posts } from './posts'
import { monitoredProfiles } from './profiles'

// Todos os comentários gerados pela IA e/ou postados pelo usuário
// Inclui tanto rascunhos quanto comentários efetivamente publicados
export const comments = pgTable('comments', {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id').notNull().references(() => monitoredProfiles.id, { onDelete: 'cascade' }),

    // Conteúdo
    text: text('text').notNull(),

    // Classificação
    styleId: varchar('style_id', { length: 100 }).notNull(),
    // ex: 'positivo', 'valor', 'pergunta', 'manual', 'custom_1234'

    source: varchar('source', { length: 20 }).default('ai').notNull(),
    // 'ai' | 'manual' | 'ai_edited' (quando IA gerou mas usuário editou)

    // Estado da geração
    generatedOptions: text('generated_options').array(),
    // As 3 opções geradas — armazena para análise futura de qual opção os usuários preferem
    selectedOptionIndex: varchar('selected_option_index', { length: 10 }),
    // '0' | '1' | '2' — qual opção foi selecionada

    wasEdited: boolean('was_edited').default(false).notNull(),
    // Usuário editou o texto após selecionar a opção

    // Informações de postagem no LinkedIn
    status: varchar('status', { length: 30 }).default('draft').notNull(),
    // 'draft' | 'posted' | 'failed'

    linkedinCommentId: varchar('linkedin_comment_id', { length: 255 }),
    // ID retornado pelo Unipile após postagem bem-sucedida

    postedAt: timestamp('posted_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
    failReason: varchar('fail_reason', { length: 500 }),

    // Snapshot do post no momento do comentário (para histórico)
    postTextSnapshot: text('post_text_snapshot'),
    // Guarda as primeiras 150 chars do post — caso o post seja deletado

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('comments_user_id_idx').on(table.userId),
    postIdIdx: index('comments_post_id_idx').on(table.postId),
    statusIdx: index('comments_status_idx').on(table.userId, table.status),
    postedAtIdx: index('comments_posted_at_idx').on(table.postedAt),
    // Para o painel de histórico: comentários postados de um usuário, os mais recentes
    historyIdx: index('comments_history_idx').on(table.userId, table.status, table.postedAt),
}))

export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
