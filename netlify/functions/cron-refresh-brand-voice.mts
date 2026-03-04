import type { Config } from "@netlify/functions"

export default async () => {
    const siteUrl = process.env.URL || 'https://linkedstart2.netlify.app'
    const secret = process.env.CRON_SECRET
    if (!secret) { console.error('[cron-refresh-brand-voice] CRON_SECRET not set'); return }

    try {
        const res = await fetch(`${siteUrl}/api/cron/refresh-brand-voice`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${secret}` },
        })
        const data = await res.json()
        console.log('[cron-refresh-brand-voice]', res.status, data)
    } catch (err) {
        console.error('[cron-refresh-brand-voice] Error:', err)
    }
}

export const config: Config = {
    schedule: "0 4 * * 0", // Weekly on Sunday at 4am
}
