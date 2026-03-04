import type { Config } from "@netlify/functions"

export default async () => {
    const siteUrl = process.env.URL || 'https://linkedstart2.netlify.app'
    const secret = process.env.CRON_SECRET
    if (!secret) { console.error('[cron-cleanup] CRON_SECRET not set'); return }

    try {
        const res = await fetch(`${siteUrl}/api/cron/cleanup`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${secret}` },
        })
        const data = await res.json()
        console.log('[cron-cleanup]', res.status, data)
    } catch (err) {
        console.error('[cron-cleanup] Error:', err)
    }
}

export const config: Config = {
    schedule: "0 3 * * 0", // Weekly on Sunday at 3am
}
