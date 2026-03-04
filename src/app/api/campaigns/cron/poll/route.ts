import { runCampaignPoller } from '@/lib/workers/campaign-poller'
import { success, apiError } from '@/lib/utils/api-response'
import { env } from '@/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
    const authHeader = req.headers.get('Authorization')

    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return apiError('Não autorizado', 401)
    }

    if (process.env.WORKER_ENABLED === 'false') {
        return success({ status: 'Worker disabled via WORKER_ENABLED flag' })
    }

    try {
        await runCampaignPoller()
        return success({ status: 'Campaign poller completed' })
    } catch (err: any) {
        console.error('[Cron Poll Error]:', err)
        return apiError('Falha ao executar poller', 500)
    }
}
