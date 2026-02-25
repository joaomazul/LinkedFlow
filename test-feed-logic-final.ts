const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })

const { db } = require('./src/db')
const { monitoredProfiles } = require('./src/db/schema/profiles')
const { appSettings } = require('./src/db/schema/settings')
const { getAccountPosts } = require('./src/lib/unipile/posts')
const { eq, and } = require('drizzle-orm')

async function simulateFeedRoute() {
    console.log('--- Simulando Lógica da Rota de Feed ---')
    // ID do usuário coletado no dump-settings anterior
    const userId = "cdab9fa4-69a6-4b97-b753-46cb553d779e"

    try {
        console.log('Buscando configurações para o usuário:', userId)
        const settings = await db.query.appSettings.findFirst({
            where: eq(appSettings.userId, userId)
        })

        const accountId = settings?.activeLinkedinAccountId || process.env.NEXT_PUBLIC_UNIPILE_LINKEDIN_ACCOUNT_ID
        console.log('Using Unipile Account ID:', accountId)

        if (!accountId) {
            console.error('ERROR: No accountId found')
            return
        }

        console.log('Buscando perfis ativos...')
        const activeProfiles = await db.select().from(monitoredProfiles).where(
            and(
                eq(monitoredProfiles.userId, userId),
                eq(monitoredProfiles.active, true)
            )
        )

        console.log('Active Profiles Count:', activeProfiles.length)

        if (activeProfiles.length === 0) {
            console.log('Result: Empty feed (no active profiles in DB)')
            return
        }

        for (const profile of activeProfiles) {
            console.log(`Fetching posts for profile: ${profile.name} (LinkedIn ID: ${profile.linkedinId})`)
            if (!profile.linkedinId) {
                console.warn(`WARNING: Profile ${profile.name} has no linkedinId. Skipping.`)
                continue
            }
            try {
                // O identifier esperado pelo Unipile /posts é o ID interno dele, não a URL
                const res = await getAccountPosts(accountId, profile.linkedinId, 5)
                console.log(`Success for ${profile.name}:`, res.items?.length || 0, 'posts returned from Unipile')
            } catch (err) {
                console.error(`Error for ${profile.name}:`, err.message)
            }
        }
    } catch (error) {
        console.error('Fatal Error during simulation:', error.message)
        console.error(error.stack)
    }
}

simulateFeedRoute().then(() => process.exit(0))
