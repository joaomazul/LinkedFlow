import { config } from 'dotenv'
config({ path: '.env.local' })
import('./update_existing_profiles.ts')
