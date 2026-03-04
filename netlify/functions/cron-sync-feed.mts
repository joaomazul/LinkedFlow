import type { Config } from "@netlify/functions"

export default async () => {
    const siteUrl = process.env.URL || 'http://localhost:3000'
    const secret = process.env.CRON_SECRET || 'not-set'

    try {
        const res = await fetch(`${siteUrl}/api/cron/sync-feed`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${secret}` },
        })
        const data = await res.json()
        console.log('[cron-sync-feed]', res.status, data)
    } catch (err) {
        console.error('[cron-sync-feed] Error:', err)
    }
}

export const config: Config = {
    schedule: "0 */2 * * *", // Every 2 hours
}
