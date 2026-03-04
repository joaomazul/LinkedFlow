import type { Config } from "@netlify/functions"

export default async () => {
    const siteUrl = process.env.URL || 'https://linkedstart2.netlify.app'
    const secret = process.env.CRON_SECRET
    if (!secret) { console.error('[cron-run-cadence] CRON_SECRET not set'); return }

    try {
        const res = await fetch(`${siteUrl}/api/cron/run-cadence`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${secret}` },
        })
        const data = await res.json()
        console.log('[cron-run-cadence]', res.status, data)
    } catch (err) {
        console.error('[cron-run-cadence] Error:', err)
    }
}

export const config: Config = {
    schedule: "0 7 * * *", // Daily at 7am
}
