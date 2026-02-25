import { db } from '../src/db/index'
import { sql } from 'drizzle-orm'

async function migrate() {
    console.log('Adicionando colunas de autor na tabela posts...')
    await db.execute(sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_name varchar(255)`)
    await db.execute(sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_headline varchar(500)`)
    await db.execute(sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_avatar_url varchar(2048)`)
    console.log('✓ Migration concluída')
    process.exit(0)
}

migrate().catch(e => {
    console.error('Migration falhou:', e.message)
    process.exit(1)
})
