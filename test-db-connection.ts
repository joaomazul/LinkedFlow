const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL)

async function testDB() {
    console.log('Testando conexão com o Banco (Neon)...')
    try {
        const r = await sql`SELECT NOW() AT TIME ZONE 'America/Sao_Paulo' AS agora, current_database(), current_user`
        console.log('✓ Banco OK:', r[0].agora)
        console.log('✓ DB:', r[0].current_database)
        console.log('✓ User:', r[0].current_user)
    } catch (e) {
        console.error('✗ Banco FALHOU:', e.message)
        process.exit(1)
    } finally {
        process.exit(0)
    }
}

testDB()
