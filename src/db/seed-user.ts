import { db } from './index'
import { commentStyles, personas, appSettings } from './schema'
import { DEFAULT_COMMENT_STYLES } from './default-styles'
import { env } from '@/env'

export async function seedUserDefaults(userId: string) {
    // Estilos de comentário
    for (const style of DEFAULT_COMMENT_STYLES) {
        await db
            .insert(commentStyles)
            .values({ userId, ...style, defaultPrompt: style.prompt, isCustom: false, active: true })
            .onConflictDoNothing()
    }

    // Persona vazia
    await db
        .insert(personas)
        .values({ userId, name: 'Minha Persona', isActive: 'true' })
        .onConflictDoNothing()

    // Settings padrão
    await db
        .insert(appSettings)
        .values({ userId, activeLinkedinAccountId: env.UNIPILE_LINKEDIN_ACCOUNT_ID })
        .onConflictDoNothing()
}
