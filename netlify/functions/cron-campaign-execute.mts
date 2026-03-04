import type { Config } from "@netlify/functions"

export default async () => {
    const siteUrl = process.env.URL || 'http://localhost:3000'
    const secret = process.env.CRON_SECRET || 'not-set'

    try {
        const res = await fetch(`${siteUrl}/api/campaigns/cron/execute`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${secret}` },
        })
        const data = await res.json()
        console.log('[cron-campaign-execute]', res.status, data)
    } catch (err) {
        console.error('[cron-campaign-execute] Error:', err)
    }
}

export const config: Config = {
    schedule: "*/15 * * * *", // Every 15 minutes
}
