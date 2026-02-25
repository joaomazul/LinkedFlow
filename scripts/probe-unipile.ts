import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const apiKey = process.env.UNIPILE_API_KEY
const dsn = process.env.UNIPILE_DSN
const accountId = process.env.UNIPILE_LINKEDIN_ACCOUNT_ID

async function probe(path: string) {
    const url = `https://${dsn}/api/v1${path}`
    console.log(`Probing ${path}...`)
    try {
        const res = await fetch(url, {
            headers: { 'X-API-KEY': apiKey! }
        })
        const text = await res.text()
        console.log(`[${res.status}] ${path}: ${text.slice(0, 150)}`)
    } catch (e: any) {
        console.log(`Error ${path}: ${e.message}`)
    }
}

async function main() {
    await probe(`/posts?account_id=${accountId}&limit=1`)
    await probe(`/linkedin/posts?account_id=${accountId}&limit=1`)
    await probe(`/users/ACoAABOpCM8Ba2_A2J0eXSuR9T4PdAACr2Yz9lU/posts?account_id=${accountId}&limit=1`)
    await probe(`/users/rodrigovencefy/posts?account_id=${accountId}&limit=1`)
}

main()
