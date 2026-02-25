import { neonSql as sql } from '@/db'

async function auditDatabase() {
  console.log('--- DATABASE AUDIT ---')

  try {
    // 1. Tables and column counts
    const tables = await sql`
      SELECT 
        tablename,
        (SELECT count(*) FROM information_schema.columns 
         WHERE table_name = t.tablename AND table_schema = 'public') as col_count
      FROM pg_tables t
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `
    console.log('\n1. TABLES:')
    console.table(tables)

    // 2. Indexes
    const indexes = await sql`
      SELECT indexname, tablename, indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname;
    `
    console.log('\n2. INDEXES:')
    console.table(indexes)

  } catch (error) {
    console.error('Audit failed:', error)
  } finally {
    process.exit(0)
  }
}

auditDatabase()
