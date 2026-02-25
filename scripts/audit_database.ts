const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL)

async function audit() {
    console.log('--- LinkedFlow Database Audit ---')
    try {
        // 1. campaign_events
        const events = await sql`SELECT event_type, count(*) FROM campaign_events GROUP BY event_type`
        console.log('\n1. Campaign Events:')
        console.table(events)

        // 2. generated_posts
        const posts = await sql`SELECT count(*) FROM generated_posts WHERE status = 'published'`
        console.log('\n2. Published Posts:', posts[0].count)

        const scores = await sql`SELECT count(*) FROM generated_posts WHERE status = 'published' AND score_overall IS NOT NULL`
        console.log('   Posts with scores:', scores[0].count)

        // 3. User settings
        const settings = await sql`SELECT * FROM app_settings LIMIT 1`
        console.log('\n3. App Settings:', settings[0] || 'No settings found')

        // 4. Users
        const user = await sql`SELECT * FROM users LIMIT 1`
        console.log('\n4. Sample User:', user[0] || 'No users found')

    } catch (e) {
        console.error('✗ Audit failed:', e.message)
    } finally {
        process.exit(0)
    }
}

audit()
