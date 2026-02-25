import { config } from 'dotenv'
config({ path: '.env.local' })
import { db } from '../src/db'
import { posts } from '../src/db/schema/posts'

async function clean() {
    console.log('Deletando todos os posts para forçar um refetch limpo...')
    await db.delete(posts)
    console.log('Posts deletados com sucesso!')
    process.exit(0)
}

clean()
