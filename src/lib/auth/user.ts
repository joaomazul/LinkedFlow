import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, commentStyles, personas, appSettings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { env } from '@/env'
import { createLogger } from '@/lib/logger'

const log = createLogger('auth/user')

// Os 7 estilos padrão que todo usuário novo recebe
const DEFAULT_STYLES = [
    { key: 'positivo', label: 'Positivo', emoji: '😊', prompt: 'Escreva um comentário positivo, encorajador e genuíno. Destaque algo específico do post que você achou valioso. Seja autêntico e caloroso.' },
    { key: 'pergunta', label: 'Pergunta', emoji: '🤔', prompt: 'Escreva um comentário que faça uma pergunta perspicaz e relevante sobre o post. A pergunta deve demonstrar que você leu e entendeu o conteúdo, e deve gerar reflexão.' },
    { key: 'valor', label: 'Valor', emoji: '💡', prompt: 'Escreva um comentário que adicione valor real à discussão. Complemente com uma insight, dado, exemplo ou perspectiva adicional que enriqueça o que foi dito no post.' },
    { key: 'autoridade', label: 'Autoridade', emoji: '🎯', prompt: 'Escreva um comentário que demonstre expertise e autoridade no assunto. Use linguagem técnica quando apropriado, mas mantenha acessibilidade. Posicione-se como especialista.' },
    { key: 'provocativo', label: 'Provocativo', emoji: '🔥', prompt: 'Escreva um comentário que desafie respeitosamente algum ponto do post ou apresente uma perspectiva contrária bem fundamentada. Seja ousado mas construtivo.' },
    { key: 'storytelling', label: 'Storytelling', emoji: '📖', prompt: 'Escreva um comentário que conte uma micro-história ou experiência pessoal relevante ao tema do post. Use narrativa para criar conexão emocional.' },
    { key: 'cta', label: 'CTA', emoji: '🚀', prompt: 'Escreva um comentário com um call-to-action estratégico. Pode convidar para uma conversa no inbox, para baixar um recurso, ou para se conectar. Seja direto mas não agressivo.' },
]

export async function getAuthenticatedUserId(): Promise<string> {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        throw new Error('Não autenticado')
    }

    return findOrProvisionUser(clerkUserId)
}

export async function findOrProvisionUser(clerkUserId: string): Promise<string> {
    // 1. Tenta encontrar usuário existente
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkUserId))
        .limit(1)

    if (existing) {
        return existing.id
    }

    // 2. Usuário novo — busca dados do Clerk e provisiona
    log.info({ clerkUserId }, 'Novo usuário — provisionando')

    // Importa dinamicamente para não quebrar em ambientes sem Clerk
    const { currentUser } = await import('@clerk/nextjs/server')
    const clerkUser = await currentUser()

    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${clerkUserId}@unknown.com`
    const name = clerkUser?.fullName ?? clerkUser?.firstName ?? 'Usuário'
    const avatar = clerkUser?.imageUrl ?? null

    // 3. Cria tudo em uma transação para garantir consistência
    let newUserId: string

    try {
        // Insere o usuário (ON CONFLICT garante idempotência em race conditions)
        const [newUser] = await db
            .insert(users)
            .values({ clerkId: clerkUserId, email, name, avatarUrl: avatar })
            .onConflictDoUpdate({
                target: users.clerkId,
                set: { updatedAt: new Date() },
            })
            .returning({ id: users.id })

        newUserId = newUser.id

        // Verifica se os estilos já existem (idempotente)
        const existingStyles = await db
            .select({ id: commentStyles.id })
            .from(commentStyles)
            .where(eq(commentStyles.userId, newUserId))
            .limit(1)

        if (existingStyles.length === 0) {
            await db.insert(commentStyles).values(
                DEFAULT_STYLES.map((s, idx) => ({
                    userId: newUserId,
                    styleKey: s.key,
                    label: s.label,
                    icon: s.emoji,
                    description: s.label,
                    prompt: s.prompt,
                    active: true,
                    displayOrder: idx,
                }))
            ).onConflictDoNothing()
        }

        // Verifica se persona já existe
        const existingPersona = await db
            .select({ id: personas.id })
            .from(personas)
            .where(eq(personas.userId, newUserId))
            .limit(1)

        if (existingPersona.length === 0) {
            await db.insert(personas).values({
                userId: newUserId,
                isActive: 'true',
            }).onConflictDoNothing()
        }

        // Verifica se app_settings já existe
        const existingSettings = await db
            .select({ id: appSettings.id })
            .from(appSettings)
            .where(eq(appSettings.userId, newUserId))
            .limit(1)

        if (existingSettings.length === 0) {
            await db.insert(appSettings).values({
                userId: newUserId,
                activeLinkedinAccountId: env.UNIPILE_LINKEDIN_ACCOUNT_ID,
                autoRefreshEnabled: true,
                autoRefreshInterval: 1800,
            }).onConflictDoNothing()
        }

        log.info({ userId: newUserId, email }, 'Usuário provisionado com sucesso')
        return newUserId

    } catch (err) {
        log.error({ clerkUserId, err: (err as Error).message }, 'Erro no provisioning')

        // Se houve race condition e outro processo criou o usuário:
        const [retry] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, clerkUserId))
            .limit(1)

        if (retry) return retry.id
        throw err
    }
}
