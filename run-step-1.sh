#!/bin/bash
echo "=== 1a. Build ==="
npm run build 2>&1 | tail -20

echo "=== 1b. TypeScript ==="
npx tsc --noEmit 2>&1

echo "=== 1c. Lint ==="
npx eslint src/ --ext .ts,.tsx --max-warnings 0 2>&1 | tail -20

echo "=== 1d. Variáveis presentes ==="
node -e "
require('dotenv').config({ path: '.env.local' })
const vars = ['DATABASE_URL','NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY','CLERK_SECRET_KEY',
  'UNIPILE_API_KEY','UNIPILE_DSN','UNIPILE_LINKEDIN_ACCOUNT_ID',
  'OPENROUTER_API_KEY','OPENROUTER_MODEL','CRON_SECRET','TZ']
const missing = vars.filter(v => !process.env[v])
const wrong = []
if (process.env.UNIPILE_DSN?.startsWith('https')) wrong.push('UNIPILE_DSN não deve ter https://')
if (process.env.UNIPILE_LINKEDIN_ACCOUNT_ID !== 'jM5Jc-smSYaYtbAwYXINCw') wrong.push('UNIPILE_LINKEDIN_ACCOUNT_ID incorreto: ' + process.env.UNIPILE_LINKEDIN_ACCOUNT_ID)
// Observe que a variável no .env.local foi modificada antes para NEXT_PUBLIC_UNIPILE_LINKEDIN_ACCOUNT_ID
// Vamos verificar ambas as chaves
if (!process.env.UNIPILE_LINKEDIN_ACCOUNT_ID && process.env.NEXT_PUBLIC_UNIPILE_LINKEDIN_ACCOUNT_ID === 'jM5Jc-smSYaYtbAwYXINCw') {
    // OK, usando NEXT_PUBLIC_
    wrong.pop()
}

if (process.env.TZ !== 'America/Sao_Paulo') wrong.push('TZ não é America/Sao_Paulo')
console.log('Ausentes:', missing.length ? missing : 'nenhuma')
console.log('Incorretas:', wrong.length ? wrong : 'nenhuma')
"

echo "=== 1e. Timezone do processo ==="
node -e "console.log('TZ:', Intl.DateTimeFormat().resolvedOptions().timeZone)"

echo "=== 1f. Banco de dados ==="
node -e "
const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL)
Promise.all([
  sql\`SHOW timezone\`,
  sql\`SELECT NOW() AT TIME ZONE 'America/Sao_Paulo' as sp\`,
  sql\`SELECT COUNT(*) as total FROM users\`,
  sql\`SELECT COUNT(*) as total FROM comment_styles\`,
  sql\`SELECT COUNT(*) as total FROM posts\`,
]).then(([tz, time, users, styles, posts]) => {
  console.log('Timezone banco:', tz[0].TimeZone)
  console.log('Hora SP:', time[0].sp)
  console.log('Usuários:', users[0].total, '| Estilos:', styles[0].total, '| Posts:', posts[0].total)
}).catch(e => console.error('BANCO ERRO:', e.message))
"

echo "=== 1g. Unipile ==="
node -e "
require('dotenv').config({ path: '.env.local' })
const key = process.env.UNIPILE_API_KEY
const dsn = process.env.UNIPILE_DSN
const accountId = process.env.UNIPILE_LINKEDIN_ACCOUNT_ID || process.env.NEXT_PUBLIC_UNIPILE_LINKEDIN_ACCOUNT_ID // suportando a env atualizada
console.log('DSN:', dsn)
console.log('AccountID:', accountId)
fetch('https://' + dsn + '/api/v1/accounts', {
  headers: { 'X-API-KEY': key },
  signal: AbortSignal.timeout(10000)
}).then(r => r.json()).then(d => {
  if (d.status >= 400 && d.title === 'Missing credentials') {
    console.error('✗ Conta NÃO autenticada com Unipile. Key inválida ou timeout?', d)
    return
  }
  const found = (d.items || []).find(a => a.id === accountId)
  if (found) console.log('✓ Conta encontrada | status:', found.status || 'ok')
  else {
    console.error('✗ Conta NÃO encontrada')
    console.log('IDs disponíveis:', (d.items||[]).map(a => a.id + ' (' + a.type + ')'))
  }
}).catch(e => console.error('✗ Unipile INACESSÍVEL:', e.message))
"

echo "=== 1h. OpenRouter ==="
node -e "
require('dotenv').config({ path: '.env.local' })
fetch('https://openrouter.ai/api/v1/models', {
  headers: { 'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY },
  signal: AbortSignal.timeout(8000)
}).then(r => {
  console.log('OpenRouter status:', r.status === 200 ? '✓ OK' : '✗ ' + r.status)
}).catch(e => console.error('✗ ERRO:', e.message))
"
