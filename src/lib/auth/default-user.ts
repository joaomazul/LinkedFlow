import { db } from '@/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'

/**
 * Função utilitária para obter o ID do usuário padrão enquanto
 * o projeto não tem autenticação (NextAuth/Clerk).
 * Este usuário é criado pelo script de seed.
 */
export async function getDefaultUserId(): Promise<string> {
    const [defaultUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, 'default@linkedflow.app'))
        .limit(1)

    if (!defaultUser) {
        throw new Error('Usuário padrão não encontrado. Por favor, rode o script db:seed.')
    }

    return defaultUser.id
}
