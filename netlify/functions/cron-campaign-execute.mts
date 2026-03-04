import type { Config } from "@netlify/functions"

export default async () => {
    const siteUrl = process.env.URL || 'https://linkedstart2.netlify.app'
    const secret = process.env.CRON_SECRET
    if (!secret) { console.error('[cron-campaign-execute] CRON_SECRET not set'); return }

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
