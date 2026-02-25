import { db } from '../src/db'
import { monitoredProfiles } from '../src/db/schema'
import { resolveProfileByUrl } from '../src/lib/unipile/profiles'
import { eq } from 'drizzle-orm'

async function run() {
    console.log('Fetching profiles from DB...')
    const profiles = await db.select().from(monitoredProfiles)

    console.log(`Found ${profiles.length} profiles.`)
    for (const p of profiles) {
        console.log(`Updating ${p.linkedinUrl}...`)
        try {
            const resolved = await resolveProfileByUrl(p.linkedinUrl)

            // Generate initials if needed
            const nameParts = resolved.name.split(' ')
            const initials = nameParts.length > 1
                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                : resolved.name.slice(0, 2).toUpperCase()

            const cleanUrl = p.linkedinUrl.split('?')[0].replace(/\/$/, '')

            await db.update(monitoredProfiles).set({
                name: resolved.name,
                role: resolved.headline || '',
                avatarUrl: resolved.avatarUrl,
                followerCount: resolved.followerCount,
                publicIdentifier: resolved.publicIdentifier,
                linkedinProfileId: resolved.providerId,
                initials: initials,
                linkedinUrl: cleanUrl // normalize URL
            }).where(eq(monitoredProfiles.id, p.id))
            console.log(`✅ Updated ${resolved.name}`)
        } catch (err) {
            console.error(`❌ Failed ${p.linkedinUrl}:`, err)
        }
    }
    console.log('Done.')
    process.exit(0)
}

run()
