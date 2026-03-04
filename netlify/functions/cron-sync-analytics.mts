import type { Config } from "@netlify/functions"

export default async () => {
    const siteUrl = process.env.URL || 'https://linkedstart2.netlify.app'
    const secret = process.env.CRON_SECRET
    if (!secret) { console.error('[cron-sync-analytics] CRON_SECRET not set'); return }

    try {
        const res = await fetch(`${siteUrl}/api/cron/sync-analytics`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${secret}` },
        })
        const data = await res.json()
        console.log('[cron-sync-analytics]', res.status, data)
    } catch (err) {
        console.error('[cron-sync-analytics] Error:', err)
    }
}

export const config: Config = {
    schedule: "0 2 * * *", // Daily at 2am
}
