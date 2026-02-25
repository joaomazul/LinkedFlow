import { config } from 'dotenv'
config({ path: '.env.local' })
import { resolveProfileByUrl } from '../src/lib/unipile/profiles'

async function tryResolve() {
    console.log('Testing Unipile API Resolution...')
    try {
        const result = await resolveProfileByUrl('https://www.linkedin.com/in/williamhgates/')
        console.log('Success:', result)
    } catch (e) {
        console.error('Failure:', e)
    }
}

tryResolve()
