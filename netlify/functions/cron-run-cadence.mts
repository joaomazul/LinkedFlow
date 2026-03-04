import type { Config } from "@netlify/functions"

export default async () => {
    const siteUrl = process.env.URL || 'http://localhost:3000'
    const secret = process.env.CRON_SECRET || 'not-set'

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
