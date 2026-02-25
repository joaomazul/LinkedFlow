import { db } from '@/db'
import { users } from '@/db/schema/users'
import { processCadenceForUser } from '@/lib/cadence/engine'
import { createLogger } from '@/lib/logger'

const log = createLogger('workers/cadence-worker')

export async function runCadenceWorker() {
    log.info('Iniciando worker de cadência')

    try {
        const allUsers = await db.select().from(users).limit(100)

        for (const user of allUsers) {
            await processCadenceForUser(user.id)
        }

        log.info('Worker de cadência finalizado')
    } catch (error: any) {
        log.error({ err: error.message }, 'Erro no worker de cadência')
    }
}
