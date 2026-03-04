import type { Config } from "@netlify/functions"

export default async () => {
    const siteUrl = process.env.URL || 'https://linkedstart2.netlify.app'
    const secret = process.env.CRON_SECRET
    if (!secret) { console.error('[cron-campaign-poll] CRON_SECRET not set'); return }

    try {
        const res = await fetch(`${siteUrl}/api/campaigns/cron/poll`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${secret}` },
        })
        const data = await res.json()
        console.log('[cron-campaign-poll]', res.status, data)
    } catch (err) {
        console.error('[cron-campaign-poll] Error:', err)
    }
}

export const config: Config = {
    schedule: "*/30 * * * *", // Every 30 minutes
}
